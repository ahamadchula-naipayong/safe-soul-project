const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inputDir = path.join(__dirname, '..', 'Assets', 'SAFE oneshot chapter');
const outputDir = path.join(__dirname, '..', 'public', 'audio', 'oneshot');
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const islandMappings = [
  {
    chapterNumber: 1,
    slug: 'safe-from-the-dunya',
    titleEn: 'Safe from the Dunya',
    titleTh: 'ศิลปะแห่งการระวังตนและสร้างภูมิคุ้มกันชีวิตภายใต้ครรลองแห่งปัญญา',
    filePart1: 'Safe from Dunya part01.mp3',
    filePart2: 'Safe from Dunya part02.mp3',
    outPart1: 'island1-part1.mp3',
    outPart2: 'island1-part2.mp3',
    outFull: 'island1-full.mp3',
  },
  {
    chapterNumber: 2,
    slug: 'safe-from-shirk',
    titleEn: 'Safe from Shirk',
    titleTh: 'ภูมิคุ้มกันชิรก์และการตั้งภาคีที่ซ่อนเร้นในยุคสมัยใหม่',
    filePart1: 'Safe from Shirik part01.mp3',
    filePart2: 'Safe from Shirik part02.mp3',
    outPart1: 'island2-part1.mp3',
    outPart2: 'island2-part2.mp3',
    outFull: 'island2-full.mp3',
  },
  {
    chapterNumber: 3,
    slug: 'safe-from-nafs',
    titleEn: 'Safe from Nafs',
    titleTh: 'การควบคุมนัฟซูและกิเลสภายในเพื่ออิสรภาพของจิตวิญญาณ',
    filePart1: 'Safe from Nafs part01.mp3',
    filePart2: 'Safe from Nafs part02.mp3',
    outPart1: 'island3-part1.mp3',
    outPart2: 'island3-part2.mp3',
    outFull: 'island3-full.mp3',
  },
  {
    chapterNumber: 4,
    slug: 'safe-for-rizq',
    titleEn: 'Safe for Rizq',
    titleTh: 'ความกังวลในริสกีและการพึ่งพาพระเจ้าในโลกแห่งความไม่แน่นอน',
    filePart1: 'Safe for Rizq part01.mp3',
    filePart2: 'Safe for Rizq part02.mp3',
    outPart1: 'island4-part1.mp3',
    outPart2: 'island4-part2.mp3',
    outFull: 'island4-full.mp3',
  },
  {
    chapterNumber: 5,
    slug: 'safe-from-hype',
    titleEn: 'Safe from Fitnah & Deception',
    titleTh: 'การรอดพ้นจากกระแสลวง ฟิตนะฮ์ และภาพลวงตาทางสังคม',
    filePart1: 'Safe from Hype part01.mp3',
    filePart2: 'Safe from Hype part02.mp3',
    outPart1: 'island5-part1.mp3',
    outPart2: 'island5-part2.mp3',
    outFull: 'island5-full.mp3',
  },
  {
    chapterNumber: 6,
    slug: 'safe-from-haram',
    titleEn: 'Safe from Haram & Doubt',
    titleTh: 'ความปลอดภัยจากสิ่งฮารอมและความคลุมเครือในวิถีชีวิต',
    filePart1: 'Safe from Haram part01.mp3',
    filePart2: 'Safe from Haram part02.mp3',
    outPart1: 'island6-part1.mp3',
    outPart2: 'island6-part2.mp3',
    outFull: 'island6-full.mp3',
  },
  {
    chapterNumber: 7,
    slug: 'safe-for-barzakh',
    titleEn: 'Safe for Barzakh & Beyond',
    titleTh: 'การเตรียมพร้อมสู่โลกบัรซัคและการเปลี่ยนผ่านสู่นิรันดร',
    filePart1: 'Safe for Barzakh part01.mp3',
    filePart2: 'Safe for Barzakh part02.mp3',
    outPart1: 'island7-part1.mp3',
    outPart2: 'island7-part2.mp3',
    outFull: 'island7-full.mp3',
  },
];

