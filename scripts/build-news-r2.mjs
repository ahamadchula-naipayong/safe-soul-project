import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

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
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'fitrah-shield-media';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const THAI_SHORT_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

function parseNewsDate(val) {
  let y = 2026, m = 1, d = 1;
  if (typeof val === 'number') {
    const ssf = XLSX.SSF || XLSX.default?.SSF;
    if (ssf && ssf.parse_date_code) {
      const parsed = ssf.parse_date_code(val);
      y = parsed.y; m = parsed.m; d = parsed.d;
    } else {
      const dt = new Date(Math.round((val - 25569) * 86400 * 1000));
      y = dt.getUTCFullYear(); m = dt.getUTCMonth() + 1; d = dt.getUTCDate();
    }
  } else if (typeof val === 'string' && val.trim()) {
    const dt = new Date(val);
    if (!isNaN(dt.getTime())) {
      y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
    }
  }
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const formatted = `${d} ${THAI_MONTHS[m - 1] || ''} ${y}`;
  const short = `${d} ${THAI_SHORT_MONTHS[m - 1] || ''} ${y}`;
  const timestamp = new Date(y, m - 1, d).getTime();
  return { iso, formatted, short, timestamp };
}

function cleanTitle(raw) {
  if (!raw) return '';
  return raw.replace(/^\*\*|\*\*$/g, '').trim();
}

function extractExcerpt(content, maxLength = 180) {
  if (!content) return '';
  const plain = content.replace(/[*#_~`>[\]()!+-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + '...';
}

async function putR2Object(r2Key, jsonString) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodeURIComponent(r2Key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: Buffer.from(jsonString, 'utf8'),
  });
  if (!res.ok) {
    throw new Error(`Failed R2 upload ${r2Key}: ${res.status}`);
  }
}

