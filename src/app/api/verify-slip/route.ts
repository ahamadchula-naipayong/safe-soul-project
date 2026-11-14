import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * EasySlip Automated Thai Bank Slip Verification Endpoint
 * Docs: https://developer.easyslip.com/
 * Set EASYSLIP_API_KEY in .env.local or Cloudflare Pages Environment Variables
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, expectedAmount } = body as {
      imageBase64?: string;
      expectedAmount?: number;
    };

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'กรุณาแนบไฟล์รูปสลิปโอนเงิน' },
        { status: 400 }
      );
    }

    const apiKey = process.env.EASYSLIP_API_KEY;

    // If EASYSLIP_API_KEY is not configured yet, return graceful fallback to manual admin verification
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        mode: 'manual_fallback',
        verified: false,
        message:
          'บันทึกสลิปเรียบร้อยแล้ว (โหมดรอแอดมินอนุมัติ — เมื่อตั้งค่า EASYSLIP_API_KEY ระบบจะตรวจสอบ QR สลิปอัตโนมัติทันที)',
      });
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const res = await fetch('https://developer.easyslip.com/api/v1/verify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: cleanBase64,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.status !== 200 || !data.data) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || 'ไม่พบข้อมูล QR Code บนสลิป หรือสลิปไม่ถูกต้อง',
        },
        { status: 400 }
      );
    }

    const slipAmount = Number(data.data?.amount?.amount || 0);
    const transRef = data.data?.transRef || '';

    if (expectedAmount && slipAmount < expectedAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `ยอดเงินในสลิป (฿${slipAmount}) น้อยกว่ายอดที่ต้องชำระ (฿${expectedAmount})`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: 'easyslip_auto',
      verified: true,
      transRef,
      slipAmount,
      slipData: data.data,
      message: 'ตรวจสอบสลิปผ่าน EasySlip สำเร็จ! อนุมัติสิทธิ์อัตโนมัติทันที',
    });
  } catch (error) {
    console.error('EasySlip verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบตรวจสลิป',
      },
      { status: 500 }
    );
  }
}
