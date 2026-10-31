import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { NewsItem, NewsSection } from '@/types';

// In-memory cache for high-speed retrieval
let cachedNews: NewsItem[] | null = null;
let lastModifiedTime = 0;
let cachedSubcategories: string[] = [];

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const THAI_SHORT_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

/**
 * Robust date parser supporting Excel serial numbers and date strings
 */
function parseNewsDate(val: unknown): {
  iso: string;
  formatted: string;
  short: string;
  timestamp: number;
} {
  let y = 2026;
  let m = 1;
  let d = 1;

  if (typeof val === 'number') {
    const parsed = XLSX.SSF.parse_date_code(val);
    y = parsed.y;
    m = parsed.m;
    d = parsed.d;
  } else if (typeof val === 'string' && val.trim()) {
    const dt = new Date(val);
    if (!isNaN(dt.getTime())) {
      y = dt.getFullYear();
      m = dt.getMonth() + 1;
      d = dt.getDate();
    }
  }

  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const formatted = `${d} ${THAI_MONTHS[m - 1] || ''} ${y}`;
  const short = `${d} ${THAI_SHORT_MONTHS[m - 1] || ''} ${y}`;
  const timestamp = new Date(y, m - 1, d).getTime();

  return { iso, formatted, short, timestamp };
}

/**
 * Clean markdown symbols from title
 */
function cleanTitle(raw: string): string {
  if (!raw) return '';
  return raw.replace(/^\*\*|\*\*$/g, '').trim();
}

/**
 * Extract clean snippet from markdown content
 */
