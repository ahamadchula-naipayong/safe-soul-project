'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Users,
  ShoppingBag,
  Headphones,
  ShieldCheck,
  Cloud,
  Mail,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function AdminGuidePage() {
  return (
    <div className="min-h-screen bg-slate-dark text-parchment-cream py-12 px-4 sm:px-6 lg:px-8 font-thai">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-gold/30 pb-6 space-y-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-gold-warm hover:text-gold-light transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่แผงควบคุมระบบ (Admin Control)</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-warm/15 border border-gold-warm/40 text-gold-light text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
            <span>OFFICIAL ADMIN & CO-ADMIN HANDBOOK</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-thai-serif font-black text-parchment-cream">
            คู่มือการปรับแต่งเว็บไซต์ การจัดการระบบ และการเพิ่ม Co-Admin
          </h1>
          <p className="text-sm text-parchment-muted font-light leading-relaxed">
            คู่มือฉบับสมบูรณ์สำหรับผู้ดูแลระบบหลัก (Admin) และผู้ดูแลร่วม (Co-Admin) ของโครงการ{' '}
            <strong className="text-gold-light">เกราะพิทักษ์ฟิฏเราะฮฺ (THE FITRAH SHIELD)</strong>
          </p>
        </div>

        {/* Section 1: Adding & Managing Co-Admins */}
        <section className="luxury-glass rounded-3xl p-6 sm:p-8 space-y-5 border border-gold-warm/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-thai-serif font-bold text-gold-light">
                1. วิธีเพิ่มและกำหนดสิทธิ์ Co-Admin (ผู้ดูแลระบบร่วม)
              </h2>
              <p className="text-xs text-parchment-muted">
                แบ่งเป็น 3 ระดับตามขอบเขตงานที่ต้องการมอบหมายให้ทีมงานช่วยดูแล
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-black/50 border border-emerald-border space-y-2">
              <div className="font-bold text-cyan-300 text-sm">
                1.1 เพิ่ม Co-Admin บนหน้าเว็บหลังบ้าน
              </div>
              <p className="text-parchment-muted leading-relaxed">
                สำหรับทีมงานที่ช่วยเขียนบทความ ตั้งเวลาปล่อยเนื้อหา จัดการสินค้า หรือตรวจสลิปโอนเงิน:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-parchment-cream/90">
                <li>
                  ไปที่หน้า{' '}
                  <Link href="/admin/members" className="text-gold-warm underline">
                    ตารางจัดการสมาชิก (/admin/members)
                  </Link>
                </li>
                <li>คลิกปุ่ม &ldquo;+ เพิ่มสมาชิกใหม่&rdquo; หรือกดไอคอนแก้ไข (ดินสอ) ที่บัญชีทีมงาน</li>
                <li>
                  ในช่อง <strong>&ldquo;สิทธิ์การจัดการระบบหลังบ้าน (Role)&rdquo;</strong> เลือกเป็น{' '}
                  <strong className="text-cyan-300">ผู้ดูแลร่วม (Co-Admin)</strong>
                </li>
                <li>กดบันทึก — บัญชีนั้นจะมีป้ายกำกับ Co-Admin ทันที</li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-emerald-border space-y-2">
              <div className="font-bold text-gold-light text-sm">
                1.2 เพิ่ม Co-Admin บน Cloudflare
              </div>
              <p className="text-parchment-muted leading-relaxed">
                สำหรับทีมเทคนิคที่ช่วยดูแลโดเมน, Cloudflare Pages, R2 Audio Storage และฐานข้อมูล D1:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-parchment-cream/90">
                <li>เข้าสู่ระบบที่ dash.cloudflare.com</li>
                <li>ไปที่เมนู Manage Account &rarr; Members</li>
                <li>คลิกปุ่ม Invite &rarr; กรอกอีเมลของ Co-Admin</li>
                <li>
                  เลือก Role เป็น <strong>Administrator</strong> (หรือ Cloudflare Pages + R2 Admin)
                </li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-emerald-border space-y-2">
              <div className="font-bold text-emerald-300 text-sm">
                1.3 เพิ่ม Co-Admin บน GitHub Repo
              </div>
              <p className="text-parchment-muted leading-relaxed">
                สำหรับนักพัฒนาที่ช่วยแก้ไขโค้ดและอัปเดตระบบผ่าน GitHub:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-parchment-cream/90">
                <li>เปิดหน้า Repository บน GitHub</li>
                <li>ไปที่ Settings &rarr; Collaborators &rarr; Add people</li>
                <li>กรอก GitHub Username หรืออีเมลของทีมงาน</li>
                <li>ทุกครั้งที่ Co-Admin กด Push โค้ด เว็บจะอัปเดตอัตโนมัติ</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Section 2: Managing Articles & 10 Deep Ocean Archipelagos */}
        <section className="luxury-glass rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-surface border border-gold/40 flex items-center justify-center text-gold-warm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                2. การจัดการบทความ 57 เกาะ และลำดับ 10 หมู่เกาะทะเลน้ำลึก
              </h2>
              <p className="text-xs text-parchment-muted">
                จัดการผ่านหน้า{' '}
                <Link href="/admin/articles" className="text-gold-warm underline">
                  /admin/articles
                </Link>{' '}
                ได้ตลอดเวลาโดยไม่ต้องแก้โค้ด
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-parchment-cream/90 leading-relaxed">
            <p>
              ระบบแบ่งคลังบทความในหน้า <strong>Safe for Journey (/journey)</strong> ออกเป็น 2 เขตน่านน้ำ:
            </p>
            <ul className="space-y-2 pl-4 list-disc">
              <li>
                <strong className="text-emerald-300">ทะเลน้ำตื้น (7 เกาะเปิด):</strong> มีไฟล์เสียงเกาะละ 2 ตอน (Part 1 และ Part 2) พร้อมระบบเล่นต่อเนื่องอัตโนมัติ (ผู้ไม่ล็อกอินฟังได้ 3 เกาะแรก / สมาชิกฟรีฟังได้ครบ 7 เกาะ)
              </li>
              <li>
                <strong className="text-cyan-300">ทะเลน้ำลึก (10 หมู่เกาะ • หมู่เกาะละ 5 บท = 50 บท):</strong>{' '}
                เรียงลำดับตามโครงสร้างมาตรฐาน 1–10 ดังนี้:
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 p-3.5 rounded-2xl bg-black/50 border border-emerald-border font-mono text-xs">
                  <div>1. Island1Dunya — Safe from the Dunya (ปลอดภัยจากดุนยา)</div>
                  <div>2. Island2Haram — Safe from the Haram (ปลอดภัยจากฮะรอม)</div>
                  <div>3. Island3Nafsu — Safe from the Nafsu (ปลอดภัยจากนัฟซู)</div>
                  <div>4. Island4Rizq — Safe for the Rizq (ปลอดภัยในริซกี)</div>
                  <div>5. Island5Hijab — Safe for the Hijab (ปลอดภัยในฮิญาบ)</div>
                  <div>6. Island6Hype — Safe from the Hype (ปลอดภัยจากกระแสลวง)</div>
                  <div>7. Island7FakeIdol — Safe from the Fake Idol (ปลอดภัยจากไอดอลจอมปลอม)</div>
                  <div>8. Island8Shirk — Safe from the Shirk (ปลอดภัยจากชิริก)</div>
                  <div>9. Island9ShiaBeing — Safe for the Shia Being (ปลอดภัยในความเป็นชีอะฮ์)</div>
                  <div>10. Island10Barzakh — Safe for the Barzakh (ปลอดภัยในบัรซัค)</div>
                </div>
              </li>
            </ul>

            <div className="p-4 rounded-2xl bg-gold-warm/10 border border-gold-warm/30 text-xs space-y-1.5">
              <div className="font-bold text-gold-light flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-gold-warm" />
                <span>การตั้งค่าสถานะบทความ (Draft / ตั้งเวลาปล่อยรายสัปดาห์ / เผยแพร่ทันที):</span>
              </div>
              <p className="text-parchment-muted">
                ในหน้า <Link href="/admin/articles" className="text-gold-warm underline">/admin/articles</Link>{' '}
                เมื่อคลิก <strong>&ldquo;แก้ไขเนื้อหา&rdquo;</strong> ที่บทใดก็ตาม คุณสามารถเลือกสถานะเป็น{' '}
                <strong>ฉบับร่าง (Draft)</strong>, <strong>ตั้งเวลาเผยแพร่ (Scheduled)</strong> พร้อมระบุวันที่ปล่อยบทความรายสัปดาห์สำหรับสมาชิกเรือประมงน้ำลึก หรือเลือก{' '}
                <strong>เผยแพร่แล้ว (Published)</strong> ได้ทันที (สมาชิก Founding 100 จะสามารถอ่านและฟังล่วงหน้าได้ครบทุกบทเสมอ)
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Store & E-Book Email Delivery */}
        <section className="luxury-glass rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-surface border border-gold/40 flex items-center justify-center text-gold-warm">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                3. การจัดการ Safe for Support & ระบบส่ง E-Book ทางอีเมล
              </h2>
              <p className="text-xs text-parchment-muted">
                จัดการสินค้าผ่านหน้า{' '}
                <Link href="/admin/store" className="text-gold-warm underline">
                  /admin/store
                </Link>{' '}
                และระบบจัดส่ง PDF อัตโนมัติผ่าน Resend API
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-parchment-cream/90 list-disc pl-5 leading-relaxed">
            <li>
              <strong>E-Book ฉบับเกาะทะเลน้ำตื้น (73 หน้า):</strong> เก็บไฟล์ต้นฉบับไว้ในโฟลเดอร์ส่วนตัวของเซิร์ฟเวอร์ (<code>data/private_ebooks/The_Fitrah_Shield_Openwater.pdf</code>) ไม่มีปุ่มดาวน์โหลดบนหน้าเว็บ ผู้ใช้ต้องล็อกอินและกดรับผ่านตะกร้า (ราคา ฿199 ลดเป็นฟรี ฿0) จำกัด 1 ครั้งต่ออีเมลที่สมัครสมาชิก
            </li>
            <li>
              <strong>ดราฟท์อีเมลอัปเซลล์ 3 ระดับ:</strong> ระบบจะตรวจสอบระดับเรือของสมาชิกโดยอัตโนมัติ และส่งอีเมลที่ขึ้นต้นด้วย{' '}
              <em>&ldquo;สลามุอะลัยกุมวะเราะฮฺมะตุลลอฮิ วะบะรอกาตุ&rdquo;</em> และลงท้ายด้วย{' '}
              <em>&ldquo;ด้วยสลามและดุอาอฺ / ทีมงาน The Fitrah Shield&rdquo;</em> พร้อมไฮไลท์ชวนอัปเกรดไประดับถัดไป
            </li>
            <li>
              <strong>การเพิ่มสินค้าใหม่ใน Safe for Support:</strong> เข้าไปที่{' '}
              <Link href="/admin/store" className="text-gold-warm underline">
                /admin/store
              </Link>{' '}
              สามารถเพิ่มสินค้าตั้งเป็น <strong>Draft</strong>, <strong>ตั้งเวลาขายล่วงหน้า (Scheduled)</strong> หรือกดปุ่มสีทอง <strong>&ldquo;เผยแพร่ทันที&rdquo;</strong> ได้ในคลิกเดียว
            </li>
          </ul>
        </section>

        {/* Section 4: Member Excel/CSV & EasySlip */}
        <section className="luxury-glass rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-surface border border-gold/40 flex items-center justify-center text-gold-warm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
                4. การตรวจสลิปโอนเงิน (EasySlip) & ตารางสมาชิก Excel / CSV
              </h2>
              <p className="text-xs text-parchment-muted">
                เชื่อมต่อ EasySlip API และระบบส่งออก/นำเข้าไฟล์ตารางสมาชิก
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-parchment-cream/90 list-disc pl-5 leading-relaxed">
            <li>
              <strong>EasySlip API อัตโนมัติ:</strong> เมื่อสมาชิกอัปโหลดสลิปโอนเงินในหน้าสมัครแพ็กเกจหรือในตะกร้า ระบบจะส่งตรวจสอบยอดเงินผ่าน EasySlip API ทันที และแอดมินยังสามารถกดดูรูปสลิปหรือกดอนุมัติด้วยตนเองได้ในหน้า{' '}
              <Link href="/admin/members" className="text-gold-warm underline">
                /admin/members
              </Link>
            </li>
            <li>
              <strong>Export & Import Excel (.xlsx) / CSV (.csv):</strong> ในหน้า{' '}
              <Link href="/admin/members" className="text-gold-warm underline">
                /admin/members
              </Link>{' '}
              คุณสามารถกดปุ่ม <strong>Export Excel (.xlsx)</strong> เพื่อนำตารางสมาชิกไปแก้ไขในโปรแกรม Excel แล้วกด <strong>นำเข้าไฟล์ Excel/CSV</strong> เพื่ออัปเดตข้อมูลสมาชิกจำนวนมากพร้อมกันได้ทันที
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