function getDurationFormatted(filePath) {
  try {
    const raw = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`).toString().trim();
    const sec = parseFloat(raw);
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return {
      seconds: sec,
      formatted: `${m}:${s < 10 ? '0' : ''}${s}`,
      minutes: Math.ceil(sec / 60)
    };
  } catch (err) {
    console.error('Error probing', filePath, err.message);
    return { seconds: 0, formatted: '0:00', minutes: 0 };
  }
}

const audioMetadata = {};

console.log('--- Processing Shallow Ocean Audio Files ---');

islandMappings.forEach((item) => {
  const src1 = path.join(inputDir, item.filePart1);
  const src2 = path.join(inputDir, item.filePart2);
  const dest1 = path.join(outputDir, item.outPart1);
  const dest2 = path.join(outputDir, item.outPart2);
  const destFull = path.join(outputDir, item.outFull);

  console.log(`\n[Island ${item.chapterNumber}] ${item.titleEn}`);

  // Copy Part 1
  if (fs.existsSync(src1)) {
    fs.copyFileSync(src1, dest1);
    console.log(`  ✓ Copied Part 1 -> ${item.outPart1}`);
  } else {
    console.error(`  ✗ Missing: ${src1}`);
  }

  // Copy Part 2
  if (fs.existsSync(src2)) {
    fs.copyFileSync(src2, dest2);
    console.log(`  ✓ Copied Part 2 -> ${item.outPart2}`);
  } else {
    console.error(`  ✗ Missing: ${src2}`);
  }

  // Concatenate using ffmpeg concat demuxer
  if (fs.existsSync(dest1) && fs.existsSync(dest2)) {
    const concatListPath = path.join(outputDir, `concat_${item.chapterNumber}.txt`);
    const listContent = `file '${path.resolve(dest1).replace(/\\/g, '/')}'\nfile '${path.resolve(dest2).replace(/\\/g, '/')}'\n`;
    fs.writeFileSync(concatListPath, listContent, 'utf8');

    try {
      execSync(`ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c copy "${destFull}"`, { stdio: 'pipe' });
      console.log(`  ✓ Created Combined Full Audio -> ${item.outFull}`);
      fs.unlinkSync(concatListPath);
    } catch (err) {
      console.error(`  ✗ Failed to concat ${item.outFull}:`, err.message);
    }
  }

  const dur1 = fs.existsSync(dest1) ? getDurationFormatted(dest1) : { formatted: '0:00', seconds: 0 };
  const dur2 = fs.existsSync(dest2) ? getDurationFormatted(dest2) : { formatted: '0:00', seconds: 0 };
  const durFull = fs.existsSync(destFull) ? getDurationFormatted(destFull) : { formatted: '0:00', seconds: 0 };

  console.log(`    Part 1 Duration: ${dur1.formatted} (${dur1.seconds.toFixed(1)}s)`);
  console.log(`    Part 2 Duration: ${dur2.formatted} (${dur2.seconds.toFixed(1)}s)`);
  console.log(`    Full Duration:   ${durFull.formatted} (${durFull.seconds.toFixed(1)}s)`);

  audioMetadata[item.chapterNumber] = {
    chapterNumber: item.chapterNumber,
    slug: item.slug,
    titleEn: item.titleEn,
    titleTh: item.titleTh,
    parts: [
      {
        partNumber: 1,
        title: `Part 1 (บทนำและมิติแห่งตน)`,
        url: `/audio/oneshot/${item.outPart1}`,
        duration: dur1.formatted,
        seconds: dur1.seconds,
      },
      {
        partNumber: 2,
        title: `Part 2 (มิติการตื่นรู้ จริยธรรม และบทสรุป)`,
        url: `/audio/oneshot/${item.outPart2}`,
        duration: dur2.formatted,
        seconds: dur2.seconds,
      },
    ],
    full: {
      title: `ฉบับสมบูรณ์ (Part 1 + 2 ต่อเนื่อง)`,
      url: `/audio/oneshot/${item.outFull}`,
      duration: durFull.formatted,
      seconds: durFull.seconds,
    },
  };
});

fs.writeFileSync(
  path.join(dataDir, 'oneshot_audio_meta.json'),
  JSON.stringify(audioMetadata, null, 2),
  'utf8'
);

console.log('\n✓ Saved metadata to data/oneshot_audio_meta.json');
console.log('Done!');
