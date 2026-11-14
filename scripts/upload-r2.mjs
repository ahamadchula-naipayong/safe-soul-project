/**
 * สคริปต์อัปโหลดไฟล์เสียงพอดแคสต์ทั้งหมด (ทะเลน้ำตื้น 14 ไฟล์ + ทะเลน้ำลึก 50 ไฟล์ = 64 ไฟล์)
 * ขึ้นสู่ Cloudflare R2 Bucket: fitrah-shield-media ผ่าน Cloudflare R2 REST API (Parallel Upload)
 */
import fs from 'fs';
import path from 'path';

// Load .env.local if present
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '2e1b9f31899de83cd61c91278688516c';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'fitrah-shield-media';

if (!API_TOKEN) {
  console.error('❌ Missing CLOUDFLARE_API_TOKEN in .env.local or environment');
  process.exit(1);
}

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

const tasks = [];
for (const { localDir, r2Prefix } of AUDIO_DIRS) {
  if (!fs.existsSync(localDir)) continue;
  const files = fs.readdirSync(localDir).filter((f) => f.endsWith('.mp3'));
  for (const file of files) {
    tasks.push({
      fullPath: path.join(localDir, file),
      r2Key: `${r2Prefix}/${file}`,
    });
  }
}

console.log(`🚀 เริ่มอัปโหลดไฟล์เสียงทั้งหมด ${tasks.length} ไฟล์ ขึ้นสู่ Cloudflare R2 Bucket: ${BUCKET_NAME}...`);

let completed = 0;
const CONCURRENCY = 4;

async function uploadOne({ fullPath, r2Key }) {
  const buffer = fs.readFileSync(fullPath);
  const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodeURIComponent(r2Key)}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'audio/mpeg',
    },
    body: buffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed ${r2Key} (${res.status}): ${errText}`);
  }

  completed++;
  console.log(`✅ [${completed}/${tasks.length}] อัปโหลดสำเร็จ: ${r2Key} (${sizeMb} MB)`);
}

async function runPool() {
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const current = tasks[index++];
      await uploadOne(current);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
}

runPool()
  .then(() => {
    console.log(`\n🎉 อัปโหลดไฟล์เสียงครบทั้ง ${completed} ไฟล์ ขึ้นสู่ Cloudflare R2 (${BUCKET_NAME}) เสร็จสมบูรณ์ 100%!`);
  })
  .catch((err) => {
    console.error('❌ เกิดข้อผิดพลาดในการอัปโหลด:', err);
    process.exit(1);
  });
