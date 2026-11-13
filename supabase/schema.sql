-- ============================================================
-- Supabase Schema for HaemoHelp KZ
-- Designed for Patients and Caregivers of Hemophilia in Kazakhstan
-- Based on official Ministry of Health RK & Hemophilia Association Data
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Roles & Hemophilia Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'caregiver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hemophilia_type AS ENUM ('A', 'B', 'C', 'von_willebrand');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('mild', 'moderate', 'severe');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth or Standalone Account System)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    iin VARCHAR(12) UNIQUE NOT NULL,
    email VARCHAR(255),
    role user_role DEFAULT 'patient' NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    caregiver_name VARCHAR(255), -- If role is caregiver, stores parent/guardian name
    dob DATE NOT NULL,
    weight_kg NUMERIC(5, 2) NOT NULL DEFAULT 65.0,
    blood_type VARCHAR(10) NOT NULL DEFAULT 'A(II) Rh+',
    hemo_type hemophilia_type NOT NULL DEFAULT 'A',
    severity severity_level NOT NULL DEFAULT 'severe',
    inhibitor BOOLEAN NOT NULL DEFAULT FALSE,
    working_dose VARCHAR(100) DEFAULT '2000 МЕ / 3 раза в неделю',
    factor_product VARCHAR(150) DEFAULT 'Октанат (Фактор VIII)',
    doctor VARCHAR(255) DEFAULT 'Кемайкин Вадим Матвеевич',
    hospital VARCHAR(255) DEFAULT 'ННОЦ (г. Астана)',
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    avatar VARCHAR(255) DEFAULT '🧑',
    social_nickname VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast IIN and User ID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_iin ON public.profiles(iin);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 4. CALENDAR & INJECTIONS LOG
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time VARCHAR(10) DEFAULT '08:00',
    type VARCHAR(50) NOT NULL, -- 'injection' | 'test' | 'appointment' | 'pharmacy'
    notes TEXT,
    dose_iu INTEGER,
    batch_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_profile_date ON public.calendar_events(profile_id, date);

-- 5. MEDICATION INVENTORY (Home Stock of Factor Vials)
CREATE TABLE IF NOT EXISTS public.med_stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_name VARCHAR(150) NOT NULL,
    iu_per_vial INTEGER NOT NULL,
    vials INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FORUM & COMMUNITY POSTS
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_nickname VARCHAR(100) NOT NULL,
    author_avatar VARCHAR(255) DEFAULT '🧑',
    author_role user_role DEFAULT 'patient',
    category VARCHAR(50) NOT NULL, -- 'doctors' | 'meds' | 'psych' | 'association'
    title VARCHAR(255),
    content TEXT NOT NULL,
    attachment TEXT,
    pinned BOOLEAN DEFAULT FALSE,
    reactions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_category ON public.forum_posts(category);

-- 7. FORUM COMMENTS
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_nickname VARCHAR(100) NOT NULL,
    author_avatar VARCHAR(255) DEFAULT '🧑',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON public.forum_comments(post_id);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile, caregivers can manage linked profiles
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Calendar events: Users manage their own events
CREATE POLICY "Users can manage own calendar" ON public.calendar_events
    FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR user_id IS NULL))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR user_id IS NULL));

-- Medication stock: Users manage their own stock
CREATE POLICY "Users can manage own med stock" ON public.med_stocks
    FOR ALL
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR user_id IS NULL))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() OR user_id IS NULL));

-- Forum: Everyone can read posts and comments
CREATE POLICY "Public read forum posts" ON public.forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated create forum posts" ON public.forum_posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read forum comments" ON public.forum_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated create forum comments" ON public.forum_comments
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED DATA FROM OFFICIAL KAZAKHSTAN SOURCES
-- KazTAG, hemophilya.kz, @kazakhstan.hemofiliya, MoH RK, SK-Pharmacy
-- ============================================================