function extractExcerpt(content: string, maxLength: number = 180): string {
  if (!content) return '';
  const plain = content
    .replace(/[*#_~`>[\]()!+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + '...';
}

/**
 * Locate the primary news file in Assets directory
 */
function getNewsFilePath(): string | null {
  const assetsDir = path.join(process.cwd(), 'Assets');
  if (!fs.existsSync(assetsDir)) return null;

  const files = fs.readdirSync(assetsDir);
  // Prioritize "News Deepdive.xlsx" or any .xlsx file
  const excelFile =
    files.find((f) => f.toLowerCase() === 'news deepdive.xlsx') ||
    files.find((f) => f.toLowerCase().endsWith('.xlsx'));

  if (excelFile) {
    return path.join(assetsDir, excelFile);
  }

  return null;
}

/**
 * Load and cache news items from the Assets directory with mtime invalidation
 */
export async function getAllNews(): Promise<NewsItem[]> {
  const filePath = getNewsFilePath();
  if (!filePath || !fs.existsSync(filePath)) {
    return cachedNews || [];
  }

  try {
    const stat = fs.statSync(filePath);
    // If cache is fresh, return immediately (sub-millisecond)
    if (cachedNews && stat.mtimeMs === lastModifiedTime) {
      return cachedNews;
    }

    // Read and parse Excel file
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName =
      workbook.SheetNames.find((s) => s.toLowerCase() === 'deepdive') ||
      workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return cachedNews || [];
    }

    interface ExcelRow {
      Date?: unknown;
      Subcategory?: string;
      Title?: string;
      Image?: string;
      Video?: string;
      'Content 1'?: string;
      'Image 2'?: string;
      'Content 2'?: string;
      'Image 3'?: string;
      'Content 3'?: string;
      'Image 4'?: string;
      'Content 4'?: string;
      'Image 5'?: string;
      'Content 5'?: string;
      Source?: string;
      'KOR No.'?: string;
      [key: string]: unknown;
    }

    const rawRows = XLSX.utils.sheet_to_json<ExcelRow>(sheet);
    const items: NewsItem[] = [];
    const subcatSet = new Set<string>();

    rawRows.forEach((r, idx) => {
      const rawTitle = r.Title ? String(r.Title).trim() : '';
      if (!rawTitle) return; // Skip empty rows

      const korNo = r['KOR No.'] ? String(r['KOR No.']).trim() : `NEWS-${idx + 1}`;
      const id = korNo;
      const slug = korNo.toLowerCase();
      const subcategory = r.Subcategory ? String(r.Subcategory).trim() : 'Deepdive';
      subcatSet.add(subcategory);

      const dateParsed = parseNewsDate(r.Date);
      const mainImage = r.Image ? String(r.Image).trim() : '';
      const video = r.Video && String(r.Video).trim() ? String(r.Video).trim() : null;
      const source = r.Source && String(r.Source).trim() ? String(r.Source).trim() : null;

      // Requirement 3: Extract main headline from Content 1 (up to '***' delimiter)
      // and use original Column D Topic as topicLead (placed before Content 2)
      const c1Raw = r['Content 1'] ? String(r['Content 1']).trim() : '';
      let headline = '';
      let c1Body = c1Raw;

      const tripleStarIndex = c1Raw.indexOf('***');
      if (tripleStarIndex !== -1) {
        headline = c1Raw.substring(0, tripleStarIndex).trim();
        c1Body = c1Raw.substring(tripleStarIndex + 3).trim();
      } else {
        // Fallback for rows where the first block is bold headline
        const match = c1Raw.match(/^\s*(\*\*[^\n]+\*\*)\s*\n*([\s\S]*)$/);
        if (match) {
          headline = match[1].trim();
          c1Body = match[2].trim();
        }
      }

      const title = headline ? cleanTitle(headline) : cleanTitle(rawTitle);
      const topicLead = cleanTitle(rawTitle);

      // Collect sections (up to 5 content parts as specified by user)
      const sections: NewsSection[] = [];

      const img1 = mainImage;
      if (c1Body || c1Raw) {
        sections.push({ index: 1, content: c1Body || c1Raw, image: img1 });
      }

      const c2 = r['Content 2'] ? String(r['Content 2']).trim() : '';
      const img2 = r['Image 2'] ? String(r['Image 2']).trim() : null;
      if (c2) {
        sections.push({ index: 2, content: c2, image: img2 });
      }

      const c3 = r['Content 3'] ? String(r['Content 3']).trim() : '';
      const img3 = r['Image 3'] ? String(r['Image 3']).trim() : null;
      if (c3) {
        sections.push({ index: 3, content: c3, image: img3 });
      }

      const c4 = r['Content 4'] ? String(r['Content 4']).trim() : '';
      const img4 = r['Image 4'] ? String(r['Image 4']).trim() : null;
      if (c4) {
        sections.push({ index: 4, content: c4, image: img4 });
      }

      const c5 = r['Content 5'] ? String(r['Content 5']).trim() : '';
      const img5 = r['Image 5'] ? String(r['Image 5']).trim() : null;
      if (c5) {
        sections.push({ index: 5, content: c5, image: img5 });
      }

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

    // Default sort by date descending (latest first)
    items.sort((a, b) => b.dateTimestamp - a.dateTimestamp);

    cachedNews = items;
    lastModifiedTime = stat.mtimeMs;
    cachedSubcategories = Array.from(subcatSet);

    return items;
  } catch (error) {
    console.error('Error loading news from Assets:', error);
    return cachedNews || [];
  }
}

/**
 * Find news item by ID, slug, or KOR No. (case-insensitive)
 */
export async function getNewsById(idOrSlug: string): Promise<NewsItem | null> {
  const news = await getAllNews();
  if (!idOrSlug) return null;
  const target = idOrSlug.trim().toLowerCase();

  return (
    news.find(
      (n) =>
        n.id.toLowerCase() === target ||
        n.slug.toLowerCase() === target ||
        n.korNo.toLowerCase() === target
    ) || null
  );
}

/**
 * Filter and paginate news list with search, category and sorting
 */
export async function getNewsList(params: {
  page?: number;
  limit?: number;
  search?: string;
  subcategory?: string;
  sortBy?: 'latest' | 'oldest';
}): Promise<{
  items: NewsItem[];
  total: number;
  totalPages: number;
  page: number;
  subcategories: string[];
}> {
  const allNews = await getAllNews();
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 12));
  const search = params.search ? params.search.trim().toLowerCase() : '';
  const subcategory = params.subcategory ? params.subcategory.trim() : '';
  const sortBy = params.sortBy || 'latest';

  let filtered = allNews;

  if (subcategory && subcategory !== 'all') {
    filtered = filtered.filter(
      (item) => item.subcategory.toLowerCase() === subcategory.toLowerCase()
    );
  }

  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        (item.topicLead && item.topicLead.toLowerCase().includes(search)) ||
        item.korNo.toLowerCase().includes(search) ||
        item.dateFormatted.toLowerCase().includes(search) ||
        item.dateShort.toLowerCase().includes(search) ||
        item.excerpt.toLowerCase().includes(search)
    );
  }

  if (sortBy === 'oldest') {
    filtered = [...filtered].sort((a, b) => a.dateTimestamp - b.dateTimestamp);
  } else {
    filtered = [...filtered].sort((a, b) => b.dateTimestamp - a.dateTimestamp);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return {
    items,
    total,
    totalPages,
    page,
    subcategories: cachedSubcategories,
  };
}

/**
 * Get adjacent news (previous and next)
 */
export async function getAdjacentNews(currentId: string): Promise<{
  prev: NewsItem | null;
  next: NewsItem | null;
}> {
  const news = await getAllNews();
  const currentIndex = news.findIndex(
    (n) => n.id.toLowerCase() === currentId.toLowerCase() || n.slug === currentId.toLowerCase()
  );

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? news[currentIndex - 1] : null;
  const next = currentIndex < news.length - 1 ? news[currentIndex + 1] : null;

  return { prev, next };
}
