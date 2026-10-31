---
name: Safe Soul Project
description: Digital Sanctuary for Modern Spiritual Seekers and Thinkers
colors:
  primary: "#F59E0B"
  primary-light: "#FDE68A"
  primary-dark: "#92400E"
  emerald-deep: "#0F291E"
  emerald-surface: "#183226"
  emerald-card: "#12251D"
  emerald-border: "#1E3E30"
  neutral-bg: "#08110D"
  neutral-surface: "#0B1310"
  neutral-card: "#0E1814"
  parchment-cream: "#F4F1EA"
  parchment-muted: "#E2DDD2"
  artisanal-cream: "#F9F6F0"
  artisanal-hearth: "#FAF7F2"
  artisanal-caramel: "#AB682A"
  artisanal-terracotta: "#8C4F1A"
  artisanal-charcoal: "#1C1C1C"
  artisanal-sage: "#61CE70"
  artisanal-sky: "#6EC1E4"
typography:
  display:
    fontFamily: "var(--font-cinzel), Cinzel, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "0.06em"
  headline:
    fontFamily: "var(--font-noto-serif-thai), Noto Serif Thai, Georgia, serif"
    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "var(--font-noto-serif-thai), Noto Serif Thai, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "var(--font-noto-serif-thai), Noto Serif Thai, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.75
    letterSpacing: "normal"
  artisanal:
    fontFamily: "var(--font-mali), Mali, cursive, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-cinzel), Cinzel, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.15em"
  caption:
    fontFamily: "var(--font-prompt), Prompt, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.02em"
  badge:
    fontFamily: "var(--font-prompt), Prompt, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-light}"
  card-sanctuary:
    backgroundColor: "{colors.emerald-card}"
    rounded: "{rounded.xl}"
    padding: "32px"
  card-artisanal:
    backgroundColor: "{colors.artisanal-hearth}"
    textColor: "{colors.artisanal-charcoal}"
    rounded: "{rounded.xl}"
    padding: "28px"
    border: "1px solid rgba(171, 104, 42, 0.2)"
  button-artisanal:
    backgroundColor: "{colors.artisanal-caramel}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
---

# Design System: Safe Soul Project

## Overview

**Creative North Star: "The Sacred Epistemic Sanctuary & The Artisanal Hearth"**

Safe Soul Project ถูกออกแบบให้เป็นระบบความรู้สึกสองโลกคู่ขนานที่เติมเต็มกันอย่างสมบูรณ์แบบ (Dual Visual Worlds):

1. **World A: The Sacred Epistemic Sanctuary (วิหารญาณวิทยาศักดิ์สิทธิ์)**
   วิหารดิจิทัลแห่งปัญญา หลอมรวมความสงบ ศรัทธาอันลุ่มลึก และความสง่างามทางสถาปัตยกรรมความคิด บรรยากาศทางสายตาใช้สีเขียวมรกตลึก (`#0F291E`) และผืนฟ้ารัตติกาล (`#08110D`) ขับเน้นด้วยประกายทองแห่งปัญญา (Nur al-Hikmah, `#F59E0B`) เหมาะสำหรับช่วงเวลาอ่านบทความเจาะลึก ศึกษาตรรกะ และฝึกจิตสมาธิ

2. **World B: The Warm Artisanal Hearth (ลานชุมชนและศาลาพักใจกลิ่นอายโก๋ในซอย)**
   ได้รับแรงบันดาลใจโดยตรงจากอัตลักษณ์ของ **โก๋ในซอย (Koh Nai Soi)** คาเฟ่และพื้นที่สุนทรียภาพฮาลาลอันอบอุ่น เปลี่ยนโทนสู่สีครีมข้าวโอ๊ตธรรมชาติ (`#F9F6F0`), กลิ่นอายเตาผิงสีขนมปังอบคาราเมลไหม้ (`#AB682A`), และตัวอักษรลายมือที่เป็นมิตรอย่าง **Mali (Google Font)** สื่อถึงไมตรีจิต การล้อมวงจิบชาช้าๆ การสนทนาแลกเปลี่ยนความคิด และการเชื่อมโยงผู้คนเข้าด้วยความอบอุ่นเสมือนบ้าน

**Key Characteristics:**
- **Deep Emerald & Gold Glow:** พื้นหลังรัตติกาลอมเขียวมรกตลึก ขับเน้นด้วยประกายทองอันเป็นสัญลักษณ์ของแสงแห่งปัญญา
- **Warm Oatmeal & Roasted Caramel:** พื้นผิวกระดาษทำมือสีครีม ตัดขอบคาราเมลอบและสีเขียวใบเสจ สะท้อนความเรียบง่าย เป็นกันเอง และละเมียดละไม
- **Sacred Geometry & Organic Motifs:** ลวดลายเรขาคณิตศักดิ์สิทธิ์ในวิหาร ผสานลายเส้นธรรมชาติและเครื่องปั้นดินเผาในลานชุมชน
- **Tri-Typographic Symphony:** Display โรมัน Cinzel + หัวข้อไทยทรงพลัง Noto Serif Thai + ลายมืออบอุ่นเป็นกันเอง Mali + เนื้อความอ่านสบายตา Prompt

