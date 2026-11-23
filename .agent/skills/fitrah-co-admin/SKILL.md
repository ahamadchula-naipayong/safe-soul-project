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
