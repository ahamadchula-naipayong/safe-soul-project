---
name: fitrah-co-admin
description: Co-Admin Skill and Pipeline for managing The Fitrah Shield (Safe Soul Project) website, syncing content from Google Drive / Assets, updating Cloudflare D1 & R2, and deploying to Cloudflare Pages.
---

# Fitrah Shield Co-Admin Skill (`fitrah-co-admin`)

ใช้สกิลนี้เมื่อผู้ใช้ต้องการให้ช่วยดูแล ปรับแต่ง หรืออัปเดตเว็บไซต์ **เกราะพิทักษ์ฟิฏเราะฮฺ (THE FITRAH SHIELD / Safe Soul Project)** (`https://thefitrahshield.hardynaipayong.cloud`) ในฐานะ Co-Admin

## 1. โครงสร้างข้อมูลหลักของเว็บไซต์
- **บทความทะเลน้ำตื้น (7 เกาะ):** `Assets/SAFE oneshot chapter/` และ `public/api-data/oneshot.json`
- **บทความทะเลน้ำลึก (10 หมู่เกาะ 50 บท):** `Assets/SAFE deep ocean/`, `public/api-data/ocean.json`, และข้อมูลแก้ไขทับใน `data/ocean_articles_override.json` (ตาราง `article_overrides` ใน Cloudflare D1)
- **ข่าววิเคราะห์ (News Deepdive):** `Assets/News Deepdive.xlsx` อัปโหลดเป็น JSON Shards ขึ้น Cloudflare R2 ด้วย `node scripts/build-news-r2.mjs`
- **สินค้า Safe for Support:** `data/store_products.json` (ตาราง `store_products` ใน Cloudflare D1)
- **ตารางสมาชิก & สิทธิ์ Co-Admin:** `data/members.json` (ตาราง `members` ใน Cloudflare D1)
- **ระบบ Gemini Co-Admin บนหน้าเว็บ:**
  - UI & Google AI Studio Login Popup: `src/components/GeminiCoAdminWidget.tsx` (ฝังอยู่ในหน้า `/admin` -> `src/app/admin/page.tsx`)
  - Local API Route: `src/app/api/admin/co-admin/route.ts`
  - Cloudflare Edge API Route: `functions/api/[[route]].ts` (`/api/admin/co-admin`)

## 2. ขั้นตอนการซิงค์และอัปเดตเว็บไซต์ (Co-Admin Pipeline)
1. **กรณีดึงไฟล์จาก Google Drive:**
   - ใช้สกิล `gdrive`, `gdocs`, หรือ `gsheets` เพื่อค้นหาหรือดึงไฟล์ต้นฉบับล่าสุดของผู้ใช้ หรือวางลิงก์ในช่อง **"ซิงค์ไฟล์จาก Google Drive"** บนหน้า `/admin`
2. **กรณีอัปเดตตารางข่าว (`Assets/News Deepdive.xlsx`):**
   - รัน `node scripts/build-news-r2.mjs` เพื่อแปลงและอัปโหลดขึ้น Cloudflare R2
3. **กรณีอัปเดตข้อมูลสมาชิกหรือสินค้า (`data/members.json`, `data/store_products.json`):**
   - รัน `node scripts/seed-d1.mjs` เพื่อซิงค์ข้อมูลขึ้นฐานข้อมูล Cloudflare D1 (`fitrah-shield-db`)
4. **กรณีอัปโหลดไฟล์เสียงพอดแคสต์ใหม่ (`public/audio/`):**
   - รัน `node scripts/upload-r2.mjs`
5. **กรณีซิงค์ทุกอย่างและ Deploy ขึ้นเว็บไซต์จริงในคำสั่งเดียว:**
   - รัน `npm run co-admin:sync` (หรือ `node scripts/co-admin-sync.mjs`)

## 3. การจัดการและซิงค์เนื้อหาขึ้น Discord (Hybrid Summary Cards & OAuth2)
- โครงสร้างสิทธิ์บน Discord แบ่งเป็น 2 ระดับหลัก (`Free` vs `Member`) พร้อมยศสีทอง `Founding 100` (สิทธิ์ห้องเทียบเท่า `Member`)
- **ตั้งค่า/อัปเดตโครงสร้างห้อง ยศ ลำดับยศ และลิงก์เชิญถาวรบน Discord:**
  - รัน `npm run discord:setup` (หรือ `node scripts/discord-setup.mjs`)
- **ซิงค์เนื้อหาแบบลูกผสม (การ์ดสรุป + ลิงก์กลับเว็บ) จากทะเลน้ำตื้น, ทะเลน้ำลึก (ตามตารางเผยแพร่ W1–W23), และข่าวจาก Excel:**
  - ทดสอบก่อนโพสต์จริง: `node scripts/discord-sync.mjs --dry-run`
  - ซิงค์โพสต์จริงขึ้น Discord: `npm run discord:sync` (ค่าเริ่มต้น: ข่าวเปิดย้อนหลัง `--open-days=30` พร้อมลบข่าวเกิน 30 วันอัตโนมัติ และ `--open-active-days=5`; ข่าว Deepdive ลงทั้งหมดและ `--deepdive-active-limit=600` ส่วนเกินเข้า Auto-Archive อัตโนมัติ; รองรับ `--batch-size=N` และ `--update-existing` และรันอัตโนมัติทุกวันเวลา 05:05 น. ผ่าน `.github/workflows/discord-schedule-sync.yml`)
  - ไฟล์เก็บสถานะ IDs, ลิงก์เชิญ และประวัติการซิงค์: `data/discord_state.json` (ห้ามเก็บ Secret/Token ในไฟล์นี้)
- **ระบบเชื่อมบัญชีสมาชิกเว็บ ↔ Discord อัตโนมัติ (Cloudflare Pages Functions + D1):**
  - สมาชิกกดปุ่ม **"เชื่อมต่อ Discord & รับยศอัตโนมัติ"** ได้ในหน้า `/login` (`GET /api/discord/connect` → `GET /api/discord/callback`)
  - เมื่อแอดมินอนุมัติสลิปหรือเปลี่ยนแพ็กเกจผ่าน `/admin` (`PATCH /api/admin/members` หรือ Gemini Co-Admin `update_member`) ระบบจะซิงค์ยศ `Free`, `Member`, และ `Founding 100` บน Discord ให้โดยอัตโนมัติ
- **ซิงค์เซิร์ฟเวอร์ Birds of Paradise (`--profile=birds` — เปิดให้อ่านทุกคน):**
  - จัดระเบียบหมวดหมู่ & ห้อง: `npm run discord:birds:setup` (`scripts/discord-birds-setup.mjs`, เก็บสถานะใน `data/discord_birds_state.json`)
  - ซิงค์เนื้อหา: `npm run discord:birds:sync` (`node scripts/discord-sync.mjs --profile=birds`) — ลง 7 เกาะทะเลน้ำตื้น + คำเชิญชวนทะเลน้ำลึกปักหมุดใน `#ksf_basic-thoughts🫶` และลงข่าวเปิด/West Asia + Deepdive ย้อนหลัง 30 วันล่าสุดใน `#ข่าวสาร-west-asia` และ `#news-deepdive` พร้อมลบข่าวเกิน 30 วันอัตโนมัติ (ตั้งเวลารันอัตโนมัติคู่กันเวลา 05:05 น. ใน `.github/workflows/discord-schedule-sync.yml`)
