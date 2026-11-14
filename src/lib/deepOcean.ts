import fs from 'fs';
import path from 'path';
import { DeepOceanArchipelago, DeepOceanSubIsland, ArticleStatus } from '@/types';

// In-memory cache
let cachedArchipelagos: DeepOceanArchipelago[] | null = null;
let lastModifiedTime = 0;

/**
 * Official 10 Deep Ocean Archipelagos Order (as organized in Assets/SAFE deep ocean):
 * 1. Island1Dunya     -> Safe from Dunya
 * 2. Island2Haram     -> Safe from Haram
 * 3. Island3Nafsu     -> Safe from Nafsu
 * 4. Island4Rizq      -> Safe for Rizq
 * 5. Island5Hijab     -> Safe for Hijab
 * 6. Island6Hype      -> Safe from Hype
 * 7. Island7FakeIdol  -> Safe from Fake Idol
 * 8. Island8Shirk     -> Safe from Shirk
 * 9. Island9ShiaBeing -> Safe for Shia Being
 * 10. Island10Barzakh -> Safe for Barzakh
 */
export interface ArchipelagoCatalogConfig {
  archipelagoNumber: number;
  slug: string;
  imagePrefix: string;
  matchKeyword: string;
}

export const OFFICIAL_ARCHIPELAGO_ORDER: ArchipelagoCatalogConfig[] = [
  {
    archipelagoNumber: 1,
    slug: 'safe-from-dunya',
    imagePrefix: 'Island1Dunya',
    matchKeyword: 'dunya',
  },
  {
    archipelagoNumber: 2,
    slug: 'safe-from-haram',
    imagePrefix: 'Island2Haram',
    matchKeyword: 'haram',
  },
  {
    archipelagoNumber: 3,
    slug: 'safe-from-nafsu',
    imagePrefix: 'Island3Nafsu',
    matchKeyword: 'nafsu',
  },
  {
    archipelagoNumber: 4,
    slug: 'safe-for-rizq',
    imagePrefix: 'Island4Rizq',
    matchKeyword: 'rizq',
  },
  {
    archipelagoNumber: 5,
    slug: 'safe-for-hijab',
    imagePrefix: 'Island5Hijab',
    matchKeyword: 'hijab',
  },
  {
    archipelagoNumber: 6,
    slug: 'safe-from-hype',
    imagePrefix: 'Island6Hype',
    matchKeyword: 'hype',
  },
  {
    archipelagoNumber: 7,
    slug: 'safe-from-fake-idol',
    imagePrefix: 'Island7FakeIdol',
    matchKeyword: 'fake idol',
  },
  {
    archipelagoNumber: 8,
    slug: 'safe-from-shirk',
    imagePrefix: 'Island8Shirk',
    matchKeyword: 'shirk',
  },
  {
    archipelagoNumber: 9,
    slug: 'safe-for-shia-being',
    imagePrefix: 'Island9ShiaBeing',
    matchKeyword: 'shia being',
  },
  {
    archipelagoNumber: 10,
    slug: 'safe-for-barzakh',
    imagePrefix: 'Island10Barzakh',
    matchKeyword: 'barzakh',
  },
];

function getAudioBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_AUDIO_BASE_URL ||
    'https://pub-f97e75c998b047ada96253d539c8f805.r2.dev';
  return base.replace(/\/+$/, '');
}

function getDeepOceanFilePath(): string | null {
  const deepDir = path.join(process.cwd(), 'Assets', 'SAFE deep ocean');
  if (!fs.existsSync(deepDir)) return null;

  const files = fs.readdirSync(deepDir);
  const mdFile = files.find((f) => f.toLowerCase().endsWith('.md'));
  if (mdFile) return path.join(deepDir, mdFile);

  return null;
}

function getOverridesFilePath(): string {
  return path.join(process.cwd(), 'data', 'ocean_articles_override.json');
}

function readOverrides(): Record<string, Partial<DeepOceanSubIsland>> {
  try {
    const p = getOverridesFilePath();
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read ocean article overrides:', err);
  }
  return {};
}

export function saveDeepOceanArticleOverride(
  articleKey: string,
  updates: Partial<DeepOceanSubIsland>
) {
  try {
    const p = getOverridesFilePath();
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const current = readOverrides();
    current[articleKey] = {
      ...(current[articleKey] || {}),
      ...updates,
    };

    fs.writeFileSync(p, JSON.stringify(current, null, 2), 'utf8');

    // Invalidate cache
    cachedArchipelagos = null;
    return true;
  } catch (err) {
    console.error('Failed to save ocean article override:', err);
    return false;
  }
}

function calculateReadingTime(text: string): number {
  const chars = text.length;
  return Math.max(6, Math.ceil(chars / 450));
}

/**
 * Check whether an article is visible based on status & scheduled date
 */
export function isArticleVisible(
  status: ArticleStatus,
  publishedAt?: string,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true;
  if (status === 'published') return true;
  if (status === 'scheduled' && publishedAt) {
    const pubDate = new Date(publishedAt).getTime();
    return !isNaN(pubDate) && Date.now() >= pubDate;
  }
  return false;
}

