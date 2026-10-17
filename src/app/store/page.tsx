'use client';

import React, { useState } from 'react';
import { mockProducts } from '@/lib/supabase/mockData';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import {
  ShoppingBag,
  Sparkles,
  FileCheck,
  Truck,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function StorePage() {
  const [filter, setFilter] = useState<'all' | 'digital' | 'physical'>('all');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const { addToCart } = useCart();

  const filteredProducts = mockProducts.filter((product) => {
    if (filter === 'all') return true;
    return product.type === filter;
  });

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: Product) => {
    const size = product.slug.includes('tee') ? selectedSizes[product.id] || 'L' : undefined;
    addToCart(product, 1, size);
  };

  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-deep/80 border border-gold/30 text-gold-light text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
            <span>Digital Assets & Official Merch</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-black text-parchment-cream">
            The Safe Soul Store & Merchandise
          </h1>

          <p className="text-sm sm:text-base text-parchment-muted max-w-xl mx-auto leading-relaxed">
            คลังผลิตภัณฑ์ดิจิทัลพร้อมการประทับตราลิขสิทธิ์ และสินค้า Physical Merch โทนสี Deep Emerald & Warm Gold ออกแบบอย่างประณีต
          </p>

          {/* Filter Tabs */}
          <div className="pt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-gold-gradient text-slate-abyss font-bold shadow-gold-sm'
                  : 'bg-emerald-surface hover:bg-emerald-light text-parchment-muted'
              }`}
            >
              สินค้าทั้งหมด ({mockProducts.length})
            </button>
            <button
              onClick={() => setFilter('digital')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                filter === 'digital'
                  ? 'bg-gold-gradient text-slate-abyss font-bold shadow-gold-sm'
                  : 'bg-emerald-surface hover:bg-emerald-light text-parchment-muted'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Digital Products (E-book / Audio)</span>
            </button>
            <button
              onClick={() => setFilter('physical')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                filter === 'physical'
                  ? 'bg-gold-gradient text-slate-abyss font-bold shadow-gold-sm'
                  : 'bg-emerald-surface hover:bg-emerald-light text-parchment-muted'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Physical Merch (เสื้อ, หมวก, ร่ม)</span>
            </button>
          </div>
        </div>

        {/* Digital Watermark Notice Banner */}
        <div className="max-w-4xl mx-auto rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-emerald-card to-slate-card border border-gold/30 flex items-center gap-4 text-xs">
          <div className="w-10 h-10 rounded-xl bg-gold-warm/20 border border-gold/40 flex items-center justify-center text-gold-light shrink-0">
            <FileCheck className="w-5 h-5 text-gold-warm" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-parchment-cream">
              ระบบรักษาความปลอดภัย Digital Watermark Protection
            </h4>
            <p className="text-parchment-muted">
              สำหรับสินค้า E-book ทุกเล่ม ระบบจะประทับตราอีเมลของผู้ซื้อและรหัสยืนยันลงบนหัวกระดาษของไฟล์ PDF ทันทีหลังชำระเงินเรียบร้อย
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group rounded-3xl bg-emerald-card/70 border border-emerald-border/80 hover:border-gold/50 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-gold-sm transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] w-full bg-black overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-85 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-dark/80 via-transparent to-transparent" />

                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-gold-gradient text-slate-abyss text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    {product.badge}
                  </span>
                )}

                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-parchment-light uppercase">
                  {product.type === 'digital' ? '⚡ ดิจิทัล' : '📦 จัดส่งถึงบ้าน'}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-parchment-cream group-hover:text-gold-light transition line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-xs text-parchment-muted mt-2 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Size selection if T-shirt */}
                  {product.slug.includes('tee') && (
                    <div className="mt-4 pt-3 border-t border-emerald-border/40">
                      <span className="text-[11px] font-semibold text-parchment-muted block mb-1.5">
                        เลือกไซส์:
                      </span>
                      <div className="flex gap-2">
                        {['S', 'M', 'L', 'XL', '2XL'].map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSizeChange(product.id, size)}
                            className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition ${
                              (selectedSizes[product.id] || 'L') === size
                                ? 'bg-gold-gradient text-slate-abyss shadow-gold-sm'
                                : 'bg-emerald-surface hover:bg-emerald-light text-parchment-muted'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing & Add to cart button */}
                <div className="pt-4 border-t border-emerald-border/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-parchment-muted block">ราคา</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-mono font-bold text-gold-light">
                        ฿{product.price_thb.toLocaleString()}
                      </span>
                      {product.compare_at_price_thb && (
                        <span className="text-xs font-mono text-parchment-muted/50 line-through">
                          ฿{product.compare_at_price_thb.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="px-4 py-2.5 rounded-xl bg-gold-gradient text-slate-abyss font-bold text-xs hover:brightness-110 active:scale-95 shadow-gold-sm transition flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 fill-current" />
                    <span>เพิ่มลงตะกร้า</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
