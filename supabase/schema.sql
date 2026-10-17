-- ==============================================================================
-- The Safe Soul Project (4 มิติแห่งปัญญา) - Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor')),
    tier TEXT NOT NULL DEFAULT 'free_tier_1' CHECK (tier IN ('free_tier_1', 'supporter_tier_2', 'founding_tier_3')),
    discord_user_id TEXT,
    discord_username TEXT,
    telegram_username TEXT,
    telegram_invited BOOLEAN DEFAULT FALSE,
    ebook_downloaded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. FOUNDING 100 QUOTA TRACKER (Strictly capped at 100)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.founding_slots (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    max_slots INT NOT NULL DEFAULT 100,
    claimed_slots INT NOT NULL DEFAULT 83 CHECK (claimed_slots <= max_slots),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insert singleton row if not exists
INSERT INTO public.founding_slots (id, max_slots, claimed_slots)
VALUES (1, 100, 83)
ON CONFLICT (id) DO NOTHING;

-- Atomic RPC function to claim a founding seat
CREATE OR REPLACE FUNCTION public.claim_founding_slot()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_claimed INT;
    max_limit INT;
BEGIN
    SELECT claimed_slots, max_slots INTO current_claimed, max_limit
    FROM public.founding_slots
    WHERE id = 1
    FOR UPDATE;

    IF current_claimed < max_limit THEN
        UPDATE public.founding_slots
        SET claimed_slots = claimed_slots + 1,
            updated_at = timezone('utc'::text, now())
        WHERE id = 1;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. CONTENT SERIES (7 Safe Themes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    order_index INT NOT NULL UNIQUE,
    title_th TEXT NOT NULL,
    title_en TEXT NOT NULL,
    dimension TEXT NOT NULL, -- 4 มิติแห่งปัญญา
    description_th TEXT,
    cover_image TEXT,
    color_accent TEXT DEFAULT '#F59E0B',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. CHAPTERS (35 Chapters total, 5 per series)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL UNIQUE, -- 1 through 35
    slug TEXT UNIQUE NOT NULL,
    title_th TEXT NOT NULL,
    title_en TEXT NOT NULL,
    excerpt TEXT,
    easy_content TEXT NOT NULL, -- Storytelling & Youth/Family Friendly
    deep_content TEXT NOT NULL, -- In-depth logic, science, and theology
    easy_takeaways JSONB DEFAULT '[]'::jsonb,
    deep_references JSONB DEFAULT '[]'::jsonb,
    audio_url TEXT,
    audio_duration TEXT DEFAULT '15:00',
    video_url TEXT,
    cover_image TEXT,
    is_free BOOLEAN NOT NULL DEFAULT FALSE, -- Chapters 1-3 are Free
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. SUBSCRIPTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('supporter_tier_2', 'founding_tier_3')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. MERCHANDISE & STORE PRODUCTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('digital', 'physical')),
    price_thb NUMERIC(10, 2) NOT NULL,
    compare_at_price_thb NUMERIC(10, 2),
    image_url TEXT NOT NULL,
    badge TEXT,
    stock_quantity INT DEFAULT 100,
    digital_asset_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 7. ORDERS & SHIPPING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    stripe_session_id TEXT UNIQUE NOT NULL,
    total_amount_thb NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'fulfilled', 'failed', 'refunded')),
    order_type TEXT NOT NULL DEFAULT 'merch' CHECK (order_type IN ('subscription', 'digital_merch', 'physical_merch')),
    shipping_address JSONB,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    watermark_stamp TEXT, -- Email watermark for digital PDF delivery
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. SPONSOR SLOTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsor_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sponsor_name TEXT NOT NULL,
    banner_image_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    placement TEXT NOT NULL CHECK (placement IN ('article_top', 'article_bottom', 'podcast_sticky', 'sidebar')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    impressions_count INT NOT NULL DEFAULT 0,
    clicks_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founding_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_slots ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile; admins can view all
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Founding Slots: Anyone can view remaining count
CREATE POLICY "Public can view founding slots quota" 
ON public.founding_slots FOR SELECT 
USING (true);

-- Series: Public can view all series
CREATE POLICY "Public can view all series" 
ON public.series FOR SELECT 
USING (true);

-- Chapters: Public can read free chapters (1-3). Paid members can read all.
CREATE POLICY "Public can view free chapters" 
ON public.chapters FOR SELECT 
USING (
    is_free = true 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.tier IN ('supporter_tier_2', 'founding_tier_3')
    )
);

-- Products: Public can view active products
CREATE POLICY "Public can view active products" 
ON public.products FOR SELECT 
USING (is_active = true);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id OR customer_email = auth.jwt() ->> 'email');

-- Sponsor Slots: Public can view active sponsor banners
CREATE POLICY "Public can view active sponsor slots" 
ON public.sponsor_slots FOR SELECT 
USING (is_active = true);

-- ------------------------------------------------------------------------------
-- TRIGGER FOR AUTOMATIC PROFILE CREATION ON AUTH SIGNUP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, tier)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'user',
        'free_tier_1'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