export async function getAllDeepOceanArchipelagos(): Promise<DeepOceanArchipelago[]> {
  const filePath = getDeepOceanFilePath();
  if (!filePath || !fs.existsSync(filePath)) {
    return cachedArchipelagos || [];
  }

  try {
    const stat = fs.statSync(filePath);
    if (cachedArchipelagos && stat.mtimeMs === lastModifiedTime) {
      return cachedArchipelagos;
    }

    const text = fs.readFileSync(filePath, 'utf8');
    const overrides = readOverrides();
    const audioBase = getAudioBaseUrl();

    const rawSeriesMatches: {
      titleEn: string;
      titleTh: string;
      index: number;
      chunk: string;
    }[] = [];

    const regex = /^#\s+(Safe\s+(?:from|for)\s+[^:\n]+):\s*([^\n]+)/gim;
    const foundHeaders: { titleEn: string; titleTh: string; index: number }[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      foundHeaders.push({
        titleEn: match[1].trim(),
        titleTh: match[2].trim(),
        index: match.index,
      });
    }

    for (let i = 0; i < foundHeaders.length; i++) {
      const nextIdx = foundHeaders[i + 1] ? foundHeaders[i + 1].index : text.length;
      rawSeriesMatches.push({
        ...foundHeaders[i],
        chunk: text.slice(foundHeaders[i].index, nextIdx),
      });
    }

    // Order strictly according to OFFICIAL_ARCHIPELAGO_ORDER (Island1Dunya -> Island10Barzakh)
    const archipelagos: DeepOceanArchipelago[] = OFFICIAL_ARCHIPELAGO_ORDER.map(
      (cfg) => {
        const matchedSeries =
          rawSeriesMatches.find((s) =>
            s.titleEn.toLowerCase().includes(cfg.matchKeyword.toLowerCase())
          ) || rawSeriesMatches[cfg.archipelagoNumber - 1];

        const archipelagoNumber = cfg.archipelagoNumber;
        const baseSlug = cfg.slug;
        const imagePrefix = cfg.imagePrefix;
        const chunk = matchedSeries ? matchedSeries.chunk : '';

        // Extract subtitle from *ชุดบทความ...*
        const subMatch = chunk.match(/^\*([^*]+)\*/m);
        const subtitle = subMatch ? subMatch[1].trim() : '';

        // Split into 5 chapters
        const chParts = chunk.split(/(?=^#\s+บทที่\s+\d+)/m);
        const subIslands: DeepOceanSubIsland[] = [];

        for (let c = 1; c < chParts.length; c++) {
          const chChunk = chParts[c].trim();
          const firstLine = chChunk.split('\n')[0].replace(/^#\s*/, '').trim();
          const content = chChunk.slice(chChunk.indexOf('\n') + 1).trim();
          const excerpt =
            content
              .replace(/[*#_~`>[\]()!+-]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 220) + '...';

          const subSlug = `${baseSlug}-ch-${c}`;
          const overrideKey = `${baseSlug}-ch-${c}`;
          const override = overrides[overrideKey] || {};

          // Default unlock: Chapter 1 of Archipelagos 1-7 is unlocked for Free Tier 1
          const defaultUnlocked = archipelagoNumber <= 7 && c === 1;
          const defaultStatus: ArticleStatus = 'published';

          const defaultCoverImage = `/images/deep-ocean/${imagePrefix}_0${c}_HiRes.jpg`;
          const defaultAudioUrl = `${audioBase}/audio/deep-ocean/${imagePrefix}_0${c}_normalized.mp3`;

          const finalSubIsland: DeepOceanSubIsland = {
            chapterNumber: c,
            slug: subSlug,
            title: override.title || firstLine,
            excerpt: override.excerpt || excerpt,
            content: override.content || content,
            status: override.status || defaultStatus,
            publishedAt: override.publishedAt,
            isUnlocked:
              override.isUnlocked !== undefined ? override.isUnlocked : defaultUnlocked,
            audioUrl: override.audioUrl || defaultAudioUrl,
            audioDuration: override.audioDuration || '~16:00',
            readingTimeMinutes: calculateReadingTime(override.content || content),
            coverImage: override.coverImage || defaultCoverImage,
          };

          subIslands.push(finalSubIsland);
        }

        const defaultArchipelagoImage = `/images/deep-ocean/${imagePrefix}_main_HiRes.jpg`;

        return {
          id: `deep-ocean-${archipelagoNumber}`,
          archipelagoNumber,
          slug: baseSlug,
          titleEn: matchedSeries?.titleEn || cfg.imagePrefix,
          titleTh: matchedSeries?.titleTh || '',
          subtitle,
          status: 'published',
          coverImage: defaultArchipelagoImage,
          subIslandsCount: subIslands.length,
          subIslands,
        };
      }
    );

    cachedArchipelagos = archipelagos;
    lastModifiedTime = stat.mtimeMs;
    return archipelagos;
  } catch (error) {
    console.error('Failed to parse deep ocean archipelagos:', error);
    return cachedArchipelagos || [];
  }
}

export async function getDeepOceanArchipelagoBySlug(
  slug: string
): Promise<DeepOceanArchipelago | null> {
  const archipelagos = await getAllDeepOceanArchipelagos();
  return (
    archipelagos.find((a) => a.slug.toLowerCase() === slug.toLowerCase()) || null
  );
}

export async function getDeepOceanSubIsland(
  archipelagoSlug: string,
  chapterNumber: number
): Promise<{
  archipelago: DeepOceanArchipelago;
  subIsland: DeepOceanSubIsland;
  prev: DeepOceanSubIsland | null;
  next: DeepOceanSubIsland | null;
} | null> {
  const archipelago = await getDeepOceanArchipelagoBySlug(archipelagoSlug);
  if (!archipelago) return null;

  const subIsland = archipelago.subIslands.find(
    (s) => s.chapterNumber === chapterNumber
  );
  if (!subIsland) return null;

  const prev =
    archipelago.subIslands.find((s) => s.chapterNumber === chapterNumber - 1) || null;
  const next =
    archipelago.subIslands.find((s) => s.chapterNumber === chapterNumber + 1) || null;

  return {
    archipelago,
    subIsland,
    prev,
    next,
  };
}
