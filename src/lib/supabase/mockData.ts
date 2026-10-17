import { Series, Chapter, Product, SponsorSlot, FoundingSlotsQuota } from '@/types';

export const mockSeries: Series[] = [
  {
    id: 'series-1',
    slug: 'safe-from-dunya',
    order_index: 1,
    title_th: 'ปลอดภัยจากดุนยา',
    title_en: 'Safe from the Dunya',
    dimension: 'มิติที่ 1: มิติแห่งตนและการครองสติ',
    description_th: 'ศิลปะแห่งการระวังตน เดินใต้แสงแห่งปัญญา โดยไม่หลงไปกับประกายของโลกวัตถุนิยม',
    cover_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    color_accent: '#F59E0B',
  },
  {
    id: 'series-2',
    slug: 'safe-heart-soul',
    order_index: 2,
    title_th: 'ปลอดภัยทางจิตวิญญาณ',
    title_en: 'Safe Heart & Soul',
    dimension: 'มิติที่ 2: ความสงบภายในและการเยียวยาใจ',
    description_th: 'การสร้างภูมิคุ้มกันทางจิตวิญญาณ ฟื้นฟูใจที่บอบช้ำจากความเร่งรีบและความวิตกกังวล',
    cover_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
    color_accent: '#10B981',
  },
  {
    id: 'series-3',
    slug: 'safe-mind-reason',
    order_index: 3,
    title_th: 'ปลอดภัยทางปัญญาและตรรกะ',
    title_en: 'Safe Mind & Reason',
    dimension: 'มิติที่ 3: ตรรกศาสตร์ วิทยาศาสตร์ และสัจธรรม',
    description_th: 'มองโลกผ่านแว่นแห่งตรรกศาสตร์ สถิติ และวิทยาศาสตร์ประสานเทววิทยาอันสง่างาม',
    cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    color_accent: '#3B82F6',
  },
  {
    id: 'series-4',
    slug: 'safe-wealth-barakah',
    order_index: 4,
    title_th: 'ปลอดภัยในการถือครองทรัพย์',
    title_en: 'Safe Wealth & Barakah',
    dimension: 'มิติที่ 1: ศิลปะการใช้ทรัพย์ไม่รับใช้ทรัพย์',
    description_th: 'ให้ทรัพย์อยู่ในมือในฐานะเครื่องมือสร้างประโยชน์ อย่าให้มันขึ้นครองบัลลังก์ในหัวใจ',
    cover_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    color_accent: '#D97706',
  },
  {
    id: 'series-5',
    slug: 'safe-family-society',
    order_index: 5,
    title_th: 'ปลอดภัยในความสัมพันธ์',
    title_en: 'Safe Family & Society',
    dimension: 'มิติที่ 4: ครอบครัวและสังคมอันบริสุทธิ์',
    description_th: 'การปกป้องพื้นที่ศักดิ์สิทธิ์ของครอบครัว การสื่อสารด้วยเมตตาธรรม และการยืนหยัดเพื่อสังคม',
    cover_image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    color_accent: '#EC4899',
  },
  {
    id: 'series-6',
    slug: 'safe-from-tribulations',
    order_index: 6,
    title_th: 'ปลอดภัยในบททดสอบ',
    title_en: 'Safe from Tribulations',
    dimension: 'มิติที่ 2: การเผชิญวิกฤตและความหนักแน่น',
    description_th: 'ถอดรหัสความเจ็บปวด เมื่อโลกทดสอบความอดทน เปลี่ยนบาดแผลให้กลายเป็นพลังแห่งศรัทธา',
    cover_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    color_accent: '#8B5CF6',
  },
  {
    id: 'series-7',
    slug: 'safe-legacy-eternity',
    order_index: 7,
    title_th: 'มรดกและปลายทางนิรันดร์',
    title_en: 'Safe Legacy & Eternity',
    dimension: 'มิติที่ 4: การสร้างคุณค่าที่ไม่สูญสลาย',
    description_th: 'โลกคือไร่นาแห่งปรโลก การหว่านเมล็ดพันธุ์แห่งความดีที่จะผลิดอกออกผลข้ามกาลเวลา',
    cover_image: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80',
    color_accent: '#F59E0B',
  },
];

