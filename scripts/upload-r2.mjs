/**
 * สคริปต์อัปโหลดไฟล์เสียงพอดแคสต์ทั้งหมด (ทะเลน้ำตื้น 14 ไฟล์ + ทะเลน้ำลึก 50 ไฟล์ = 64 ไฟล์)
 * ขึ้นสู่ Cloudflare R2 Bucket: fitrah-shield-media
 *
 * วิธีรันหลังจากล็อกอิน Cloudflare (npx wrangler login):
 *   node scripts/upload-r2.mjs
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'fitrah-shield-media';

const AUDIO_DIRS = [
  {
    localDir: path.join(process.cwd(), 'public', 'audio', 'oneshot'),
    r2Prefix: 'audio/oneshot',
  },
  {
    localDir: path.join(process.cwd(), 'public', 'audio', 'deep-ocean'),
    r2Prefix: 'audio/deep-ocean',
  },
];

let uploaded = 0;

for (const { localDir, r2Prefix } of AUDIO_DIRS) {
  if (!fs.existsSync(localDir)) continue;
  const files = fs.readdirSync(localDir).filter((f) => f.endsWith('.mp3'));
  console.log(`\n📦 กำลังอัปโหลดหมวด ${r2Prefix} (${files.length} ไฟล์) ไปยัง Cloudflare R2 Bucket: ${BUCKET_NAME}...`);

  for (const file of files) {
    const fullPath = path.join(localDir, file);
    const r2Key = `${r2Prefix}/${file}`;
    console.log(`   ⬆️ [${++uploaded}] ${r2Key}`);
    execSync(
      `npx wrangler r2 object put "${BUCKET_NAME}/${r2Key}" --file="${fullPath}" --content-type="audio/mpeg" --remote`,
      { stdio: 'inherit' }
    );
  }
}

console.log(`\n✅ อัปโหลดไฟล์เสียงทั้งหมด ${uploaded} ไฟล์ขึ้น Cloudflare R2 สำเร็จเรียบร้อย!`);
