import fs from 'fs';
import path from 'path';
import { OneshotChapter, OneshotSection, OneshotSectionKey } from '@/types';
import { SHALLOW_WATERS_RELEASE_ISO } from '@/lib/releaseSchedule';

// In-memory cache for high-speed retrieval
let cachedChapters: OneshotChapter[] | null = null;
let lastModifiedTime = 0;

const IMAGE_MAP: Record<number, string> = {
  1: '/images/oneshot/Oneshot1_SafeFromTheDunya_main.jpg',
  2: '/images/oneshot/Oneshot2_SafeFromShirk_main.jpg',
  3: '/images/oneshot/Oneshot3_SafeFromNafsu_main.jpg',
  4: '/images/oneshot/Oneshot4_SafeForRiski_main.jpg',
  5: '/images/oneshot/Oneshot5_SafeFromHype_main.jpg',
  6: '/images/oneshot/Oneshot6_SafeFromHaram_main.jpg',
  7: '/images/oneshot/Oneshot7_SafeForBarzakh_main.jpg',
};

const SLUG_MAP: Record<number, string> = {
  1: 'safe-from-the-dunya',
  2: 'safe-from-shirk',
  3: 'safe-from-nafs',
  4: 'safe-for-rizq',
  5: 'safe-from-hype',
  6: 'safe-from-haram',
  7: 'safe-for-barzakh',
};

/**
 * Locate the primary oneshot markdown file in Assets directory
 */
function getOneshotFilePath(): string | null {
  const oneshotDir = path.join(process.cwd(), 'Assets', 'SAFE oneshot chapter');
  if (!fs.existsSync(oneshotDir)) return null;

  const files = fs.readdirSync(oneshotDir);
  const mdFile =
    files.find((f) => f.toLowerCase() === 'oneshot_chapter_2559.md') ||
    files.find((f) => f.toLowerCase().endsWith('.md'));

  if (mdFile) {
    return path.join(oneshotDir, mdFile);
  }

  return null;
}

/**
 * Read file buffer and decode UTF-16LE or UTF-8 automatically
 */
function readDecodedFile(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  if (buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.toString('utf16le');
  }
  return buf.toString('utf8');
}

/**
 * Estimate reading time in minutes based on reflective character count
 */
function calculateReadingTime(text: string): number {
  const wordsOrChars = text.length;
  return Math.max(8, Math.ceil(wordsOrChars / 450));
}

/**
 * Clean markdown header text
 */
function cleanHeaderText(header: string): string {
  return header.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
}

/**
 * Parse a raw chapter text chunk into structured 7 sections
 */
