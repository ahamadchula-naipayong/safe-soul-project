export type TierType = 'free_tier_1' | 'supporter_tier_2' | 'founding_tier_3';

export type PaymentStatus = 'free' | 'pending_verification' | 'verified';

export type ContentMode = 'easy' | 'deep';

export type MemberRole = 'admin' | 'co_admin' | 'member';

export interface Member {
  id: string;
  memberNumber: number; // Member ลำดับที่
  username: string;
  email: string;
  phone?: string;
  password?: string;
  name: string;
  tier: TierType;
  role?: MemberRole;
  paymentStatus?: PaymentStatus;
  paymentSlipUrl?: string;
  paymentAmount?: number;
  billingCycle?: 'free' | 'monthly' | 'yearly' | 'lifetime';
  ebookClaimed?: boolean;
  ebookClaimedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ContactCategory = 'complaint' | 'discussion' | 'request' | 'membership';

export interface ContactMessage {
  id: string;
  category: ContactCategory;
  name: string;
  replyEmail: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  adminNote?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'editor';
  tier: TierType;
  discord_user_id?: string | null;
  discord_username?: string | null;
  ebook_downloaded?: boolean;
  created_at?: string;
}

export interface Series {
  id: string;
  slug: string;
  order_index: number;
  title_th: string;
  title_en: string;
  dimension: string;
  description_th: string;
  cover_image: string;
  color_accent: string;
}

export interface Chapter {
  id: string;
  series_id: string;
  chapter_number: number;
  slug: string;
  title_th: string;
  title_en: string;
  excerpt: string;
  easy_content: string;
  deep_content: string;
  easy_takeaways: string[];
  deep_references: string[];
  audio_url: string;
  audio_duration: string;
  video_url: string;
  cover_image: string;
  is_free: boolean;
  status?: ArticleStatus;
  published_at?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'digital' | 'physical';
  price_thb: number;
  compare_at_price_thb?: number;
  image_url: string;
  badge?: string;
  stock_quantity: number;
  digital_asset_url?: string;
  is_active: boolean;
  status?: ArticleStatus;
  published_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface SponsorSlot {
  id: string;
  name: string;
  sponsor_name: string;
  banner_image_url: string;
  target_url: string;
  placement: 'article_top' | 'article_bottom' | 'podcast_sticky' | 'sidebar';
  is_active: boolean;
  clicks_count?: number;
  impressions_count?: number;
}

export interface FoundingSlotsQuota {
  max_slots: number;
  claimed_slots: number;
  remaining_slots: number;
  percentage_claimed: number;
}

export interface NewsSection {
  index: number;
  title?: string;
  content: string;
  image?: string | null;
}

export type NewsArticle = NewsItem;

export interface NewsItem {
  id: string; // e.g. "KORDD1000"
  slug: string; // e.g. "kordd1000"
  korNo: string;
  rawTitle: string;
  title: string;
  topicLead?: string; // Original Title from column D, displayed before Content 2
  date: string; // "2026-07-20"
  dateFormatted: string; // "20 กรกฎาคม 2026"
  dateShort: string; // "20 ก.ค. 2026"
  dateTimestamp: number;
  subcategory: string;
  image: string; // Main hero background image
  video?: string | null;
  source?: string | null;
  sections: NewsSection[];
  excerpt: string;
}

export type OneshotSectionKey =
  | 'topics'
  | 'intro'
  | 'self'
  | 'awareness'
  | 'faith'
  | 'ethics'
  | 'conclusion';

export interface OneshotSection {
  key: OneshotSectionKey;
  title: string;
  header: string;
  content: string;
}

export interface OneshotAudioPart {
  partNumber: number;
  title: string;
  url: string;
  duration: string;
  seconds: number;
}

export interface OneshotAudioInfo {
  full: {
    title: string;
    url: string;
    duration: string;
    seconds: number;
  };
  parts: OneshotAudioPart[];
}

export interface OneshotChapter {
  id: string; // e.g. 'oneshot-1'
  chapterNumber: number; // 1 to 7
  slug: string; // e.g. 'safe-from-the-dunya'
  titleEn: string; // e.g. 'Safe from the Dunya'
  titleTh: string; // e.g. 'ศิลปะแห่งการระวังตนและสร้างภูมิคุ้มกันชีวิตภายใต้ครรลองแห่งปัญญา'
  coreFocus: string; // From the table in md
  image: string; // e.g. '/images/oneshot/Oneshot1_SafeFromTheDunya_main.jpg'
  sections: {
    topics: OneshotSection;
    intro: OneshotSection;
    self: OneshotSection;
    awareness: OneshotSection;
    faith: OneshotSection;
    ethics: OneshotSection;
    conclusion: OneshotSection;
  };
  sectionList: OneshotSection[];
  excerpt: string;
  readingTimeMinutes: number;
  status?: ArticleStatus;
  publishedAt?: string;
  audio?: OneshotAudioInfo;
  audioUrl?: string;
  audioDuration?: string;
}


export type ArticleStatus = 'draft' | 'scheduled' | 'published';

export interface DeepOceanSubIsland {
  chapterNumber: number; // 1 to 5
  slug: string; // e.g. 'safe-from-dunya-ch-1'
  title: string;
  excerpt: string;
  content: string;
  status: ArticleStatus;
  publishedAt?: string;
  isUnlocked: boolean; // true for Chapter 1 of Archipelagos 1-7
  audioUrl?: string;
  audioDuration?: string;
  readingTimeMinutes: number;
  coverImage?: string;
}

export interface DeepOceanArchipelago {
  id: string; // 'archipelago-1'
  archipelagoNumber: number; // 1 to 10
  slug: string; // 'safe-from-dunya'
  titleEn: string;
  titleTh: string;
  subtitle: string;
  status: 'published' | 'upcoming';
  coverImage: string;
  subIslandsCount: number;
  subIslands: DeepOceanSubIsland[];
}
