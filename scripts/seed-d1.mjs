import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const members = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'members.json'), 'utf8'));
const products = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'store_products.json'), 'utf8'));

const esc = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

let sql = '';

for (const m of members) {
  sql += `INSERT OR REPLACE INTO members (id, member_number, username, email, phone, password, name, tier, role, payment_status, payment_slip_url, payment_amount, billing_cycle, ebook_claimed, ebook_claimed_at, notes, created_at, updated_at) VALUES (${esc(m.id)}, ${Number(m.memberNumber)}, ${esc(m.username)}, ${esc(m.email)}, ${esc(m.phone || '')}, ${esc(m.password || 'password123')}, ${esc(m.name)}, ${esc(m.tier)}, ${esc(m.role || (m.memberNumber === 1 ? 'admin' : 'member'))}, ${esc(m.paymentStatus || 'free')}, ${esc(m.paymentSlipUrl || null)}, ${Number(m.paymentAmount || 0)}, ${esc(m.billingCycle || 'free')}, ${m.ebookClaimed ? 1 : 0}, ${esc(m.ebookClaimedAt || null)}, ${esc(m.notes || '')}, ${esc(m.createdAt)}, ${esc(m.updatedAt || null)});\n`;
}

for (const p of products) {
  sql += `INSERT OR REPLACE INTO store_products (id, slug, title, description, type, price_thb, compare_at_price_thb, image_url, badge, stock_quantity, is_active, status, published_at, updated_at) VALUES (${esc(p.id)}, ${esc(p.slug)}, ${esc(p.title)}, ${esc(p.description)}, ${esc(p.type)}, ${Number(p.price_thb || 0)}, ${p.compare_at_price_thb !== undefined ? Number(p.compare_at_price_thb) : 'NULL'}, ${esc(p.image_url)}, ${esc(p.badge || null)}, ${Number(p.stock_quantity || 0)}, ${p.is_active ? 1 : 0}, ${esc(p.status || 'published')}, ${esc(p.published_at || null)}, ${esc(new Date().toISOString())});\n`;
}

const seedFile = path.join(process.cwd(), 'migrations', '0002_seed.sql');
fs.writeFileSync(seedFile, sql, 'utf8');
console.log('Generated migrations/0002_seed.sql');

execSync('npx wrangler d1 execute fitrah-shield-db --remote --file=./migrations/0002_seed.sql', {
  stdio: 'inherit',
  env: {
    ...process.env,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '2e1b9f31899de83cd61c91278688516c',
  },
});
