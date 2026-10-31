export type TierType = 'free_tier_1' | 'supporter_tier_2' | 'founding_tier_3';

export type ContentMode = 'easy' | 'deep';

export interface Member {
  id: string;
  memberNumber: number; // Member ลำดับที่
  username: string;
  email: string;
  password?: string;
  name: string;
  tier: TierType;
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
  telegram_username?: string | null;
  telegram_invited?: boolean;
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