function parseChapterChunk(
  chunk: string,
  chapterNumber: number
): OneshotChapter {
  const lines = chunk.split('\n');
  const titleLine = cleanHeaderText(lines[0] || `Safe Chapter ${chapterNumber}`);
  const colonIdx = titleLine.indexOf(':');

  const titleEn = colonIdx !== -1 ? titleLine.slice(0, colonIdx).trim() : titleLine;
  const titleTh =
    colonIdx !== -1 ? titleLine.slice(colonIdx + 1).trim() : `บทที่ ${chapterNumber}: ${titleEn}`;
  const coreFocus = titleTh;

  // Patterns for sections
  const sectionPatterns: {
    key: 'self' | 'awareness' | 'faith' | 'ethics' | 'conclusion';
    regex: RegExp;
    defaultTitle: string;
  }[] = [
    {
      key: 'self',
      regex: /^##\s*(?:1[.\s]|Self)/i,
      defaultTitle: '1. มิติแห่งตน (Self)',
    },
    {
      key: 'awareness',
      regex: /^##\s*(?:2[.\s]|Awareness)/i,
      defaultTitle: '2. มิติการตื่นรู้ (Awareness)',
    },
    {
      key: 'faith',
      regex: /^##\s*(?:3[.\s]|Faith)/i,
      defaultTitle: '3. มิติความศรัทธา (Faith)',
    },
    {
      key: 'ethics',
      regex: /^##\s*(?:4[.\s]|Ethics)/i,
      defaultTitle: '4. มิติจริยธรรมเชิงประจักษ์ (Ethics)',
    },
    {
      key: 'conclusion',
      regex: /^##\s*(?:บทสรุป|แหล่งอ้างอิง|แหล่งข้อมูล)/i,
      defaultTitle: 'บทสรุปและการตกผลึกชีวิต พร้อมเอกสารอ้างอิง',
    },
  ];

  interface FoundMarker {
    key: 'self' | 'awareness' | 'faith' | 'ethics' | 'conclusion';
    lineIdx: number;
    rawHeader: string;
    cleanHeader: string;
    defaultTitle: string;
  }

  const foundMarkers: FoundMarker[] = [];

  for (let l = 1; l < lines.length; l++) {
    const trimmed = lines[l].trim();
    for (const p of sectionPatterns) {
      if (p.regex.test(trimmed)) {
        foundMarkers.push({
          key: p.key,
          lineIdx: l,
          rawHeader: trimmed,
          cleanHeader: cleanHeaderText(trimmed),
          defaultTitle: p.defaultTitle,
        });
        break;
      }
    }
  }

  // 1. Intro content (everything between title line and first ## section)
  const firstSectionLine = foundMarkers[0] ? foundMarkers[0].lineIdx : lines.length;
  const introContent = lines.slice(1, firstSectionLine).join('\n').trim();

  // 2. Map of core sections
  const sectionsMap = {} as Record<OneshotSectionKey, OneshotSection>;

  // Self
  const selfMarker = foundMarkers.find((m) => m.key === 'self');
  const awarenessMarker = foundMarkers.find((m) => m.key === 'awareness');
  const faithMarker = foundMarkers.find((m) => m.key === 'faith');
  const ethicsMarker = foundMarkers.find((m) => m.key === 'ethics');
  const conclusionMarker = foundMarkers.find((m) => m.key === 'conclusion');

  const selfContent = selfMarker
    ? lines
        .slice(
          selfMarker.lineIdx + 1,
          awarenessMarker ? awarenessMarker.lineIdx : lines.length
        )
        .join('\n')
        .trim()
    : '';

  const awarenessContent = awarenessMarker
    ? lines
        .slice(
          awarenessMarker.lineIdx + 1,
          faithMarker ? faithMarker.lineIdx : lines.length
        )
        .join('\n')
        .trim()
    : '';

  const faithContent = faithMarker
    ? lines
        .slice(
          faithMarker.lineIdx + 1,
          ethicsMarker ? ethicsMarker.lineIdx : lines.length
        )
        .join('\n')
        .trim()
    : '';

  const ethicsContent = ethicsMarker
    ? lines
        .slice(
          ethicsMarker.lineIdx + 1,
          conclusionMarker ? conclusionMarker.lineIdx : lines.length
        )
        .join('\n')
        .trim()
    : '';

  // Conclusion includes conclusion and any following sections like references
  const conclusionContent = conclusionMarker
    ? lines.slice(conclusionMarker.lineIdx + 1).join('\n').trim()
    : '';

  // 3. Topics synthesis (Summarizing the key topics of the chapter)
  const topicsContent = [
    `### สรุปประเด็นหลักประจำเกาะ (Core Island Topics)`,
    ``,
    `> **แก่นสาระสำคัญ (Core Focus):** ${coreFocus}`,
    ``,
    `* **S — Self (มิติแห่งตน):** ${selfMarker?.cleanHeader || 'การตระหนักรู้สัจธรรมแห่งตน'}`,
    `* **A — Awareness (มิติการตื่นรู้):** ${awarenessMarker?.cleanHeader || 'รู้เท่าทันสิ่งล่อลวงและกับดักความคิด'}`,
    `* **F — Faith (มิติความศรัทธา):** ${faithMarker?.cleanHeader || 'การวางใจในพระผู้เป็นเจ้าบนฐานตรรกะ'}`,
    `* **E — Ethics (มิติจริยธรรมเชิงประจักษ์):** ${ethicsMarker?.cleanHeader || 'การดำเนินชีวิตอย่างมีระบบและไม่งมงาย'}`,
  ].join('\n');

  sectionsMap.topics = {
    key: 'topics',
    title: 'สรุปประเด็นสำคัญประจำเกาะ (Core Topics)',
    header: 'Topics',
    content: topicsContent,
  };

  sectionsMap.intro = {
    key: 'intro',
    title: 'เนื้อหาเกริ่นนำ (Narrative Lead)',
    header: 'เนื้อหาเกริ่นนำ',
    content: introContent,
  };

  sectionsMap.self = {
    key: 'self',
    title: selfMarker?.cleanHeader || '1. มิติแห่งตน (Self)',
    header: selfMarker?.cleanHeader || '1. มิติแห่งตน (Self)',
    content: selfContent,
  };

  sectionsMap.awareness = {
    key: 'awareness',
    title: awarenessMarker?.cleanHeader || '2. มิติการตื่นรู้ (Awareness)',
    header: awarenessMarker?.cleanHeader || '2. มิติการตื่นรู้ (Awareness)',
    content: awarenessContent,
  };

  sectionsMap.faith = {
    key: 'faith',
    title: faithMarker?.cleanHeader || '3. มิติความศรัทธา (Faith)',
    header: faithMarker?.cleanHeader || '3. มิติความศรัทธา (Faith)',
    content: faithContent,
  };

  sectionsMap.ethics = {
    key: 'ethics',
    title: ethicsMarker?.cleanHeader || '4. มิติจริยธรรมเชิงประจักษ์ (Ethics)',
    header: ethicsMarker?.cleanHeader || '4. มิติจริยธรรมเชิงประจักษ์ (Ethics)',
    content: ethicsContent,
  };

  sectionsMap.conclusion = {
    key: 'conclusion',
    title: 'บทสรุปและการตกผลึกชีวิต พร้อมเอกสารอ้างอิงเชิงวิชาการ',
    header: 'บทสรุปส่งท้าย พร้อมอ้างอิงเอกสาร',
    content: conclusionContent,
  };

  const sectionList: OneshotSection[] = [
    sectionsMap.topics,
    sectionsMap.intro,
    sectionsMap.self,
    sectionsMap.awareness,
    sectionsMap.faith,
    sectionsMap.ethics,
    sectionsMap.conclusion,
  ];

  const fullText = chunk;
  const readingTimeMinutes = calculateReadingTime(fullText);
  const slug = SLUG_MAP[chapterNumber] || `chapter-${chapterNumber}`;
  const image =
    IMAGE_MAP[chapterNumber] ||
    `/images/oneshot/Oneshot${chapterNumber}_main.jpg`;
  const excerpt =
    introContent.replace(/[*#_~`>[\]()!+-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220) + '...';

  // Load Audio Info if available
  let audioInfo: any = null;
  try {
    const metaPath = path.join(process.cwd(), 'data', 'oneshot_audio_meta.json');
    if (fs.existsSync(metaPath)) {
      const allAudio = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      if (allAudio[chapterNumber]) {
        audioInfo = allAudio[chapterNumber];
      }
    }
  } catch (err) {
    // Ignore error
  }

  const audioBase = (
    process.env.NEXT_PUBLIC_AUDIO_BASE_URL ||
    'https://pub-f97e75c998b047ada96253d539c8f805.r2.dev'
  ).replace(/\/+$/, '');

  if (audioInfo && audioBase) {
    audioInfo = {
      ...audioInfo,
      full: audioInfo.full
        ? {
            ...audioInfo.full,
            url: audioInfo.full.url.startsWith('http')
              ? audioInfo.full.url
              : `${audioBase}${audioInfo.full.url}`,
          }
        : undefined,
      parts: Array.isArray(audioInfo.parts)
        ? audioInfo.parts.map((pt: any) => ({
            ...pt,
            url: pt.url.startsWith('http') ? pt.url : `${audioBase}${pt.url}`,
          }))
        : [],
    };
  }

  const audioUrl =
    audioInfo?.full?.url ||
    `${audioBase}/audio/oneshot/island${chapterNumber}-full.mp3`;
  const audioDuration = audioInfo?.full?.duration || '16:30';

  return {
    id: `oneshot-${chapterNumber}`,
    chapterNumber,
    slug,
    titleEn,
    titleTh,
    coreFocus,
    excerpt,
    image,
    sections: sectionsMap,
    sectionList,
    readingTimeMinutes,
    audio: audioInfo || undefined,
    audioUrl,
    audioDuration,
    status: 'published',
    publishedAt: SHALLOW_WATERS_RELEASE_ISO,
  };
}

/**
 * Load and cache all oneshot chapters from Assets directory
 */
export async function getAllOneshotChapters(): Promise<OneshotChapter[]> {
  const filePath = getOneshotFilePath();
  if (!filePath || !fs.existsSync(filePath)) {
    return cachedChapters || [];
  }

  try {
    const stat = fs.statSync(filePath);
    const metaPath = path.join(process.cwd(), 'data', 'oneshot_audio_meta.json');
    const metaMtime = fs.existsSync(metaPath) ? fs.statSync(metaPath).mtimeMs : 0;
    const combinedMtime = stat.mtimeMs + metaMtime;
    if (cachedChapters && combinedMtime === lastModifiedTime) {
      return cachedChapters;
    }

    const text = readDecodedFile(filePath);

    // Split text by chapter header '# Safe'
    const rawChapters = text
      .split(/(?=^#\s+Safe\s+)/m)
      .filter((c) => c.trim().startsWith('# Safe'));

    const chapters: OneshotChapter[] = rawChapters.map((raw, idx) =>
      parseChapterChunk(raw.trim(), idx + 1)
    );

    cachedChapters = chapters;
    lastModifiedTime = combinedMtime;
    return chapters;
  } catch (error) {
    console.error('Failed to parse oneshot chapters:', error);
    return cachedChapters || [];
  }
}

/**
 * Get a single chapter by slug
 */
export async function getOneshotChapterBySlug(
  slug: string
): Promise<OneshotChapter | null> {
  const chapters = await getAllOneshotChapters();
  return chapters.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
}

/**
 * Get a single chapter by chapter number (1 to 7)
 */
export async function getOneshotChapterByNumber(
  num: number
): Promise<OneshotChapter | null> {
  const chapters = await getAllOneshotChapters();
  return chapters.find((c) => c.chapterNumber === num) || null;
}

/**
 * Get adjacent chapters for Prev/Next navigation
 */
export async function getAdjacentOneshotChapter(currentChapterNumber: number): Promise<{
  prev: OneshotChapter | null;
  next: OneshotChapter | null;
}> {
  const chapters = await getAllOneshotChapters();
  const prev =
    chapters.find((c) => c.chapterNumber === currentChapterNumber - 1) || null;
  const next =
    chapters.find((c) => c.chapterNumber === currentChapterNumber + 1) || null;

  return { prev, next };
}
