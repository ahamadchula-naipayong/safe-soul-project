/**
 * Digital Delivery & PDF Watermark Stamper Utility
 * Embeds personal customer credentials into digital E-books to discourage unauthorized redistribution
 */

export interface WatermarkOptions {
  customerEmail: string;
  customerName?: string;
  orderId: string;
  timestamp?: string;
}

export function generateWatermarkMetadata({ customerEmail, customerName, orderId, timestamp }: WatermarkOptions) {
  const dateStr = timestamp || new Date().toISOString().split('T')[0];
  const nameStr = customerName ? `${customerName} • ` : '';
  
  return {
    stampText: `ลิขสิทธิ์ฉบับเฉพาะ: ${nameStr}${customerEmail} | สั่งซื้อเมื่อ: ${dateStr} | รหัสคำสั่งซื้อ: ${orderId} | The Safe Soul Project (สงวนลิขสิทธิ์เฉพาะผู้สนับสนุน ห้ามทำซ้ำหรือเผยแพร่)`,
    securityHash: Buffer.from(`${customerEmail}-${orderId}-${dateStr}`).toString('base64').substring(0, 16),
  };
}