## Colors

ชุดสีแบ่งออกเป็นสองบรรยากาศหลัก โดยคงความเคารพต่อคอนทราสต์และความสบายตาเป็นอันดับหนึ่ง

### Sanctuary Palette (World A)
- **Regal Warm Gold** (`#F59E0B`): สีทองแห่งปัญญา ใช้สำหรับปุ่มดำเนินการหลัก จุดนำสายตาสำคัญ
- **Gold Light & Champagne** (`#FDE68A`): สีไฮไลต์ข้อความและเส้นขอบประณีตเมื่อเกิดปฏิสัมพันธ์
- **Abyss Ground** (`#08110D`): พื้นผิวหลักของผืนดิน สุขุม นิ่งสงบ
- **Emerald Deep Surface** (`#0F291E` / `#12251D`): ผิวการ์ดและภาชนะบรรจุเนื้อหา
- **Parchment Cream** (`#F4F1EA`): สีตัวอักษรเนื้อหาหลัก อ่านง่าย ไม่แสบตา
- **Parchment Muted** (`#E2DDD2`): สีตัวอักษรประกอบและคำอธิบาย

### Warm Artisanal Palette (World B - Koh Nai Soi Inspired)
- **Artisanal Oatmeal Cream** (`#F9F6F0`): พื้นผิวพื้นหลังหลักของลานชุมชน ให้ความรู้สึกนุ่ม อบอุ่น สบายตา เหมือนกระดาษคราฟต์เกรดพรีเมียม
- **Artisanal Hearth Parchment** (`#FAF7F2`): พื้นผิวการ์ดชุมชนและกล่องข้อความสนทนา
- **Roasted Caramel** (`#AB682A`): สีเน้นหลักของคาเฟ่ชุมชน ให้ความรู้สึกถึงชาชัก ขนมปังปิ้งเตาถ่าน และเครื่องดินเผา
- **Terracotta Deep** (`#8C4F1A`): สีเน้นเข้มเมื่อวางเมาส์หรือต้องการเน้นลำดับชั้นสูงสุด
- **Warm Charcoal** (`#1C1C1C`): สีตัวอักษรหลักบนพื้นครีม คมชัดแต่นุ่มนวลกว่าสีดำล้วน ให้ Contrast ratio สูงเกิน 10:1
- **Botanical Sage** (`#61CE70`): สีใบชาสมุนไพรสด ใช้กับสถานะสดชื่น การมีชีวิตชีวา และตราฮาลาลสะอาดบริสุทธิ์
- **Morning Sky** (`#6EC1E4`): สีฟ้าเช้าตรู่ สื่อถึงการเริ่มต้นใหม่และความเปิดกว้าง

### Named Rules
**The Rarity Rule.** สีทองอุ่นจะถูกใช้ไม่เกิน 15% ของพื้นที่หน้าจอในโหมด Sanctuary ความศักดิ์สิทธิ์และพลังของสีทองเกิดจากความประณีตและความหายาก
**The Tonal Night Rule.** ในโหมด Sanctuary ไม่มีพื้นผิวใดเป็นสีดำเทาสเตอไรล์ (`#000000`) ทุกพื้นผิวมืดต้องอมสีเขียวมรกตลึก (`#08110D`)
**The Atmosphere Integrity Rule.** ห้ามผสมพื้นหลังสีมืดสนิทกับสีครีมข้าวโอ๊ตในคอนเทนเนอร์เดียวกันแบบครึ่งๆ กลางๆ — แต่ละพื้นผิวต้องมีขอบเขตบรรยากาศที่ชัดเจน เช่น บล็อกวิหาร (Dark Sanctuary) หรือบล็อกศาลาชุมชน (Warm Artisanal Hearth) เพื่อให้ผู้ใช้งานรับรู้การเปลี่ยนผ่านของสภาวะจิตใจได้อย่างสง่างาม

## Typography

**Display Font:** Cinzel (fallback: Georgia, serif)
**Headline Font:** Noto Serif Thai (fallback: Georgia, serif)
**Artisanal Font:** Mali (fallback: cursive, sans-serif) - Google Font ลายมืองดงามโดย Cadson Demak
**Body Font:** Prompt (fallback: -apple-system, sans-serif)

