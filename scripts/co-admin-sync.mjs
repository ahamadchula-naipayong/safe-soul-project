/**
 * Master Co-Admin Sync & Deploy Pipeline for THE FITRAH SHIELD
 * รันคำสั่งเดียวเพื่อซิงค์ข้อมูลจากโฟลเดอร์ Assets (ที่ซิงค์กับ Google Drive) และ data/
 * ขึ้นสู่ Cloudflare R2 + Cloudflare D1 + Deploy เว็บไซต์ขึ้น Cloudflare Pages
 *
 * Usage:
 *   npm run co-admin:sync
 *   node scripts/co-admin-sync.mjs [--skip-news] [--skip-d1] [--skip-deploy] [--skip-discord]
 */
import { execSync } from 'child_process';

const args = new Set(process.argv.slice(2));

function runStep(title, cmd) {
  console.log(`\n======================================================================`);
  console.log(`🚀 ${title}`);
  console.log(`======================================================================`);
  execSync(cmd, { stdio: 'inherit' });
}

async function main() {
  console.log('🛡️ เริ่มต้นกระบวนการ THE FITRAH SHIELD CO-ADMIN PIPELINE...');

  if (!args.has('--skip-news')) {
    runStep('ขั้นตอนที่ 1/4: ซิงค์ตารางข่าว Assets/News Deepdive.xlsx ขึ้น Cloudflare R2', 'node scripts/build-news-r2.mjs');
  }

  if (!args.has('--skip-d1')) {
    runStep('ขั้นตอนที่ 2/4: ซิงค์ข้อมูลสมาชิกและสินค้า (data/*.json) ขึ้นฐานข้อมูล Cloudflare D1', 'node scripts/seed-d1.mjs');
  }

  if (!args.has('--skip-deploy')) {
    runStep('ขั้นตอนที่ 3/4: Build และ Deploy เว็บไซต์ขึ้น Cloudflare Pages (the-fitrah-shield)', 'node scripts/deploy-cloudflare.mjs');
  }

  if (!args.has('--skip-discord')) {
    runStep('ขั้นตอนที่ 4/4: ซิงค์บทความและข่าวใหม่ขึ้น Discord Forum Channels', 'node scripts/discord-sync.mjs');
  }

  console.log('\n🎉 กระบวนการ Co-Admin Sync & Deploy เสร็จสมบูรณ์ครบทุกขั้นตอน!');
}

main().catch((err) => {
  console.error('❌ เกิดข้อผิดพลาดใน Co-Admin Pipeline:', err?.message || err);
  process.exit(1);
});
