import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { mockProducts } from '@/lib/supabase/mockData';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

const storeFilePath = path.join(process.cwd(), 'data', 'store_products.json');
const storeUploadDir = path.join(process.cwd(), 'public', 'uploads', 'store');

function saveProductImage(base64DataUrl: string, slug: string): string {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:')) {
    return base64DataUrl;
  }
  try {
    if (!fs.existsSync(storeUploadDir)) {
      fs.mkdirSync(storeUploadDir, { recursive: true });
    }
    const match = base64DataUrl.match(/^data:([A-Za-z0-9/+.-]+);base64,(.+)$/);
    if (!match) return '';
    const mime = match[1];
    const data = match[2];
    let ext = 'jpg';
    if (mime.includes('png')) ext = 'png';
    else if (mime.includes('webp')) ext = 'webp';

    const cleanSlug = (slug || 'item').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24) || 'item';
    const filename = `support-${cleanSlug}-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(storeUploadDir, filename), Buffer.from(data, 'base64'));
    return `/uploads/store/${filename}`;
  } catch (err) {
    console.error('Error saving store product image:', err);
    return '';
  }
}

function readProducts(): Product[] {
  try {
    if (!fs.existsSync(storeFilePath)) {
      const dir = path.dirname(storeFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const seeded: Product[] = mockProducts.map((p) => ({
        ...p,
        status: p.status || 'published',
        published_at: p.published_at || '2026-01-01T09:00',
      }));
      fs.writeFileSync(storeFilePath, JSON.stringify(seeded, null, 2), 'utf8');
      return seeded;
    }
    const raw = fs.readFileSync(storeFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading store_products.json:', error);
    return mockProducts.map((p) => ({ ...p, status: 'published' }));
  }
}

function writeProducts(products: Product[]) {
  const dir = path.dirname(storeFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(storeFilePath, JSON.stringify(products, null, 2), 'utf8');
}

function isProductLive(product: Product): boolean {
  if (product.is_active === false) return false;
  const status = product.status || 'published';
  if (status === 'published') return true;
  if (status === 'scheduled' && product.published_at) {
    return new Date(product.published_at).getTime() <= Date.now();
  }
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('publicOnly') === 'true';

    const allProducts = readProducts();

    if (publicOnly) {
      const visible = allProducts.filter(isProductLive);
      return NextResponse.json({
        success: true,
        total: visible.length,
        items: visible,
      });
    }

    return NextResponse.json({
      success: true,
      total: allProducts.length,
      counts: {
        all: allProducts.length,
        published: allProducts.filter((p) => (p.status || 'published') === 'published').length,
        scheduled: allProducts.filter((p) => p.status === 'scheduled').length,
        draft: allProducts.filter((p) => p.status === 'draft').length,
      },
      items: allProducts,
    });
  } catch (error) {
    console.error('GET /api/admin/store error:', error);
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถโหลดข้อมูลรายการ Safe for Support ได้' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageDataUrl, ...productInput } = body as Product & { imageDataUrl?: string };

    if (!productInput.title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุชื่อรายการสินค้า/ผลงานสนับสนุน' },
        { status: 400 }
      );
    }

    const products = readProducts();
    const slug =
      productInput.slug?.trim() ||
      `support-${Date.now()}`;

    let finalImageUrl = productInput.image_url || '';
    if (imageDataUrl) {
      const uploaded = saveProductImage(imageDataUrl, slug);
      if (uploaded) finalImageUrl = uploaded;
    }

    const status = productInput.status || 'published';
    const is_active = status !== 'draft';

    const existingIdx = products.findIndex((p) => p.id === productInput.id);

    const savedProduct: Product = {
      id: productInput.id || `prod-${Date.now()}`,
      slug,
      title: productInput.title.trim(),
      description: productInput.description?.trim() || '',
      type: productInput.type || 'physical',
      price_thb: Number(productInput.price_thb) || 0,
      compare_at_price_thb: productInput.compare_at_price_thb
        ? Number(productInput.compare_at_price_thb)
        : undefined,
      image_url:
        finalImageUrl ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      badge: productInput.badge?.trim() || '',
      stock_quantity: Number(productInput.stock_quantity ?? 100),
      digital_asset_url: productInput.digital_asset_url?.trim() || '',
      is_active,
      status,
      published_at:
        status === 'scheduled'
          ? productInput.published_at || new Date(Date.now() + 86400000).toISOString().slice(0, 16)
          : productInput.published_at || new Date().toISOString().slice(0, 16),
    };

    if (existingIdx !== -1) {
      products[existingIdx] = savedProduct;
    } else {
      products.unshift(savedProduct);
    }

    writeProducts(products);

    return NextResponse.json({
      success: true,
      item: savedProduct,
    });
  } catch (error) {
    console.error('POST /api/admin/store error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการบันทึกรายการ Safe for Support' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสรายการ' }, { status: 400 });
    }

    const products = readProducts();
    const filtered = products.filter((p) => p.id !== id);
    writeProducts(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/store error:', error);
    return NextResponse.json({ success: false, error: 'ลบรายการไม่สำเร็จ' }, { status: 500 });
  }
}