**Character:** การบรรจบกันของความสง่างามเหนือกาลเวลาแบบคลาสสิก ความลื่นไหลอ่านง่ายของตัวอักษรไทยร่วมสมัย และความอบอุ่นจับต้องได้ของตัวอักษรลายมือ

### Hierarchy
- **Display** (Bold 900, clamp(2.5rem, 6vw, 4.5rem), line-height 1.1): พาดหัวสูงสุดระดับ Masterpiece ประจำหน้าแรก
- **Headline** (Bold 700, clamp(1.75rem, 4vw, 2.75rem), line-height 1.25): หัวข้อบทความหลักและหัวข้อเสาหลัก
- **Title** (Bold 700, 1.5rem, line-height 1.35): หัวข้อย่อยประจำการ์ดและการนำทาง
- **Artisanal Lead** (SemiBold 600, 1.25rem - 1.5rem, line-height 1.4, Font Mali): หัวข้อวงน้ำชา ชุมชน และบทบันทึกความรู้สึก
- **Body** (Light 300, 1rem - 1.25rem, line-height 1.75): เนื้อหาบทความความยาว 65-75ch เพื่อความสบายตา
- **Label** (Bold 700, 0.75rem, letter-spacing 0.15em): ป้ายกำกับมิติและหมายเลขตอน
- **Caption** (Medium 500, 0.6875rem / 11px, line-height 1.3): คำอธิบายใต้ภาพและข้อความกำกับเวลา
- **Badge** (Bold 700, 0.625rem / 10px, line-height 1): ป้ายสถานะ ตัวนับสินค้า และแท็กประเภท

### Named Rules
**The Sanctuary Measure Rule.** บรรทัดของเนื้อหาบทความต้องจำกัดความกว้างระหว่าง 65–75 ตัวอักษร (max-w-3xl) เสมอ เพื่อรักษาจังหวะการอ่านที่สงบ
**The Handcrafted Purpose Rule.** ฟอนต์ `Mali` จะถูกใช้เฉพาะกับพื้นที่ชุมชน (Community Hearth), คำเชื้อเชิญที่เป็นมิตร, คำโปรยบรรยากาศคาเฟ่, และบันทึกข้อคิดประจำวัน ห้ามนำไปใช้แทนหัวข้อปรัชญาญาณวิทยาที่เป็นทางการใน Reader
**The No-Eyebrow Rule.** ไม่อนุญาตให้ใส่ป้ายกำกับลอย (Eyebrow/Kicker) เหนือพาดหัวหลัก หัวข้อต้องมีน้ำหนักและนำเสนอใจความสำคัญด้วยตนเอง

## Layout

- **Container Model:** ความกว้างเนื้อหาบทความจำกัดที่ `max-w-3xl` สำหรับโหมดอ่านสมาธิ และ `max-w-7xl` สำหรับหน้ารวมหลักสูตรและลานชุมชน
- **Vertical Spacing:** ระยะห่างแนวตั้งระหว่างเซกชันกว้างขวาง (py-16 ถึง py-24) เพื่อให้เกิดการพักสายตาและแยกแยะแก่นเนื้อหาอย่างชัดเจน
- **Grid Systems:** ตาราง 3 คอลัมน์บนเดสก์ท็อปที่ปรับเป็น 1 คอลัมน์บนสมาร์ตโฟนอย่างสมมาตร

## Elevation & Depth

ระบบมิติใช้การซ้อนชั้นโทนสี (Tonal Layering) ควบคู่กับแสงสะท้อนเรืองทองนุ่มนวล หรือเงาละมุนแบบอบอุ่น

### Shadow Vocabulary
- **Gold Soft** (`0 0 15px rgba(245, 158, 11, 0.2)`): ใช้กับปุ่มและแท็กสถานะที่ต้องการความโดดเด่น
- **Card Luxury** (`0 20px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(245, 158, 11, 0.25)`): เงาลึกหลายชั้นสำหรับกรอบกระจกหรูหรา
- **Artisanal Soft** (`0 2px 10px rgba(171, 104, 42, 0.08)`): เงาบางเบาละมุนตาสำหรับป้ายสถานะในลานชุมชน
- **Artisanal Card** (`0 10px 30px -5px rgba(171, 104, 42, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)`): เงาอุ่นนวลที่ยกการ์ดสีครีมลอยเด่นอย่างเป็นธรรมชาติ

### Named Rules
**The Responsive Glow Rule.** เงาและแสงสะท้อนสีทองจะปรากฏหรือสว่างขึ้นเพื่อตอบสนองต่อการมีปฏิสัมพันธ์ ห้ามใช้แสงเรืองฟุ้งนิ่งแบบไร้ความหมาย
**The Natural Warmth Rule.** ในพื้นที่ Artisanal Hearth ห้ามใช้เงามืดดำดิบ ให้ใช้เงาที่โปร่งแสงและอมสีคาราเมลเจือจาง เพื่อรักษาความรู้สึกอบอุ่นของแสงธรรมชาติ