async function main() {
  const excelPath = path.join(process.cwd(), 'Assets', 'News Deepdive.xlsx');
  console.log('📖 กำลังอ่านไฟล์ Assets/News Deepdive.xlsx...');
  const buf = fs.readFileSync(excelPath);
  const workbook = XLSX.read(buf, { type: 'buffer' });
  const sheetName = workbook.SheetNames.find((s) => s.toLowerCase() === 'deepdive') || workbook.SheetNames[0];
  const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const items = [];
  const subcatSet = new Set();

  rawRows.forEach((r, idx) => {
    const rawTitle = r.Title ? String(r.Title).trim() : '';
    if (!rawTitle) return;

    const korNo = r['KOR No.'] ? String(r['KOR No.']).trim() : `NEWS-${idx + 1}`;
    const id = korNo;
    const slug = korNo.toLowerCase();
    const subcategory = r.Subcategory ? String(r.Subcategory).trim() : 'Deepdive';
    subcatSet.add(subcategory);

    const dateParsed = parseNewsDate(r.Date);
    const mainImage = r.Image ? String(r.Image).trim() : '';
    const video = r.Video && String(r.Video).trim() ? String(r.Video).trim() : null;
    const source = r.Source && String(r.Source).trim() ? String(r.Source).trim() : null;

    const c1Raw = r['Content 1'] ? String(r['Content 1']).trim() : '';
    let headline = '';
    let c1Body = c1Raw;
    const tripleStarIndex = c1Raw.indexOf('***');
    if (tripleStarIndex !== -1) {
      headline = c1Raw.substring(0, tripleStarIndex).trim();
      c1Body = c1Raw.substring(tripleStarIndex + 3).trim();
    } else {
      const match = c1Raw.match(/^\s*(\*\*[^\n]+\*\*)\s*\n*([\s\S]*)$/);
      if (match) {
        headline = match[1].trim();
        c1Body = match[2].trim();
      }
    }

    const title = headline ? cleanTitle(headline) : cleanTitle(rawTitle);
    const topicLead = cleanTitle(rawTitle);

    const sections = [];
    if (c1Body || c1Raw) sections.push({ index: 1, content: c1Body || c1Raw, image: mainImage });
    const c2 = r['Content 2'] ? String(r['Content 2']).trim() : '';
    if (c2) sections.push({ index: 2, content: c2, image: r['Image 2'] ? String(r['Image 2']).trim() : null });
    const c3 = r['Content 3'] ? String(r['Content 3']).trim() : '';
    if (c3) sections.push({ index: 3, content: c3, image: r['Image 3'] ? String(r['Image 3']).trim() : null });
    const c4 = r['Content 4'] ? String(r['Content 4']).trim() : '';
    if (c4) sections.push({ index: 4, content: c4, image: r['Image 4'] ? String(r['Image 4']).trim() : null });
    const c5 = r['Content 5'] ? String(r['Content 5']).trim() : '';
    if (c5) sections.push({ index: 5, content: c5, image: r['Image 5'] ? String(r['Image 5']).trim() : null });

    const excerpt = extractExcerpt(c1Body || c1Raw || c2 || title);

    items.push({
      id,
      slug,
      korNo,
      rawTitle,
      title,
      topicLead,
      date: dateParsed.iso,
      dateFormatted: dateParsed.formatted,
      dateShort: dateParsed.short,
      dateTimestamp: dateParsed.timestamp,
      subcategory,
      image: mainImage,
      video,
      source,
      sections,
      excerpt,
    });
  });

  items.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
  const subcategories = Array.from(subcatSet);
  console.log(`✅ แปลงข้อมูลข่าวสำเร็จทั้งหมด ${items.length} รายการ (หมวดหมู่: ${subcategories.join(', ')})`);

  // Split full articles into 10 shards of ~464 items each
  const SHARD_SIZE = 500;
  const numShards = Math.ceil(items.length / SHARD_SIZE);

  // Build compact index for instant search, filtering, and pagination
  const indexItems = items.map((item, idx) => ({
    id: item.id,
    slug: item.slug,
    korNo: item.korNo,
    title: item.title,
    topicLead: item.topicLead,
    date: item.date,
    dateFormatted: item.dateFormatted,
    dateShort: item.dateShort,
    dateTimestamp: item.dateTimestamp,
    subcategory: item.subcategory,
    image: item.image,
    video: item.video,
    source: item.source,
    excerpt: item.excerpt,
    shard: Math.floor(idx / SHARD_SIZE),
  }));

  const apiDataDir = path.join(process.cwd(), 'public', 'api-data');
  if (!fs.existsSync(apiDataDir)) fs.mkdirSync(apiDataDir, { recursive: true });

  const indexPayload = JSON.stringify({ subcategories, total: indexItems.length, items: indexItems });
  fs.writeFileSync(path.join(apiDataDir, 'news-index.json'), indexPayload, 'utf8');
  console.log(`📦 บันทึก public/api-data/news-index.json (${(Buffer.byteLength(indexPayload) / (1024 * 1024)).toFixed(2)} MB)`);

  if (API_TOKEN) {
    console.log(`☁️ กำลังอัปโหลด news-index.json และ ${numShards} Shards ขึ้นสู่ Cloudflare R2 (${BUCKET_NAME})...`);
    await putR2Object('news/news-index.json', indexPayload);
    for (let s = 0; s < numShards; s++) {
      const slice = items.slice(s * SHARD_SIZE, (s + 1) * SHARD_SIZE);
      const mapObj = {};
      for (const it of slice) {
        mapObj[it.slug] = it;
      }
      const shardJson = JSON.stringify(mapObj);
      await putR2Object(`news/news-shard-${s}.json`, shardJson);
      console.log(`   ✅ Uploaded news/news-shard-${s}.json (${slice.length} ข่าว, ${(Buffer.byteLength(shardJson) / (1024 * 1024)).toFixed(2)} MB)`);
    }
    console.log(`🎉 อัปโหลดคลังข่าวทั้งหมด ${items.length.toLocaleString()} รายการขึ้น Cloudflare R2 สำเร็จ 100%!`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
