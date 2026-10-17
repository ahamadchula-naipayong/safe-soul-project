import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tier,
      orderType,
      customerEmail,
      customerName,
      items,
      shippingAddress,
      priceId,
    } = body;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'กรุณาระบุอีเมลสำหรับรับใบเสร็จและลิขสิทธิ์' },
        { status: 400 }
      );
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await createCheckoutSession({
      customerEmail,
      customerName,
      tier,
      orderType: orderType || 'subscription',
      items,
      priceId,
      shippingAddress,
      successUrl: `${origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error: unknown) {
    console.error('Stripe Checkout Error:', error);
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้าง Checkout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