## Shapes

- **Corner Radius:** มุมโค้งมนอ่อนโยนแต่หนักแน่น (`rounded-xl` สำหรับปุ่มและการ์ด, `rounded-3xl` สำหรับกรอบครอบคลุมผืนใหญ่)
- **Borders:** เส้นขอบคมชัดระดับ 1px เสมอ (`border border-gold-warm/30` หรือ `border border-artisanal-caramel/25`) ห้ามใช้เส้นขอบหนาเทอะทะ
- **Sacred & Handcrafted Silhouettes:** ผสานลวดลายเรขาคณิตศักดิ์สิทธิ์แบบเวกเตอร์โปร่งแสงในโซนวิหาร และลายเส้นธรรมชาติในโซนชุมชน

## Components

### Buttons
- **Gold Bevel Button (Primary Sanctuary):** พื้นหลังไล่ระดับทอง ผิวสัมผัสแบบ Bevel เรืองแสงนุ่มนวล ตัวอักษรสีดำเข้ม (`#08110D`)
- **Emerald Surface Button (Secondary Sanctuary):** พื้นหลังเขียวมรกตโปร่งแสง กรอบทองบาง 1px ตัวอักษรสีครีม
- **Caramel Artisanal Button (Primary Hearth):** พื้นหลังสีคาราเมลคั่ว (`#AB682A`) พร้อมสัมผัสอบอุ่น ตัวอักษรสีขาว กรอบบางเนียน ยกตัวนุ่มนวลเมื่อโฮเวอร์

### Cards
- **Sanctuary Glass Card:** กล่องคอนเทนเนอร์มรกตลึกโปร่งแสง ขอบทองบาง 1px
- **Artisanal Hearth Card:** กล่องคอนเทนเนอร์สีครีมข้าวโอ๊ต (`#FAF7F2`) ขอบสีคาราเมลจาง 1px (`rgba(171, 104, 42, 0.2)`) เงาอบอุ่น พร้อมหัวข้อลายมือ `Mali`

### Dual-Mode Switcher
- แถบสลับโหมดทรงแคปซูลมน เคลื่อนที่ด้วยแอนิเมชันนุ่มนวล รองรับการสลับระหว่าง Easy (สำนวนเล่าเรื่อง) และ Deep (ญาณวิทยาและเทววิทยา)

### Reader Sanctuary Toolbar
- แถบควบคุมทรงลอยตัว (Sticky Bar) บรรจุเครื่องมือปรับขนาดอักษร (A-/A+), โหมดสมาธิ (Focus Mode), เสียงดนตรีบรรเลงสมาธิ (Ambient Flute), และสมุดบันทึกข้อคิดส่วนตัว

### Sticky Audio Player
- เครื่องมือเล่นเสียงพอดแคสต์คุณภาพสูงประจำด้านล่างของจอ เล่นต่อเนื่องข้ามหน้าพร้อมแถบความคืบหน้า

## Do's and Don'ts

### Do:
- **Do** ใช้ตัวอักษรสีครีม (`#F4F1EA`) บนพื้นหลังมรกตลึก และใช้ตัวอักษรสีชาร์โคล (`#1C1C1C`) บนพื้นหลังครีมข้าวโอ๊ต เพื่อให้คอนทราสต์เกิน 4.5:1 เสมอ
- **Do** ใช้ฟอนต์ `Mali` ในพื้นที่ลานชุมชน บันทึกความรู้สึก และหัวข้อที่ต้องการความอบอุ่นเป็นกันเอง
- **Do** ใส่เครื่องเล่นเสียงพอดแคสต์และเนื้อหา Easy/Deep Mode ให้ครบถ้วนสมบูรณ์
- **Do** ใช้เส้นขอบบาง 1px ที่มีสีทองจางๆ หรือคาราเมลจางๆ เพื่อกำหนดขอบเขตของกล่องเนื้อหา

### Don't:
- **Don't** ใช้ Gradient Text กับพาดหัวเนื้อหาจริง (ให้เน้นด้วยขนาดและน้ำหนักตัวอักษร)
- **Don't** ใส่ Eyebrow หรือ Kicker ลอยเหนือพาดหัวหลัก
- **Don't** ใช้เส้นขอบหนาด้านข้าง (`border-l-4` หรือมากกว่า) บนการ์ดหรือกล่องข้อความ
- **Don't** ใช้สีเทากลางหรือสีดำสนิทที่ปราศจากเฉดมรกตหรือทองในโซน Sanctuary
- **Don't** ใช้ฟอนต์ลายมือ `Mali` กับเนื้อหาบทความวิชาการญาณวิทยาที่เป็นทางการใน Article Reader