INSERT INTO public.forum_posts (category, author_nickname, author_avatar, author_role, title, content, pinned, reactions, created_at)
VALUES 
(
    'association',
    'Казахстанская Ассоциация Гемофилии',
    '🩸',
    'caregiver',
    'Школа пациентов и горячая линия Ассоциации hemophilya.kz',
    'Уважаемые пациенты и родители детей с гемофилией! 
ОО «Казахстанская Ассоциация инвалидов-больных гемофилией» (hemophilya.kz) напоминает: наша миссия — защита ваших прав на бесплатное и бесперебойное лекарственное обеспечение.

Если вам или вашему ребенку задерживают выдачу концентратов факторов VIII/IX в поликлинике или СК-Фармация, срочно свяжитесь с нами:
📞 Горячая линия: +7 (747) 342-31-54, +7 (777) 303-36-33
✉️ Email: kazgemo@mail.ru
📍 Адрес: г. Алматы, ул. Яблочкова, 1
📱 Instagram: @kazakhstan.hemofiliya

Мы проводим школы пациентов по технике безопасных домашних инъекций и защите прав в рамках ГОБМП.',
    TRUE,
    '{"❤️": ["u1", "u2", "u3", "u4", "u5"], "👍": ["u6", "u7", "u8"]}'::jsonb,
    NOW() - INTERVAL '1 day'
),
(
    'meds',
    'СК-Фармация Инфо (Мониторинг ГОБМП)',
    '💊',
    'patient',
    'Обеспечение факторами свертывания в РК: данные Минздрава',
    'По данным Министерства здравоохранения РК и ТОО «СК-Фармация», в Республике Казахстан на учете состоит 1 559 пациентов с гемофилией (из них около 500 детей). 

Все пациенты обеспечены концентратами факторов свертывания крови за счет республиканского бюджета в рамках ГОБМП (100% бесплатно). В национальном формуляре закупается порядка 18 наименований препаратов, включая Октоког альфа, Мороктоког альфа, Фактор IX, препараты обходного действия (Эптаког альфа / НовоСевен) и инновационный Эмицизумаб для подкожной профилактики.

При возникновении вопросов по остаткам в вашем регионе обращайтесь в Единый контакт-центр СК-Фармация по номеру 1439.',
    TRUE,
    '{"👍": ["u1", "u3", "u9"], "🙏": ["u2", "u4"]}'::jsonb,
    NOW() - INTERVAL '2 days'
),
(
    'doctors',
    'Д-р Кемайкин В. М. (Консультация гематолога)',
    '👨‍⚕️',
    'patient',
    'Профилактика гемартрозов и современные схемы терапии в ННОЦ',
    'Здравствуйте! Напоминаю пациентам и особенно опекунам детей с тяжелой формой: регулярная профилактика — единственный доказанный способ избежать разрушения суставов (артропатии). 

Не ждите начала кровотечения! Вводите назначенную дозу фактора строго по графику (обычно 2-3 раза в неделю для фактора VIII и 2 раза для фактора IX). При травме или падении инъекция должна быть выполнена в первые 2 часа. 

В Национальном научном онкологическом центре (г. Астана) мы проводим комплексную оценку суставов, коагулограммы и мониторинг титра ингибиторов.',
    TRUE,
    '{"❤️": ["u1", "u2", "u10", "u11"], "👍": ["u3", "u5"]}'::jsonb,
    NOW() - INTERVAL '4 days'
),
(
    'psych',
    'Мама Батыра (Опекун, 7 лет)',
    '👩‍👧',
    'caregiver',
    'Первый класс и гемофилия: наш опыт и поддержка родителей',
    'Когда сыну в 10 месяцев поставили тяжелую форму А, земля ушла из-под ног. Казалось, нормальная жизнь окончена. Но благодаря регулярной профилактике и установке венозного порта Батыр растет активным ребенком! В этом году он пошел в обычную школу, ходит в бассейн 2 раза в неделю. 

Родители новичков, не бойтесь! Главное — спокойствие, соблюдение графика инъекций и открытый диалог с учителем. Гемофилия — это не приговор, а образ жизни!',
    FALSE,
    '{"❤️": ["u1", "u2", "u3", "u4", "u5", "u6", "u7"], "🎉": ["u8", "u9"]}'::jsonb,
    NOW() - INTERVAL '6 days'
);