export const mockChapters: Chapter[] = [
  {
    id: 'chapter-1',
    series_id: 'series-1',
    chapter_number: 1,
    slug: 'art-of-self-awareness',
    title_th: 'ตอนที่ 1: ศิลปะแห่งการระวังตน และมิติแห่งตน',
    title_en: 'The Art of Self-Awareness & The Dimension of Self',
    excerpt: 'เดินใต้แสงแห่งปัญญา โดยไม่หลงไปกับประกายลวงตาของโลก เสียงดิจิทัลและความเร่งรีบ',
    easy_content: `### เรือที่ลอยอยู่เหนือน้ำ

ลองจินตนาการว่าคุณกำลังนั่งเรือข้ามมหาสมุทรที่กว้างใหญ่ น้ำในทะเลเปรียบเสมือนสิ่งของรอบตัวเราในโลก—เรือจำเป็นต้องใช้น้ำเพื่อพยุงให้ลอยไปข้างหน้า แต่ถ้าเมื่อไหร่ที่น้ำรั่วเข้ามาในเรือ เรือก็จะค่อยๆ จมลง

โลกใบนี้ก็เช่นกัน สิ่งของ เงินทอง ชื่อเสียง ไม่ได้เป็นสิ่งเลวร้ายในตัวมันเอง เราจำเป็นต้องมีสิ่งเหล่านี้เพื่อใช้ชีวิต เลี้ยงดูครอบครัว และช่วยเหลือผู้อื่น ปัญหาไม่ได้อยู่ที่การที่เรา "อยู่ในโลก" แต่อยู่ที่การที่เราปล่อยให้ "โลกเข้ามาอยู่ในใจเรา"

---

### เสียงกระซิบของยุคดิจิทัล

เมื่อคุณตื่นเช้าขึ้นมาในยุคที่โทรศัพท์มือถือแจ้งเตือนไม่หยุด ทุกคนดูเหมือนจะประสบความสำเร็จ รวยเร็ว และมีความสุขบนโซเชียลมีเดีย ใจของเราจึงเริ่มเปรียบเทียบและรู้สึกไม่พอ นั่นแหละคือน้ำที่เริ่มรั่วเข้าเรือ

ศิลปะแห่งการระวังตน (Self-Awareness) ในมิตินี้ จึงเริ่มต้นง่ายๆ ด้วยการหยุดหายใจลึกๆ และถามตัวเองทุกวัน:

> *"สิ่งที่เรากำลังวิ่งตามอยู่นี้ คือสิ่งที่เราต้องการจริงๆ หรือเราแค่วิ่งตามเพราะคนอื่นบอกว่าต้องมี?"*

เมื่อคุณเริ่มแยกแยะได้ ใจคุณจะเบาลงและปลอดภัย กายอยู่กับปัจจุบัน แต่ใจเชื่อมต่อกับความสงบภายในที่ไม่มีสิ่งใดพรากไปได้`,
    deep_content: `### ญาณวิทยาแห่งดุนยาและการจัดวาง Teleology

ในทางญาณวิทยาและปรัชญาเทววิทยาบูรณาการ ดุนยา (The Worldly Realm) มิใช่สิ่งชั่วร้ายในเชิงภววิทยา (Ontological evil) เพราะสรรพสิ่งในจักรวาลล้วนอุบัติขึ้นภายใต้สัจธรรมแห่งการสร้างสรรค์อันประณีตและเปี่ยมด้วยดุลยภาพแห่งจักรวาล (Cosmic Mizan) 

ทว่า **"พิษแห่งดุนยา"** อุบัติขึ้นเมื่อมนุษย์เกิดความวิปริตทางทัศนะในการจัดลำดับคุณค่าสูงสุด (Teleological Inversion):
- แปรเปลี่ยนสถานะของโลกกายภาพจาก **"สื่อกลางหรือสะพานข้าม (Wasīlah)"**
- ไปสู่ **"จุดหมายสูงสุดในตัวเอง (Ghāyah bi-dhātiha)"**

\`\`\`
[สัจธรรมสมดุล] : กายภาพ (เครื่องมือ)  ──>  จิตวิญญาณ (ความหมาย)  ──>  สัจธรรมสูงสุด
[วิปริตทางทัศนะ] : จิตวิญญาณ (สูญหาย) <── กายภาพ (กลายเป็นพระเจ้า) <── ความอยากไม่มีที่สิ้นสุด
\`\`\`

---

### Hedonic Adaptation และวิกฤตความสนใจกระจัดกระจาย

สอดคล้องกับจิตวิทยาสมัยใหม่เรื่อง **Hedonic Treadmill (Brickman & Campbell)** ซึ่งพิสูจน์ทางวิทยาศาสตร์ว่า การกระตุ้นโดปามีนผ่านวัตถุบริโภคและการยอมรับทางสังคม จะเสื่อมถอยลงอย่างรวดเร็ว (Habituation) บีบให้ระบบประสาทต้องการสิ่งเร้าที่รุนแรงขึ้น ก่อให้เกิดภาวะเหนื่อยล้าทางอัตถิภาวนิยม (Existential alienation)

มิติที่ 1 (มิติแห่งตน - The Dimension of Self) จึงเสนอกรอบสถาปัตยกรรมทางปัญญา:
1. **Epistemic Vigilance (การเฝ้าระวังสติปัญญา):** ตรวจสอบ Root Cause ของแรงจูงใจก่อนแปลงเป็นพฤติกรรม
2. **Functional Detachment (การครอบครองโดยไม่ถูกครอบงำ):** ดั่งอรรถาธิบายของ Al-Ghazali ใน *Ihya Ulum al-Din*: *"จงให้ทรัพย์สินอยู่ในมือของคุณในฐานะเครื่องมือรับใช้ แต่อย่าอนุญาตให้มันขึ้นครองบัลลังก์ในห้องหัวใจของคุณเป็นอันขาด"*`,
    easy_takeaways: [
      'โลกภายนอกเหมือนน้ำในทะเล เรือลอยบนน้ำได้ แต่ห้ามให้น้ำรั่วเข้าเรือ',
      'อย่าปล่อยให้ความเร็วของโซเชียลมีเดียมากำหนดความสงบในใจเรา',
      'ถามตัวเองก่อนนอนทุกคืน: วันนี้ใจเรานำ หรือความอยากนำ?',
    ],
    deep_references: [
      'Al-Ghazali, Ihya Ulum al-Din (Kitab Dhamm al-Dunya / การวิเคราะห์เจตจำนงของโลก)',
      'Kahneman, D. (2011). Thinking, Fast and Slow - System 1 & System 2 Cognition',
      'Ibn al-Qayyim, Al-Fawaid - Sovereignty of the Spiritual Heart over Sensory Impulses',
    ],
    audio_url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    audio_duration: '14:20',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    cover_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    is_free: true,
  },
  {
    id: 'chapter-2',
    series_id: 'series-1',
    chapter_number: 2,
    slug: 'spiritual-immunity',
    title_th: 'ตอนที่ 2: ภูมิคุ้มกันทางจิตวิญญาณ ในโลกที่เร่งรีบ',
    title_en: 'Spiritual Immunity in an Accelerated World',
    excerpt: 'มิใช่การหนีสังคมไปอยู่ลำพัง แต่คือการสร้างปราการภายใน เพื่ออยู่ท่ามกลางโลกโดยไม่ยอมให้โลกกลืนกิน',
    easy_content: `### เสื้อกันฝนแห่งจิตใจ

หลายคนคิดว่าการอยากมีจิตใจที่สงบ ต้องทิ้งทุกอย่างแล้วไปอยู่บนเขาคนเดียว แต่ในชีวิตจริง เรามีงานต้องทำ มีลูกต้องเลี้ยง มีความรับผิดชอบที่ต้องดูแล

การสร้าง "ภูมิคุ้มกันทางจิตวิญญาณ" ไม่ใช่การหนี แต่เหมือนกับการใส่เสื้อกันฝนในวันที่พายุฝนตกหนัก ฝนยังคงตก ลมยังคงพัด แต่เราไม่เปียกปอนและไม่เป็นหวัด

---

### เสาหลัก 3 ต้นของภูมิคุ้มกัน

1. **การตั้งเวลาปิดเสียงรบกวน (Digital Detox สั้นๆ วันละ 15 นาที):** ปล่อยให้สมองได้พัก ไม่ต้องรับรู้ว่าใครกำลังทำอะไร
2. **การฝึกความกตัญญูและเห็นคุณค่า (Gratitude):** เมื่อใจรู้ว่าเรามีมากพอ ความอิจฉาจะไม่มีที่ยืน
3. **พื้นที่ปลอดภัยในครอบครัว:** สร้างวงสนทนาที่พูดคุยด้วยความเมตตา ไม่ตัดสิน`,
    deep_content: `### พลวัตของ Hyper-connectivity และการพังทลายของสมาธิ

สังคมสารสนเทศยุคศตวรรษที่ 21 ขับเคลื่อนด้วยสถาปัตยกรรม Algorithm ที่จงใจทำให้ความสนใจของมนุษย์แตกกระจาย (Fragmented Attention) และกระตุ้นภาวะ Amygdala Hijack อย่างต่อเนื่อง

ภูมิคุ้มกันทางจิตวิญญาณ (Spiritual Immunity) ตามกรอบ "4 มิติแห่งปัญญา" มีโครงสร้างทางตรรกศาสตร์ 3 ประการ:
1. **Ontological Anchoring:** การยึดเหนี่ยวอัตลักษณ์ของมนุษย์ไว้กับสัจธรรมสูงสุด มิใช่ผูกกับสถานะทางสังคมที่ผันผวน
2. **Intentional Epistemic Intake:** การเลือกคัดกรองข้อมูลเข้าสู่สมองเพื่อลดภาวะ Cognitive Overload
3. **Somatic-Spiritual Harmony:** การรักษาดุลยภาพทางสรีรวิทยาเพื่อเกื้อหนุนการคิดเชิงไตร่ตรอง (Contemplative Reasoning)`,
    easy_takeaways: [
      'ความสงบไม่ใช่การหนีโลก แต่คือการไม่ยอมให้ความวุ่นวายภายนอกเข้ามาข้างใน',
      'เสื้อกันฝนทางจิตใจ: ให้เวลาความเงียบ 15 นาทีต่อวัน',
      'มองเห็นคุณค่าในสิ่งที่มีอยู่เพื่อหยุดวงจรความอยากไม่รู้จบ',
    ],
    deep_references: [
      'Byung-Chul Han, The Burnout Society & The Scent of Time',
      'Newport, C. (2019). Digital Minimalism: Choosing a Focused Life in a Noisy World',
      'Al-Muhasibi, Al-Ri’ayah li-Huquq Allah (จิตวิทยาการตรวจสอบตนเอง)',
    ],
    audio_url: 'https://assets.mixkit.co/music/preview/mixkit-peaceful-mind-68.mp3',
    audio_duration: '16:45',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    cover_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
    is_free: true,
  },
  {
    id: 'chapter-3',
    series_id: 'series-1',
    chapter_number: 3,
    slug: 'the-golden-mean',
    title_th: 'ตอนที่ 3: กับดักทัศนะสุดโต่ง และทางสายกลาง',
    title_en: 'The Extreme Pitfalls & The Golden Mean',
    excerpt: 'ขั้วหนึ่งบูชาวัตถุ อีกขั้วหนึ่งปฏิเสธโลก หนทางอันสมบูรณ์คือการใช้โลกอย่างรับผิดชอบ',
    easy_content: `### เหรียญสองด้านของกับดักความคิด

เวลาเรามองชีวิต เรามักจะตกหลุมพรางสุดโต่ง 2 ขั้ว:

- **ขั้วที่ 1: "วัตถุคือทุกสิ่ง"** ทำงานจนร่างพัง ไม่หลับไม่นอน แลกทุกอย่างเพื่อตัวเลขในบัญชี แต่สุดท้ายหัวใจว่างเปล่า
- **ขั้วที่ 2: "โลกนี้น่ารังเกียจ"** ปฏิเสธความเจริญ ไม่พยายามทำงาน ปล่อยตัวเฉื่อยชา อ้างว่าปลง

ทางสายกลางที่แท้จริงคืออะไร? คือการ **"ทำหน้าที่ให้ดีที่สุดเหมือนเราจะอยู่สร้างประโยชน์ไปอีกยาวนาน และขัดเกลาหัวใจให้บริสุทธิ์เหมือนเราพร้อมจะกลับคืนสู่ความสงบนิรันดร์ได้ตลอดเวลา"**`,
    deep_content: `### ดุลยภาพแห่ง Al-Wasatiyyah และทฤษฎีอริสโตเติล

ทฤษฎีทางสายกลาง (Doctrine of the Mean / Al-Wasatiyyah) ชี้ให้เห็นว่าความดีงามทางศีลธรรม (Moral Virtue) มักดำรงอยู่ ณ จุดสมดุลระหว่างความบกพร่อง (Deficiency) และความล้นเกิน (Excess)

- ความสุดโต่งด้านวัตถุนิยม (Crude Materialism): ก่อสภาวะ Commodification of Life ลดทอนคุณค่ามนุษย์เป็นเพียงหน่วยผลิต
- ความสุดโต่งด้านสุญนิยมและปฏิเสธโลก (Nihilistic Asceticism): ละเลยอามานะฮ์ (Trusteeship) ในการพิทักษ์และพัฒนาทรัพยากรธรรมชาติ

การสังเคราะห์ตรรกะ: วัตถุกายภาพมีมูลค่าเชิงอรรถประโยชน์ (Utility Value) แต่มิใช่มูลค่าแก่นแท้ (Intrinsic Value) ผู้มีปัญญาจึงใช้ประโยชน์จากโลกได้อย่างเต็มศักยภาพโดยปราศจากการตกเป็นทาส`,
    easy_takeaways: [
      'ทางสายกลางไม่ใช่ความลังเล แต่คือความสมดุลที่มั่นคงที่สุด',
      'วัตถุมีไว้ให้ใช้ ไม่ใช่มีไว้ให้บูชา',
      'ทำงานด้วยความเป็นเลิศ โดยไม่ยอมแลกด้วยศีลธรรมและความสงบในใจ',
    ],
    deep_references: [
      'Aristotle, Nicomachean Ethics - The Doctrine of the Mean',
      'Ibn Khaldun, The Muqaddimah - Sociology of Civilization and Material Decay',
      'Seyyed Hossein Nasr, Religion and the Order of Nature',
    ],
    audio_url: 'https://assets.mixkit.co/music/preview/mixkit-meditation-flute-247.mp3',
    audio_duration: '18:10',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    is_free: true,
  },
  {
    id: 'chapter-4',
    series_id: 'series-1',
    chapter_number: 4,
    slug: 'the-proving-ground',
    title_th: 'ตอนที่ 4: สนามทดสอบและไร่นาแห่งชีวิต',
    title_en: 'The Proving Ground: Cultivating Eternity',
    excerpt: 'โลกคือพื้นที่เพาะปลูก ทุกความยากและการเลือกลงมือทำ คือการขัดเกลาศักยภาพภายใน',
    easy_content: `### ดิน เมล็ดพันธุ์ และฤดูเก็บเกี่ยว

บทนี้เป็นบทพิเศษสำหรับ Supporter ปลดล็อกความเข้าใจเรื่องชีวิตเป็นสนามทดสอบและการฝึกฝนจิตวิญญาณผ่านอุปสรรครายวัน...`,
    deep_content: `### ภววิทยาแห่งบททดสอบ (Theodicy and Ontological Tribulation)

การวิเคราะห์ความทุกข์ยากในเชิงตรรกศาสตร์เทววิทยา: อุปสรรคมิใช่ความขัดแย้งในเจตจำนงแห่งความเมตตา แต่คือกลไกการกลั่นกรองศักยภาพมนุษย์ (Soul-making Theodicy)...`,
    easy_takeaways: ['ความอดทนคือการเคลื่อนที่ไปข้างหน้าอย่างสงบนิ่ง'],
    deep_references: ['John Hick, Evil and the God of Love'],
    audio_url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    audio_duration: '21:15',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    cover_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    is_free: false,
  },
  {
    id: 'chapter-5',
    series_id: 'series-1',
    chapter_number: 5,
    slug: 'internal-sovereignty',
    title_th: 'ตอนที่ 5: บัลลังก์หัวใจ และเจตนาบริสุทธิ์',
    title_en: 'Internal Sovereignty & The Purity of Intention',
    excerpt: 'การเฝ้าระวังก่อนความผิดก่อตัว ถามใจอย่างซื่อสัตย์: ใครกำลังนำ—คุณค่าหรืออัตตา?',
    easy_content: `### กษัตริย์ในเมืองแห่งร่างกาย

หัวใจคือกษัตริย์ ร่างกายคือทหารรับใช้ ถ้ากษัตริย์มีสติ ทหารทั้งเมืองก็สงบสุข...`,
    deep_content: `### สถาปัตยกรรมแห่ง Ikhlas และจิตวิทยาความตระหนักรู้

การขจัด Cognitive Bias และ Self-deception ผ่านกระบวนการ Muhasabah (Self-accounting)...`,
    easy_takeaways: ['ตรวจสอบเจตนาเบื้องลึกก่อนพูดหรือทำเสมอ'],
    deep_references: ['Al-Harith al-Muhasibi, Kitab al-Tawahhum'],
    audio_url: 'https://assets.mixkit.co/music/preview/mixkit-peaceful-mind-68.mp3',
    audio_duration: '19:40',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    cover_image: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80',
    is_free: false,
  },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    slug: 'safe-soul-full-ebook',
    title: 'E-book ฉบับเต็ม 240 หน้า: The Safe Soul Project',
    description: 'ฉบับสมบูรณ์ 35 บท พร้อมแผนผัง 4 มิติแห่งปัญญา อินโฟกราฟิกความละเอียดสูง พร้อมระบบประทับตราอีเมลลิขสิทธิ์ดิจิทัลเฉพาะผู้ซื้อ',
    type: 'digital',
    price_thb: 490,
    compare_at_price_thb: 890,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    badge: 'Digital Instant Delivery',
    stock_quantity: 9999,
    digital_asset_url: 'https://assets.safesoulproject.com/ebooks/Safe_Soul_Master_240p.pdf',
    is_active: true,
  },
  {
    id: 'prod-2',
    slug: 'safe-soul-audio-masterclass',
    title: 'Audiobook & Masterclass Suite 35 ตอน (Lossless Hi-Res)',
    description: 'ไฟล์เสียงพอดแคสต์คุณภาพสตูดิโอ 35 บท พร้อมเสียงดนตรีบรรเลงสมาธิ binaural beats และบทฝึกสติก่อนนอน',
    type: 'digital',
    price_thb: 690,
    compare_at_price_thb: 1290,
    image_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    badge: 'Lossless Audio',
    stock_quantity: 9999,
    digital_asset_url: 'https://assets.safesoulproject.com/audio/Safe_Soul_Audio_Masterclass.zip',
    is_active: true,
  },
  {
    id: 'prod-3',
    slug: 'deep-emerald-heavyweight-tee',
    title: 'เสื้อยืด Safe Soul Heavyweight Tee (Deep Emerald & Gold)',
    description: 'ผ้าคอตตอนพรีเมียม 260 GSM สีย้อมพิเศษ Deep Emerald (#0F291E) สกรีนลายเรขาคณิตศักดิ์สิทธิ์ด้วยฟอยล์สีทองด้าน ทนทาน นุ่มสบาย',
    type: 'physical',
    price_thb: 790,
    compare_at_price_thb: 990,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    badge: 'Official Merch',
    stock_quantity: 65,
    is_active: true,
  },
  {
    id: 'prod-4',
    slug: 'sacred-geometry-cap',
    title: 'หมวกแก๊ป Minimalist Soul Cap (Dark Slate & Gold Emboss)',
    description: 'หมวกผ้าทวิลเกรดพรีเมียม ปักโลโก้ The Safe Soul 4 มิติด้วยด้ายทองเงา ปรับสายรัดด้านหลังด้วยบัคเคิลทองเหลืองรมดำ',
    type: 'physical',
    price_thb: 590,
    compare_at_price_thb: 790,
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    badge: 'Limited Stock',
    stock_quantity: 40,
    is_active: true,
  },
  {
    id: 'prod-5',
    slug: 'windproof-soul-umbrella',
    title: 'ร่มอัตโนมัติกัน UV ลาย The Safe Umbrella (ด้ามจับไม้แท้)',
    description: 'ร่มกันแดดกันฝนโครงสร้างไฟเบอร์กลาส 16 ก้าน เคลือบกัน UV ดำด้าน ภายในพิมพ์ลวดลายดวงดาวและ 4 มิติแห่งปัญญา',
    type: 'physical',
    price_thb: 890,
    compare_at_price_thb: 1190,
    image_url: 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&w=800&q=80',
    badge: 'Special Edition',
    stock_quantity: 35,
    is_active: true,
  },
];

export const mockSponsors: SponsorSlot[] = [
  {
    id: 'sponsor-1',
    name: 'สปอนเซอร์หัวบทความ',
    sponsor_name: 'Al-Barakah Ethical Wealth',
    banner_image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    target_url: 'https://example.com/ethical-wealth',
    placement: 'article_top',
    is_active: true,
  },
  {
    id: 'sponsor-2',
    name: 'สปอนเซอร์ท้ายบทความ',
    sponsor_name: 'Pure Living Holistic Wellness',
    banner_image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    target_url: 'https://example.com/pure-living',
    placement: 'article_bottom',
    is_active: true,
  },
  {
    id: 'sponsor-3',
    name: 'สปอนเซอร์เครื่องเล่นพอดแคสต์',
    sponsor_name: 'Noor Intellectual Publishing',
    banner_image_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    target_url: 'https://example.com/noor-publisher',
    placement: 'podcast_sticky',
    is_active: true,
  },
];

export const mockFoundingQuota: FoundingSlotsQuota = {
  max_slots: 100,
  claimed_slots: 83,
  remaining_slots: 17,
  percentage_claimed: 83,
};
