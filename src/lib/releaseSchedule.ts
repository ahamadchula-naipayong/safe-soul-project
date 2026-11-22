/**
 * Official Content Release Schedule (W1 - W23 at 05:00 AM Thailand Time +07:00)
 * Based on the official master publication schedule:
 * - W1 (Thu 19 Nov 2026 05:00): Opensea 1-7 (All 7 Shallow Waters Islands)
 * - W2 (Tue 24 Nov - Sat 28 Nov 2026 05:00): Deepocean 1/1, 2/1, 3/1, 4/1, 5/1
 * - W3 - W12 (Tue & Thu 05:00): Deepocean 1/2..1/5 through 5/2..5/5
 * - W13 (Tue 09 Feb - Sat 13 Feb 2027 05:00): Deepocean 6/1, 7/1, 8/1, 9/1, 10/1
 * - W14 - W23 (Tue & Thu 05:00): Deepocean 6/2..6/5 through 10/2..10/5
 */

export const SHALLOW_WATERS_RELEASE_ISO = '2026-11-19T05:00:00+07:00';

/**
 * Key format: `${archipelagoNumber}/${chapterNumber}` (e.g. '1/1', '10/5')
 * Value: ISO 8601 timestamp at 05:00:00+07:00
 */
export const DEEP_OCEAN_RELEASE_SCHEDULE: Record<string, { iso: string; week: string }> = {
  // W2 (Mon 23-Nov-2026): Intro Chapters 1/1 to 5/1 (Tue - Sat)
  '1/1': { iso: '2026-11-24T05:00:00+07:00', week: 'W2' },
  '2/1': { iso: '2026-11-25T05:00:00+07:00', week: 'W2' },
  '3/1': { iso: '2026-11-26T05:00:00+07:00', week: 'W2' },
  '4/1': { iso: '2026-11-27T05:00:00+07:00', week: 'W2' },
  '5/1': { iso: '2026-11-28T05:00:00+07:00', week: 'W2' },

  // W3 (Mon 30-Nov-2026) & W4 (Mon 07-Dec-2026): Archipelago 1 (Dunya) Ch 2-5
  '1/2': { iso: '2026-12-01T05:00:00+07:00', week: 'W3' },
  '1/3': { iso: '2026-12-03T05:00:00+07:00', week: 'W3' },
  '1/4': { iso: '2026-12-08T05:00:00+07:00', week: 'W4' },
  '1/5': { iso: '2026-12-10T05:00:00+07:00', week: 'W4' },

  // W5 (Mon 14-Dec-2026) & W6 (Mon 21-Dec-2026): Archipelago 2 (Haram) Ch 2-5
  '2/2': { iso: '2026-12-15T05:00:00+07:00', week: 'W5' },
  '2/3': { iso: '2026-12-17T05:00:00+07:00', week: 'W5' },
  '2/4': { iso: '2026-12-22T05:00:00+07:00', week: 'W6' },
  '2/5': { iso: '2026-12-24T05:00:00+07:00', week: 'W6' },

  // W7 (Mon 28-Dec-2026) & W8 (Mon 04-Jan-2027): Archipelago 3 (Nafsu) Ch 2-5
  '3/2': { iso: '2026-12-29T05:00:00+07:00', week: 'W7' },
  '3/3': { iso: '2026-12-31T05:00:00+07:00', week: 'W7' },
  '3/4': { iso: '2027-01-05T05:00:00+07:00', week: 'W8' },
  '3/5': { iso: '2027-01-07T05:00:00+07:00', week: 'W8' },

  // W9 (Mon 11-Jan-2027) & W10 (Mon 18-Jan-2027): Archipelago 4 (Rizq) Ch 2-5
  '4/2': { iso: '2027-01-12T05:00:00+07:00', week: 'W9' },
  '4/3': { iso: '2027-01-14T05:00:00+07:00', week: 'W9' },
  '4/4': { iso: '2027-01-19T05:00:00+07:00', week: 'W10' },
  '4/5': { iso: '2027-01-21T05:00:00+07:00', week: 'W10' },

  // W11 (Mon 25-Jan-2027) & W12 (Mon 01-Feb-2027): Archipelago 5 (Hijab) Ch 2-5
  '5/2': { iso: '2027-01-26T05:00:00+07:00', week: 'W11' },
  '5/3': { iso: '2027-01-28T05:00:00+07:00', week: 'W11' },
  '5/4': { iso: '2027-02-02T05:00:00+07:00', week: 'W12' },
  '5/5': { iso: '2027-02-04T05:00:00+07:00', week: 'W12' },

  // W13 (Mon 08-Feb-2027): Intro Chapters 6/1 to 10/1 (Tue - Sat)
  '6/1': { iso: '2027-02-09T05:00:00+07:00', week: 'W13' },
  '7/1': { iso: '2027-02-10T05:00:00+07:00', week: 'W13' },
  '8/1': { iso: '2027-02-11T05:00:00+07:00', week: 'W13' },
  '9/1': { iso: '2027-02-12T05:00:00+07:00', week: 'W13' },
  '10/1': { iso: '2027-02-13T05:00:00+07:00', week: 'W13' },

  // W14 (Mon 15-Feb-2027) & W15 (Mon 22-Feb-2027): Archipelago 6 (Hype) Ch 2-5
  '6/2': { iso: '2027-02-16T05:00:00+07:00', week: 'W14' },
  '6/3': { iso: '2027-02-18T05:00:00+07:00', week: 'W14' },
  '6/4': { iso: '2027-02-23T05:00:00+07:00', week: 'W15' },
  '6/5': { iso: '2027-02-25T05:00:00+07:00', week: 'W15' },

  // W16 (Mon 01-Mar-2027) & W17 (Mon 08-Mar-2027): Archipelago 7 (Fake Idol) Ch 2-5
  '7/2': { iso: '2027-03-02T05:00:00+07:00', week: 'W16' },
  '7/3': { iso: '2027-03-04T05:00:00+07:00', week: 'W16' },
  '7/4': { iso: '2027-03-09T05:00:00+07:00', week: 'W17' },
  '7/5': { iso: '2027-03-11T05:00:00+07:00', week: 'W17' },

  // W18 (Mon 15-Mar-2027) & W19 (Mon 22-Mar-2027): Archipelago 8 (Shirk) Ch 2-5
  '8/2': { iso: '2027-03-16T05:00:00+07:00', week: 'W18' },
  '8/3': { iso: '2027-03-18T05:00:00+07:00', week: 'W18' },
  '8/4': { iso: '2027-03-23T05:00:00+07:00', week: 'W19' },
  '8/5': { iso: '2027-03-25T05:00:00+07:00', week: 'W19' },

  // W20 (Mon 29-Mar-2027) & W21 (Mon 05-Apr-2027): Archipelago 9 (Shia Being) Ch 2-5
  '9/2': { iso: '2027-03-30T05:00:00+07:00', week: 'W20' },
  '9/3': { iso: '2027-04-01T05:00:00+07:00', week: 'W20' },
  '9/4': { iso: '2027-04-06T05:00:00+07:00', week: 'W21' },
  '9/5': { iso: '2027-04-08T05:00:00+07:00', week: 'W21' },

  // W22 (Mon 12-Apr-2027) & W23 (Mon 19-Apr-2027): Archipelago 10 (Barzakh) Ch 2-5
  '10/2': { iso: '2027-04-13T05:00:00+07:00', week: 'W22' },
  '10/3': { iso: '2027-04-15T05:00:00+07:00', week: 'W22' },
  '10/4': { iso: '2027-04-20T05:00:00+07:00', week: 'W23' },
  '10/5': { iso: '2027-04-22T05:00:00+07:00', week: 'W23' },
};

