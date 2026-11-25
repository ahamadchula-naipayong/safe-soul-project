import { Member, TierType } from '@/types';

export interface TieredEmailTemplate {
  tier: TierType;
  tierBadge: string;
  targetUpsellTier: string;
  subject: string;
  preheader: string;
  attachmentFilename: string;
  bodyText: string;
  bodyHtml: string;
}

export function getEbookEmailTemplateForTier(
  tier: TierType,
  member?: Partial<Member> | null
): TieredEmailTemplate {
  const memberName = member?.name || member?.username || 'สหายผู้ร่วมเดินทาง';
  const memberNum = member?.memberNumber ? `#${member.memberNumber}` : '#XXX';
  const memberEmail = member?.email || 'member@example.com';

  if (tier === 'free_tier_1') {
    const bodyText = `สลามุอะลัยกุมวะเราะฮฺมะตุลลอฮิ วะบะรอกาตุ
คุณ ${memberName} (Member ${memberNum} • เรือประมงน้ำตื้น)

ยินดีต้อนรับขึ้นสู่เรือครับ! ทีมงานได้แนบไฟล์ E-Book สิทธิ์ฟรีของคุณมาในอีเมลฉบับนี้เรียบร้อยแล้วครับ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📎 【ไฮไลท์ที่ 1: ไฟล์แนบ E-Book ของคุณในอีเมลนี้】
• ชื่อหนังสือ: เกราะพิทักษ์ฟิฏเราะฮฺ — ฉบับเกาะทะเลน้ำตื้น (PDF 73 หน้า)
• สิทธิ์การรับ: ฟรี ฿0 (จากปกติ ฿199) • จำกัด 1 ครั้งเฉพาะอีเมลที่สมัคร (${memberEmail})
• สำคัญ: ไม่มีปุ่มดาวน์โหลดบนหน้าเว็บ กรุณากดบันทึกไฟล์แนบเก็บไว้ในอุปกรณ์ของคุณทันที
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎧 【ไฮไลท์ที่ 2: สิทธิ์ที่คุณปลดล็อกแล้วบนเว็บไซต์】
✓ ฟังเสียงพอดแคสต์ "ทะเลน้ำตื้น" ครบทั้ง 7 เกาะ (จากเดิมฟังได้ 3 เกาะ)
✓ อ่านฟรี "บทที่ 1" ของหมู่เกาะทะเลน้ำลึก และข่าวหมวด West Asia ฉบับเต็ม
✓ เข้าร่วม Discord ห้อง Free (ทะเลน้ำตื้น 7 เกาะ & เสวนาทั่วไป)

👉 เข้า Discord & กดรับยศ Free อัตโนมัติ (1 คลิกที่หน้าบัตรสมาชิก):
• เข้าสู่ Discord Server: https://discord.gg/YMHttezcdr
• เชื่อมบัญชีรับยศอัตโนมัติ: https://thefitrahshield.hardynaipayong.cloud/login#discord-sanctuary

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌊 【ก้าวต่อไป: เมื่ออ่านน้ำตื้นจบ... อย่าหยุดแค่ริมชายฝั่ง】
เนื้อหา 7 เกาะแรกคือการฝึกอ่านคลื่นเบื้องต้น แต่พายุดุนยาของจริงซับซ้อนกว่านั้นมาก!

อัปเกรดขึ้นสู่ ⚓ 【เรือประมงน้ำลึก (Supporter)】 เพียง ฿199/เดือน (วันละ 6.6 บาท):
🔥 ปลดล็อก "ทะเลน้ำลึก 10 หมู่เกาะ (50 บท)" พร้อมเสียงบรรยายตอนใหม่ทุกสัปดาห์
🔥 อ่านบทวิเคราะห์เจาะลึกพิเศษ (Deepdive Analysis) ครบ 100% ทุกบทความ
🔥 เข้าห้องสนทนาผู้สนับสนุนบน Discord

👉 คลิกอัปเกรดขึ้นสู่เรือประมงน้ำลึกได้ที่นี่:
https://thefitrahshield.hardynaipayong.cloud/pricing?tier=supporter_tier_2#checkout-box
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ด้วยสลามและดุอาอฺ
ทีมงาน The Fitrah Shield`;

    const bodyHtml = `
<div style="font-family:'Prompt','Noto Sans Thai',sans-serif;max-width:620px;margin:0 auto;background:#07130E;color:#F5EFE0;padding:32px 24px;border-radius:20px;border:1px solid rgba(217,169,79,0.35);line-height:1.7;">
  <div style="font-size:18px;font-weight:700;color:#F3C969;margin-bottom:8px;">
    สลามุอะลัยกุมวะเราะฮฺมะตุลลอฮิ วะบะรอกาตุ
  </div>
  <p style="margin:0 0 16px 0;font-size:14px;color:#D6D0C2;">
    คุณ <strong style="color:#FFFFFF;">${memberName}</strong> (Member <strong style="color:#F3C969;">${memberNum}</strong> • เรือประมงน้ำตื้น)
  </p>
  <p style="margin:0 0 20px 0;font-size:15px;">
    ยินดีต้อนรับขึ้นสู่เรือครับ! ทีมงานได้แนบไฟล์ <strong>E-Book สิทธิ์ฟรี (จากปกติ ฿199 เป็น ฿0)</strong> มาพร้อมอีเมลฉบับนี้เรียบร้อยแล้วครับ
  </p>

  <div style="background:#0E261B;border-left:4px solid #D9A94F;padding:16px;border-radius:12px;margin-bottom:20px;">
    <div style="font-weight:700;color:#F3C969;font-size:14px;margin-bottom:6px;">
      📎 ไฮไลท์ที่ 1: ไฟล์แนบ E-Book ของคุณในอีเมลนี้
    </div>
    <ul style="margin:0;padding-left:18px;font-size:13.5px;color:#F5EFE0;">
      <li><strong>หนังสือ:</strong> เกราะพิทักษ์ฟิฏเราะฮฺ — ฉบับเกาะทะเลน้ำตื้น (PDF 73 หน้า)</li>
      <li><strong>สิทธิ์การรับ:</strong> จำกัด 1 ครั้งเฉพาะอีเมลสมาชิก (${memberEmail})</li>
      <li><span style="background:rgba(217,169,79,0.2);color:#F3C969;padding:1px 6px;border-radius:4px;font-weight:600;">สำคัญ:</span> ไม่มีปุ่มดาวน์โหลดบนหน้าเว็บ กรุณาบันทึกไฟล์แนบเก็บไว้ในอุปกรณ์ทันที</li>
    </ul>
  </div>

  <div style="background:#0B1E15;border:1px solid rgba(52,211,153,0.3);padding:14px 16px;border-radius:12px;margin-bottom:20px;font-size:13.5px;">
    <strong style="color:#34D399;">🎧 ไฮไลท์ที่ 2: สิทธิ์ที่คุณปลดล็อกแล้วบนเว็บไซต์ &amp; Discord</strong><br/>
    ✓ ฟังเสียงพอดแคสต์ <strong>"ทะเลน้ำตื้น" ครบทั้ง 7 เกาะ</strong><br/>
    ✓ อ่านฟรี <strong>"บทที่ 1"</strong> ของหมู่เกาะทะเลน้ำลึก และข่าว West Asia ฉบับเต็ม<br/>
    ✓ เข้าถึง <strong>Discord Sanctuary (ห้อง Free)</strong> — <a href="https://discord.gg/YMHttezcdr" style="color:#93C5FD;text-decoration:underline;">เข้าเซิร์ฟเวอร์</a> • <a href="https://thefitrahshield.hardynaipayong.cloud/login#discord-sanctuary" style="color:#F3C969;text-decoration:underline;">เชื่อมบัญชีรับยศอัตโนมัติ</a>
  </div>

  <div style="background:linear-gradient(135deg,#132C20 0%,#091711 100%);border:1px solid #D9A94F;padding:20px;border-radius:16px;margin-bottom:24px;">
    <div style="font-size:15px;font-weight:700;color:#F3C969;margin-bottom:8px;">
      🌊 ก้าวต่อไป: เมื่ออ่านน้ำตื้นจบ... อย่าหยุดแค่ริมชายฝั่ง
    </div>
    <p style="margin:0 0 12px 0;font-size:13.5px;color:#D6D0C2;">
      7 เกาะแรกคือการฝึกอ่านคลื่นเบื้องต้น อัปเกรดขึ้นสู่ <strong style="color:#38BDF8;">เรือประมงน้ำลึก (Supporter)</strong> เพียง <strong style="color:#F3C969;">฿199/เดือน</strong> (วันละ 6.6 บาท):
    </p>
    <div style="font-size:13.5px;margin-bottom:16px;color:#F5EFE0;">
      🔥 ปลดล็อก <strong>ทะเลน้ำลึก 10 หมู่เกาะ (50 บท)</strong> พร้อมเสียงบรรยายตอนใหม่ทุกสัปดาห์<br/>
      🔥 อ่านบทวิเคราะห์เจาะลึกพิเศษ (Deepdive Analysis) ครบ 100%<br/>
      🔥 เข้าร่วมห้องสนทนาผู้สนับสนุนบน Discord
    </div>
    <a href="https://thefitrahshield.hardynaipayong.cloud/pricing?tier=supporter_tier_2#checkout-box" style="display:inline-block;background:linear-gradient(90deg,#D9A94F,#F3C969);color:#06110B;font-weight:800;font-size:13.5px;padding:10px 20px;border-radius:10px;text-decoration:none;">
      ⚓ อัปเกรดขึ้นสู่เรือประมงน้ำลึก (฿199/เดือน) →
    </a>
  </div>

  <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;font-size:14px;color:#D6D0C2;">
    <div>ด้วยสลามและดุอาอฺ</div>
    <div style="font-weight:700;color:#F3C969;">ทีมงาน The Fitrah Shield</div>
  </div>
</div>`.trim();

    return {
      tier: 'free_tier_1',
      tierBadge: 'ระดับที่ 1: เรือประมงน้ำตื้น (Free Member)',
      targetUpsellTier: 'อัปเซลล์สู่ ระดับที่ 2: เรือประมงน้ำลึก (Supporter ฿199/เดือน)',
      subject: `[จัดส่ง E-Book 73 หน้า] เกราะพิทักษ์ฟิฏเราะฮฺ (ฉบับเกาะทะเลน้ำตื้น) สำหรับ Member ${memberNum}`,
      preheader:
        'รับไฟล์ PDF 73 หน้าในอีเมลนี้ พร้อมปลดล็อกเสียงพอดแคสต์ครบ 7 เกาะ และก้าวต่อไปสู่เรือประมงน้ำลึก',
      attachmentFilename: 'The_Fitrah_Shield_Openwater.pdf (73 หน้า)',
      bodyText,
      bodyHtml,
    };
  }

  if (tier === 'supporter_tier_2') {
    const bodyText = `สลามุอะลัยกุมวะเราะฮฺมะตุลลอฮิ วะบะรอกาตุ
คุณ ${memberName} (Member ${memberNum} • เรือประมงน้ำลึก Supporter)

ขอบพระคุณที่ร่วมขับเคลื่อนพันธกิจบนเรือประมงน้ำลึกครับ! ทีมงานได้แนบไฟล์ E-Book สิทธิ์ฟรีของคุณมาพร้อมอีเมลฉบับนี้แล้วครับ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📎 【ไฮไลท์ที่ 1: ไฟล์แนบ E-Book ของคุณในอีเมลนี้】
• ชื่อหนังสือ: เกราะพิทักษ์ฟิฏเราะฮฺ — ฉบับเกาะทะเลน้ำตื้น (PDF 73 หน้า)
• สิทธิ์การรับ: ฟรี ฿0 (จากปกติ ฿199) • จัดส่ง 1 ครั้งเฉพาะอีเมลสมาชิก (${memberEmail})
• สำคัญ: ไม่มีปุ่มดาวน์โหลดบนหน้าเว็บ กรุณาบันทึกไฟล์แนบเก็บไว้ในคลังส่วนตัวของคุณ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚓ 【ไฮไลท์ที่ 2: สิทธิ์ปัจจุบันของคุณบนเรือประมงน้ำลึก】
✓ อ่านและฟังเสียงพอดแคสต์ 7 เกาะน้ำตื้น + ทะเลน้ำลึกตอนใหม่ประจำสัปดาห์
✓ อ่านบทวิเคราะห์ Deepdive Analysis ของสำนักข่าว The Key of Return ครบ 100%
✓ รับยศ Member บน Discord (เข้าห้องทะเลน้ำลึก & ข่าว Deepdive)

👉 เข้า Discord & เชื่อมบัญชีรับยศ Member อัตโนมัติ:
• เข้าสู่ Discord Server: https://discord.gg/YMHttezcdr
• เชื่อมบัญชีรับยศอัตโนมัติ: https://thefitrahshield.hardynaipayong.cloud/login#discord-sanctuary

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 【ข้อเสนอพิเศษ: ข้ามทุกการรอคอยรายสัปดาห์ สู่ระดับสูงสุดตลอดชีพ】
ต้องการปลดล็อกแผนที่ทั้งมหาสมุทร "ครบ 10 หมู่เกาะ (50 บท + 50 ไฟล์เสียง)" ทันทีโดยไม่ต้องรอรอบสัปดาห์ และไม่ต้องจ่ายรายเดือนอีกต่อไปใช่ไหมครับ?

อัปเกรดสู่ 🚢 【เรือสำราญทุกมรสุม (Founding 100 Lifetime)】 (฿3,990 จ่ายครั้งเดียวตลอดชีพ):
🔥 ปลดล็อกบทความและเสียงบรรยายครบทั้ง 50 บทในทะเลน้ำลึกทันที 100%!
📚 รับสิทธิ์จองล่วงหน้าฟรี! "E-Book ฉบับทะเลน้ำลึก 10 หมู่เกาะ" (Coming Soon) ส่งตรงเข้าอีเมลนี้ทันทีที่เปิดตัว
🎁 รับยศสีทอง Founding Member ใน Discord + ส่วนลด Merch 20% ถาวรทุกชิ้น

👉 อัปเกรดเป็น Founding 100 ก่อนโควตา 100 ท่านเต็มได้ที่:
https://thefitrahshield.hardynaipayong.cloud/pricing?tier=founding_tier_3#checkout-box
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ด้วยสลามและดุอาอฺ
ทีมงาน The Fitrah Shield`;

    const bodyHtml = `
<div style="font-family:'Prompt','Noto Sans Thai',sans-serif;max-width:620px;margin:0 auto;background:#07130E;color:#F5EFE0;padding:32px 24px;border-radius:20px;border:1px solid rgba(56,189,248,0.4);line-height:1.7;">
  <div style="font-size:18px;font-weight:700;color:#F3C969;margin-bottom:8px;">
    สลามุอะลัยกุมวะเราะฮฺมะตุลลอฮิ วะบะรอกาตุ
  </div>
  <p style="margin:0 0 16px 0;font-size:14px;color:#D6D0C2;">
    คุณ <strong style="color:#FFFFFF;">${memberName}</strong> (Member <strong style="color:#38BDF8;">${memberNum}</strong> • เรือประมงน้ำลึก Supporter)
  </p>
  <p style="margin:0 0 20px 0;font-size:15px;">
    ขอบพระคุณที่ร่วมขับเคลื่อนพันธกิจบนเรือประมงน้ำลึกครับ! ทีมงานได้แนบไฟล์ <strong>E-Book สิทธิ์ฟรี (73 หน้า)</strong> มาพร้อมอีเมลฉบับนี้แล้วครับ
  </p>

  <div style="background:#0E261B;border-left:4px solid #38BDF8;padding:16px;border-radius:12px;margin-bottom:20px;">
    <div style="font-weight:700;color:#38BDF8;font-size:14px;margin-bottom:6px;">
      📎 ไฮไลท์ที่ 1: ไฟล์แนบ E-Book ของคุณในอีเมลนี้
    </div>
    <ul style="margin:0;padding-left:18px;font-size:13.5px;color:#F5EFE0;">
      <li><strong>หนังสือ:</strong> เกราะพิทักษ์ฟิฏเราะฮฺ — ฉบับเกาะทะเลน้ำตื้น (PDF 73 หน้า)</li>
      <li><strong>สิทธิ์การรับ:</strong> จัดส่ง 1 ครั้งเฉพาะอีเมลสมาชิก (${memberEmail}) • กรุณาบันทึกไฟล์แนบเก็บไว้ทันที</li>
      <li><strong>Discord Member:</strong> <a href="https://discord.gg/YMHttezcdr" style="color:#93C5FD;text-decoration:underline;">เข้าเซิร์ฟเวอร์ Discord</a> • <a href="https://thefitrahshield.hardynaipayong.cloud/login#discord-sanctuary" style="color:#F3C969;text-decoration:underline;">กดรับยศ Member อัตโนมัติ</a></li>
    </ul>
  </div>

  <div style="background:linear-gradient(135deg,#182616 0%,#0B1710 100%);border:1px solid #D9A94F;padding:20px;border-radius:16px;margin-bottom:24px;">
    <div style="font-size:15px;font-weight:700;color:#F3C969;margin-bottom:8px;">
      👑 ข้ามทุกการรอคอยรายสัปดาห์ สู่ Founding 100 ตลอดชีพ
    </div>
    <p style="margin:0 0 12px 0;font-size:13.5px;color:#D6D0C2;">
      อัปเกรดสู่ <strong style="color:#F3C969;">เรือสำราญทุกมรสุม (Founding 100 Lifetime • ฿3,990 ครั้งเดียวจบ)</strong> เพื่อรับเอกสิทธิ์สูงสุดทันที:
    </p>
    <div style="font-size:13.5px;margin-bottom:16px;color:#F5EFE0;">
      🔥 ปลดล็อกบทความและเสียงพอดแคสต์ครบทั้ง <strong>10 หมู่เกาะน้ำลึก (50 บท) ทันที 100%</strong> ไม่ต้องรอรอบสัปดาห์!<br/>
      📚 <strong>รับสิทธิ์จองฟรี! E-Book ฉบับทะเลน้ำลึก (Coming Soon)</strong> ส่งตรงเข้าอีเมลนี้ทันทีที่เปิดตัว<br/>
      🎁 ยศ Founding Member ใน Discord + ส่วนลด Official Merch 20% ถาวร
    </div>
    <a href="https://thefitrahshield.hardynaipayong.cloud/pricing?tier=founding_tier_3#checkout-box" style="display:inline-block;background:linear-gradient(90deg,#D9A94F,#F3C969);color:#06110B;font-weight:800;font-size:13.5px;padding:10px 20px;border-radius:10px;text-decoration:none;">
      👑 อัปเกรดเป็น Founding 100 ตลอดชีพ →
    </a>
  </div>

  <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;font-size:14px;color:#D6D0C2;">
    <div>ด้วยสลามและดุอาอฺ</div>
    <div style="font-weight:700;color:#F3C969;">ทีมงาน The Fitrah Shield</div>
  </div>
</div>`.trim();

    return {
      tier: 'supporter_tier_2',
      tierBadge: 'ระดับที่ 2: เรือประมงน้ำลึก (Supporter ฿199/เดือน)',
      targetUpsellTier: 'อัปเซลล์สู่ ระดับที่ 3: เรือสำราญทุกมรสุม (Founding 100 Lifetime ฿3,990)',
      subject: `[จัดส่ง E-Book 73 หน้า] ขอบคุณผู้สนับสนุนเรือประมงน้ำลึก (Member ${memberNum})`,
      preheader:
        'รับไฟล์ E-Book 73 หน้า พร้อมสิทธิ์พิเศษก้าวขึ้นสู่เรือสำราญทุกมรสุม (Founding 100 ตลอดชีพ)',
      attachmentFilename: 'The_Fitrah_Shield_Openwater.pdf (73 หน้า)',
      bodyText,
      bodyHtml,
    };
  }

  // Tier 3: Founding 100 Lifetime
  const bodyText = `สลามุอะลัยกุมวะเราะฮฺมะตุลลอฮิ วะบะรอกาตุ
คุณ ${memberName} (ผู้ร่วมก่อตั้ง Founding 100 • Member ${memberNum})

ขอขอบพระคุณจากหัวใจที่ท่านร่วมเป็น 1 ใน 100 ผู้ร่วมก่อตั้งบน "เรือสำราญทุกมรสุม" ครับ! ทีมงานได้แนบไฟล์ E-Book เล่มที่ 1 มาพร้อมอีเมลฉบับนี้เรียบร้อยแล้วครับ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📎 【ไฮไลท์ที่ 1: ไฟล์แนบ E-Book ของท่านในอีเมลนี้】
• ชื่อหนังสือ: เกราะพิทักษ์ฟิฏเราะฮฺ — ฉบับเกาะทะเลน้ำตื้น (PDF 73 หน้า)
• สถานะ: จัดส่งเฉพาะทางอีเมลผู้ร่วมก่อตั้ง (${memberEmail}) จำกัด 1 ครั้ง กรุณาบันทึกไฟล์แนบเก็บไว้ในอุปกรณ์ของท่าน
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👑 【ไฮไลท์ที่ 2: ยืนยันเอกสิทธิ์สูงสุด Founding 100 ของท่าน】
✓ ปลดล็อกบทความและเสียงพอดแคสต์ครบทุกน่านน้ำ (7 เกาะน้ำตื้น + 10 หมู่เกาะน้ำลึก 50 บท + ข่าว Deepdive ทั้งหมด) ตลอดชีพ 100%
✓ 【ยืนยันสิทธิ์รับฟรี! E-Book ฉบับทะเลน้ำลึก 10 หมู่เกาะ (Coming Soon)】: ทันทีที่ต้นฉบับมาสเตอร์เสร็จสมบูรณ์ ระบบจะจัดส่งเข้าอีเมล ${memberEmail} ของท่านโดยอัตโนมัติทันที
✓ รับส่วนลด 20% ถาวรสำหรับสินค้า Official Merch ทุกชิ้นในหน้าร้านค้า Safe for Support
✓ รับยศ Member + ยศสีทอง Founding 100 บน Discord Sanctuary

👉 เข้าสู่คลังสัมภาระบนเรือ, Discord และร้านค้าผู้ร่วมก่อตั้งได้ที่:
• คลังสัมภาระสมาชิก: https://thefitrahshield.hardynaipayong.cloud/portal
• เข้า Discord & รับยศสีทอง Founding 100: https://discord.gg/YMHttezcdr (เชื่อมบัญชีที่ https://thefitrahshield.hardynaipayong.cloud/login#discord-sanctuary)
• ร้านค้า Safe for Support: https://thefitrahshield.hardynaipayong.cloud/store
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ด้วยสลามและดุอาอฺ
ทีมงาน The Fitrah Shield`;

  const bodyHtml = `
<div style="font-family:'Prompt','Noto Sans Thai',sans-serif;max-width:620px;margin:0 auto;background:#07130E;color:#F5EFE0;padding:32px 24px;border-radius:20px;border:2px solid #D9A94F;line-height:1.7;">
  <div style="font-size:18px;font-weight:700;color:#F3C969;margin-bottom:8px;">
    สลามุอะลัยกุมวะเราะฮฺมะตุลลอฮิ วะบะรอกาตุ
  </div>
  <p style="margin:0 0 16px 0;font-size:14px;color:#D6D0C2;">
    คุณ <strong style="color:#FFFFFF;">${memberName}</strong> (ผู้ร่วมก่อตั้ง Founding 100 • Member <strong style="color:#F3C969;">${memberNum}</strong>)
  </p>
  <p style="margin:0 0 20px 0;font-size:15px;">
    ขอขอบพระคุณจากหัวใจที่ท่านร่วมเป็น 1 ใน 100 ผู้ร่วมก่อตั้งบน <strong>"เรือสำราญทุกมรสุม"</strong> ครับ! ทีมงานได้แนบไฟล์ E-Book เล่มที่ 1 มาพร้อมอีเมลฉบับนี้เรียบร้อยแล้วครับ
  </p>

  <div style="background:#0E261B;border-left:4px solid #F3C969;padding:16px;border-radius:12px;margin-bottom:20px;">
    <div style="font-weight:700;color:#F3C969;font-size:14px;margin-bottom:6px;">
      📎 ไฮไลท์ที่ 1: ไฟล์แนบ E-Book ของท่านในอีเมลนี้
    </div>
    <ul style="margin:0;padding-left:18px;font-size:13.5px;color:#F5EFE0;">
      <li><strong>หนังสือ:</strong> เกราะพิทักษ์ฟิฏเราะฮฺ — ฉบับเกาะทะเลน้ำตื้น (PDF 73 หน้า)</li>
      <li><strong>สถานะ:</strong> จัดส่งเฉพาะอีเมลผู้ร่วมก่อตั้ง (${memberEmail}) กรุณาบันทึกไฟล์แนบเก็บไว้ในอุปกรณ์ของท่าน</li>
    </ul>
  </div>

  <div style="background:linear-gradient(135deg,#1F2814 0%,#0B1710 100%);border:1px solid #D9A94F;padding:20px;border-radius:16px;margin-bottom:24px;">
    <div style="font-size:15px;font-weight:700;color:#F3C969;margin-bottom:8px;">
      👑 ไฮไลท์ที่ 2: ยืนยันเอกสิทธิ์สูงสุด Founding 100 ตลอดชีพ
    </div>
    <div style="font-size:13.5px;margin-bottom:16px;color:#F5EFE0;">
      ✓ ปลดล็อกบทความและเสียงบรรยายครบทุกน่านน้ำ (<strong>7 เกาะน้ำตื้น + 50 บทน้ำลึก + ข่าว Deepdive</strong>) 100% ตลอดชีพ<br/>
      ✓ <span style="background:rgba(217,169,79,0.25);color:#F3C969;padding:1px 6px;border-radius:4px;font-weight:700;">ยืนยันสิทธิ์รับฟรี!</span> <strong>E-Book ฉบับทะเลน้ำลึก 10 หมู่เกาะ (Coming Soon)</strong> ส่งตรงเข้าอีเมลนี้ทันทีที่เปิดตัว<br/>
      ✓ ส่วนลดถาวร <strong>20% สำหรับ Official Merch ทุกชิ้น</strong> ใน Safe for Support<br/>
      ✓ <strong>ยศ Member + ยศสีทอง Founding 100</strong> ใน Discord Sanctuary (<a href="https://discord.gg/YMHttezcdr" style="color:#93C5FD;text-decoration:underline;">เข้าเซิร์ฟเวอร์</a> • <a href="https://thefitrahshield.hardynaipayong.cloud/login#discord-sanctuary" style="color:#F3C969;text-decoration:underline;">เชื่อมบัญชีรับยศสีทอง</a>)
    </div>
    <a href="https://thefitrahshield.hardynaipayong.cloud/portal" style="display:inline-block;background:linear-gradient(90deg,#D9A94F,#F3C969);color:#06110B;font-weight:800;font-size:13.5px;padding:10px 20px;border-radius:10px;text-decoration:none;">
      ⚓ สำรวจคลังสัมภาระบนเรือ (Portal) →
    </a>
  </div>

  <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;font-size:14px;color:#D6D0C2;">
    <div>ด้วยสลามและดุอาอฺ</div>
    <div style="font-weight:700;color:#F3C969;">ทีมงาน The Fitrah Shield</div>
  </div>
</div>`.trim();

  return {
    tier: 'founding_tier_3',
    tierBadge: 'ระดับที่ 3: เรือสำราญทุกมรสุม (Founding 100 Lifetime)',
    targetUpsellTier: 'ระดับสูงสุด (VIP Retention + ยืนยันสิทธิ์รับ E-Book น้ำลึก Coming Soon & Merch 20% Off)',
    subject: `[VIP Founding 100 • Member ${memberNum}] จัดส่ง E-Book ฉบับเกาะทะเลน้ำตื้น (73 หน้า) และยืนยันสิทธิ์จอง E-Book น้ำลึก`,
    preheader:
      'ไฟล์ PDF 73 หน้าสำหรับผู้ร่วมก่อตั้ง พร้อมยืนยันสิทธิ์รับ E-Book ฉบับทะเลน้ำลึก (Coming Soon) ทันทีที่เปิดตัว',
    attachmentFilename: 'The_Fitrah_Shield_Openwater.pdf (73 หน้า)',
    bodyText,
    bodyHtml,
  };
}
