/**
 * Build & Deploy THE FITRAH SHIELD to Cloudflare Pages (the-fitrah-shield.pages.dev & thefitrahshield.hardynaipayong.cloud)
 */
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

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
const apiDataDir = path.join(process.cwd(), 'public', 'api-data');

function toggleApiRoutes(hide) {
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (hide && entry.name === 'route.ts') {
        fs.renameSync(full, full + '.bak');
      } else if (!hide && entry.name === 'route.ts.bak') {
        fs.renameSync(full, full.slice(0, -4));
      }
    }
  }
  walk(apiDir);
}

async function main() {
  console.log('📦 1. กำลังส่งออกข้อมูล /api-data/ocean.json และ /api-data/oneshot.json...');
  if (!fs.existsSync(apiDataDir)) {
    fs.mkdirSync(apiDataDir, { recursive: true });
  }

  try {
    const [oceanRes, oneshotRes] = await Promise.all([
      fetch('http://localhost:3002/api/ocean').then((r) => r.json()),
      fetch('http://localhost:3002/api/oneshot').then((r) => r.json()),
    ]);
    fs.writeFileSync(path.join(apiDataDir, 'ocean.json'), JSON.stringify(oceanRes), 'utf8');
    fs.writeFileSync(path.join(apiDataDir, 'oneshot.json'), JSON.stringify(oneshotRes), 'utf8');
    console.log('✅ สร้างไฟล์ /api-data/ocean.json และ /api-data/oneshot.json สำเร็จ');
  } catch (e) {
    console.warn('⚠️ ใช้ไฟล์ /api-data/ ที่มีอยู่แทน');
  }

  console.log('🏗️ 2. กำลัง Build เว็บไซต์สำหรับ Cloudflare Pages (Static Export + Functions)...');
  toggleApiRoutes(true);

  try {
    execSync('npx next build', {
      stdio: 'inherit',
      env: {
        ...process.env,
        CF_PAGES_BUILD: '1',
      },
    });
  } finally {
    toggleApiRoutes(false);
  }

  // Remove out/audio since all 64 MP3s are served from Cloudflare R2 CDN
  const outAudioDir = path.join(process.cwd(), 'out', 'audio');
  if (fs.existsSync(outAudioDir)) {
    fs.rmSync(outAudioDir, { recursive: true, force: true });
    console.log('🧹 ลบโฟลเดอร์ out/audio ออกเพื่อให้ใช้ไฟล์เสียงจาก Cloudflare R2 CDN โดยตรง');
  }

  const wranglerPath = path.join(process.cwd(), 'wrangler.toml');
  const wranglerBak = path.join(process.cwd(), 'wrangler.toml.bak');
  if (fs.existsSync(wranglerPath)) {
    fs.renameSync(wranglerPath, wranglerBak);
  }

  try {
    console.log('🚀 3. กำลังอัปโหลดขึ้นสู่ Cloudflare Pages (the-fitrah-shield)...');
    execSync(
      'npx wrangler pages deploy out --project-name=the-fitrah-shield --branch=main --commit-dirty=true',
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID:
            process.env.CLOUDFLARE_ACCOUNT_ID || '2e1b9f31899de83cd61c91278688516c',
        },
      }
    );
  } finally {
    if (fs.existsSync(wranglerBak)) {
      fs.renameSync(wranglerBak, wranglerPath);
    }
  }
}

main().catch((err) => {
  toggleApiRoutes(false);
  console.error(err);
  process.exit(1);
});