const THAI_MONTHS_SHORT = [
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

const THAI_DAYS = [
  'อาทิตย์',
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
];

export function getDeepOceanScheduledIso(
  archipelagoNumber: number,
  chapterNumber: number
): string {
  const key = `${archipelagoNumber}/${chapterNumber}`;
  return DEEP_OCEAN_RELEASE_SCHEDULE[key]?.iso || '2026-11-24T05:00:00+07:00';
}

export function getDeepOceanScheduleWeek(
  archipelagoNumber: number,
  chapterNumber: number
): string {
  const key = `${archipelagoNumber}/${chapterNumber}`;
  return DEEP_OCEAN_RELEASE_SCHEDULE[key]?.week || 'W2';
}

export function isReleasedBySchedule(publishedAt?: string): boolean {
  if (!publishedAt) return true;
  const t = new Date(publishedAt).getTime();
  if (isNaN(t)) return true;
  return Date.now() >= t;
}

export function formatThaiScheduleDate(
  isoString?: string,
  includeDayOfWeek = true
): string {
  if (!isoString) return '19 พ.ย. 2026 เวลา 05:00 น.';
  const dt = new Date(isoString);
  if (isNaN(dt.getTime())) return isoString;

  // Convert to Thailand time (+07:00) components deterministically
  const bangkokMs = dt.getTime() + 7 * 60 * 60 * 1000;
  const bkk = new Date(bangkokMs);
  const dayOfWeek = THAI_DAYS[bkk.getUTCDay()];
  const day = bkk.getUTCDate();
  const month = THAI_MONTHS_SHORT[bkk.getUTCMonth()];
  const year = bkk.getUTCFullYear();
  const hours = String(bkk.getUTCHours()).padStart(2, '0');
  const mins = String(bkk.getUTCMinutes()).padStart(2, '0');

  if (includeDayOfWeek) {
    return `วัน${dayOfWeek}ที่ ${day} ${month} ${year} เวลา ${hours}:${mins} น.`;
  }
  return `${day} ${month} ${year} (${hours}:${mins} น.)`;
}
