-- ==============================================================================
-- CUBE DIGITAL EXPERIENCE 2.0 – COMPLETE ENTERPRISE CMS RELATIONAL SCHEMA
-- ==============================================================================
-- Organization: Centre for Urbanization, Buildings & Environment (CUBE)
-- Joint Initiative: IIT Madras & Government of Tamil Nadu
-- Database: PostgreSQL with Supabase Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE publication_status AS ENUM ('draft', 'published', 'scheduled', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE announcement_type AS ENUM ('hiring_popup', 'modal_alert', 'top_banner', 'featured_notice');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. USERS & PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'editor',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. AUDIT LOGS (Immutable Activity Log)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH'
    resource_type TEXT NOT NULL, -- 'news', 'projects', 'announcements', etc.
    resource_id TEXT,
    changes JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. HOMEPAGE SECTIONS
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id TEXT PRIMARY KEY, -- 'hero', 'about_preview', 'stats', 'verticals_preview', etc.
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. HERO SLIDES
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_tag TEXT NOT NULL,
    location TEXT NOT NULL,
    project_link TEXT NOT NULL DEFAULT '/projects',
    image_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    status publication_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. VERTICALS
CREATE TABLE IF NOT EXISTS public.verticals (
    id TEXT PRIMARY KEY, -- 'building-construction', 'environment-sustainability', 'smart-cities', 'urban-planning-transportation'
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    hero_image TEXT NOT NULL,
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    display_order INT NOT NULL DEFAULT 0,
    status publication_status NOT NULL DEFAULT 'published',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    client TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_overview TEXT,
    scope_of_work JSONB NOT NULL DEFAULT '[]'::jsonb,
    methodology TEXT,
    outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
    hero_image TEXT NOT NULL,
    gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    featured BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    status publication_status NOT NULL DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. NEWS & ARTICLES
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Institutional',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    author TEXT NOT NULL DEFAULT 'CUBE IIT Madras',
    image_url TEXT NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT false,
    status publication_status NOT NULL DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    end_date DATE,
    venue TEXT NOT NULL,
    registration_url TEXT,
    image_url TEXT NOT NULL,
    status publication_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. UNIVERSAL ANNOUNCEMENTS & HIRING POPUPS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    type announcement_type NOT NULL DEFAULT 'hiring_popup',
    badge TEXT DEFAULT 'WE ARE HIRING',
    cta_text TEXT DEFAULT 'View Open Positions',
    cta_url TEXT DEFAULT '/careers',
    image_url TEXT,
    start_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMPTZ,
    priority INT NOT NULL DEFAULT 1,
    frequency TEXT NOT NULL DEFAULT 'once_per_session', -- 'once_per_session', 'always', 'once_per_day'
    target_pages JSONB NOT NULL DEFAULT '["/"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. CAREERS (Job Vacancies)
CREATE TABLE IF NOT EXISTS public.careers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    employment_type TEXT NOT NULL DEFAULT 'Full-Time',
    experience TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'IIT Madras Research Park, Chennai',
    description TEXT NOT NULL,
    qualifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    application_email TEXT DEFAULT 'careers@cubeiitm.org',
    application_url TEXT,
    closing_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    status publication_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. TENDERSFour Core Engineering Verticals
CREATE TABLE IF NOT EXISTS public.tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    document_url TEXT,
    published_date DATE NOT NULL DEFAULT CURRENT_DATE,
    closing_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Under Evaluation', 'Awarded', 'Closed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. CEL SERVICES (Environmental Laboratory)
CREATE TABLE IF NOT EXISTS public.cel_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Water Testing', 'Wastewater Analysis', 'Solid Waste', 'Consultancy'
    description TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
    display_order INT NOT NULL DEFAULT 0,
    status publication_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. LEADERSHIP & TEAM
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    category TEXT NOT NULL, -- 'leadership', 'board', 'advisory', 'team'
    bio TEXT,
    image_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    status publication_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. CLIENTS & PARTNERS
CREATE TABLE IF NOT EXISTS public.clients_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'client', 'partner'
    logo_url TEXT NOT NULL,
    website_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. GALLERY IMAGES
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Activities',
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INT NOT NULL DEFAULT 0,
    status publication_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. PUBLICATIONS
CREATE TABLE IF NOT EXISTS public.publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    category TEXT NOT NULL,
    year TEXT NOT NULL,
    abstract TEXT,
    document_url TEXT,
    external_link TEXT,
    status publication_status NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. CONTACT ENQUIRIES (Protected from Public Access)
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cel_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ACCESS (Only for published/active content)
CREATE POLICY "Public can view published hero slides" ON public.hero_slides FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published verticals" ON public.verticals FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published news" ON public.news FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view active announcements" ON public.announcements FOR SELECT USING (is_active = true AND (end_date IS NULL OR end_date > now()));
CREATE POLICY "Public can view published careers" ON public.careers FOR SELECT USING (status = 'published' AND is_active = true);
CREATE POLICY "Public can view tenders" ON public.tenders FOR SELECT USING (true);
CREATE POLICY "Public can view cel services" ON public.cel_services FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view team members" ON public.team_members FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view clients & partners" ON public.clients_partners FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view publications" ON public.publications FOR SELECT USING (status = 'published');
CREATE POLICY "Public can submit contact enquiries" ON public.contact_enquiries FOR INSERT WITH CHECK (true);

-- ADMIN AUTHENTICATED FULL ACCESS (Via Service Role or Authenticated Admin)
CREATE POLICY "Admins full access to all tables" ON public.profiles FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' IN ('super_admin', 'admin', 'editor'));

