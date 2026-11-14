import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Load .env.local
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
const BUCKET_NAME = 'fitrah-shield-media';
const R2_PUBLIC_BASE = 'https://pub-f97e75c998b047ada96253d539c8f805.r2.dev';

async function putR2Mp3(key, filePath) {
  const bodyBuffer = fs.readFileSync(filePath);
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'audio/mpeg',
    },
    body: bodyBuffer,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload ${key}: ${res.status} ${errText}`);
  }
}

async function main() {
  const oneshotDir = path.join(process.cwd(), 'public', 'audio', 'oneshot');
  const metaPath = path.join(process.cwd(), 'data', 'oneshot_audio_meta.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

  for (let i = 1; i <= 7; i++) {
    const p1 = path.join(oneshotDir, `island${i}-part1.mp3`);
    const p2 = path.join(oneshotDir, `island${i}-part2.mp3`);
    const fullPath = path.join(oneshotDir, `island${i}-full.mp3`);

    console.log(`🎧 กำลังรวมไฟล์เสียงเกาะที่ ${i} (part1 + part2 -> island${i}-full.mp3)...`);
    execSync(
      `ffmpeg -y -i "concat:${p1}|${p2}" -acodec copy "${fullPath}"`,
      { stdio: 'ignore' }
    );

    const sizeMb = (fs.statSync(fullPath).size / (1024 * 1024)).toFixed(2);
    console.log(`   ✅ สร้าง island${i}-full.mp3 สำเร็จ (${sizeMb} MB)`);

    if (API_TOKEN) {
      await putR2Mp3(`audio/oneshot/island${i}-full.mp3`, fullPath);
      console.log(`   ☁️ อัปโหลดขึ้น R2: audio/oneshot/island${i}-full.mp3 สำเร็จ`);
    }

    if (meta[String(i)] && meta[String(i)].full) {
      meta[String(i)].full.url = `/audio/oneshot/island${i}-full.mp3`;
      meta[String(i)].full.title = `เสียงบรรยายฉบับสมบูรณ์ (เกาะที่ ${i})`;
    }
  }

  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
  console.log('📝 อัปเดต data/oneshot_audio_meta.json เรียบร้อยแล้ว');

  // Verify all 7 Shallow Waters + 50 Deep Ocean audio URLs on R2 CDN
  console.log('\n🔍 กำลังทดสอบการเข้าถึงไฟล์เสียงทั้ง 57 บทเรียนบน Cloudflare R2 CDN...');
  const prefixes = [
    'Island1Dunya',
    'Island2Haram',
    'Island3Nafsu',
    'Island4Rizq',
    'Island5Hijab',
    'Island6Hype',
    'Island7FakeIdol',
    'Island8Shirk',
    'Island9ShiaBeing',
    'Island10Barzakh',
  ];

  const urlsToTest = [];
  for (let i = 1; i <= 7; i++) {
    urlsToTest.push(`${R2_PUBLIC_BASE}/audio/oneshot/island${i}-full.mp3`);
  }
  for (const prefix of prefixes) {
    for (let c = 1; c <= 5; c++) {
      urlsToTest.push(`${R2_PUBLIC_BASE}/audio/deep-ocean/${prefix}_0${c}_normalized.mp3`);
    }
  }

  let okCount = 0;
  let failList = [];
  await Promise.all(
    urlsToTest.map(async (u) => {
      const r = await fetch(u, { method: 'HEAD' });
      if (r.ok) {
        okCount++;
      } else {
        failList.push(`${u} -> ${r.status}`);
      }
    })
  );

  console.log(`✅ ผลทดสอบไฟล์เสียงทั้งหมด: ผ่าน ${okCount}/${urlsToTest.length} ไฟล์`);
  if (failList.length > 0) {
    console.error('❌ ไฟล์ที่พบปัญหา:', failList);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
