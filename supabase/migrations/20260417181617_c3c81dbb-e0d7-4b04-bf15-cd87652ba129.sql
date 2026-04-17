
-- ============ ROLES & PROFILES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TYPE public.event_status AS ENUM ('upcoming', 'sold_out', 'completed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.booking_status AS ENUM ('new', 'contacted', 'confirmed', 'completed', 'cancelled');

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============ EVENTS ============
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  venue TEXT NOT NULL,
  city TEXT DEFAULT 'Dubai',
  banner_url TEXT,
  base_price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'AED',
  status event_status NOT NULL DEFAULT 'upcoming',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_featured ON public.events(is_featured) WHERE is_featured = TRUE;

CREATE TABLE public.ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity_total INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_categories_event ON public.ticket_categories(event_id);

-- ============ BOOKINGS (private events) ============
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  preferred_date DATE,
  guest_count INTEGER,
  budget_range TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  message TEXT,
  status booking_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- ============ TICKET ORDERS ============
CREATE TABLE public.ticket_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  ticket_category_id UUID NOT NULL REFERENCES public.ticket_categories(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_provider TEXT,
  payment_reference TEXT,
  order_reference TEXT NOT NULL UNIQUE DEFAULT ('CKE-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_orders_user ON public.ticket_orders(user_id);
CREATE INDEX idx_ticket_orders_event ON public.ticket_orders(event_id);

-- ============ INQUIRIES ============
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'contact_form',
  is_handled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ticket_orders_updated BEFORE UPDATE ON public.ticket_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone'
  );
  -- Default role: customer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ENABLE RLS ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES: profiles ============
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============ POLICIES: user_roles ============
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ POLICIES: events ============
CREATE POLICY "Anyone views published events" ON public.events
  FOR SELECT USING (is_published = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage events" ON public.events
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ POLICIES: ticket_categories ============
CREATE POLICY "Anyone views ticket categories" ON public.ticket_categories
  FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage ticket categories" ON public.ticket_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ POLICIES: bookings ============
CREATE POLICY "Anyone can submit a booking" ON public.bookings
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage bookings" ON public.bookings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ POLICIES: ticket_orders ============
CREATE POLICY "Anyone can place a ticket order" ON public.ticket_orders
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users view own orders" ON public.ticket_orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage orders" ON public.ticket_orders
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ POLICIES: inquiries ============
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins view inquiries" ON public.inquiries
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update inquiries" ON public.inquiries
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- ============ SEED DUMMY EVENTS ============
INSERT INTO public.events (slug, title, short_description, description, event_date, event_time, venue, banner_url, base_price, status, is_featured, category) VALUES
('royal-gala-night-2025', 'Royal Gala Night 2025', 'An exclusive black-tie evening of luxury, music, and Dubai''s finest hospitality.',
 'Step into a world of opulence at the Royal Gala Night 2025. An evening curated for Dubai''s most discerning guests, featuring world-class entertainment, a six-course gourmet experience, and live performances under crystal chandeliers.',
 '2025-12-20', '7:00 PM onwards', 'Atlantis The Palm, Grand Ballroom', '/src/assets/hero-gala.jpg', 850, 'upcoming', TRUE, 'Gala'),

('desert-stars-concert', 'Desert Stars — Live in Concert', 'A spectacular open-air concert under the Dubai desert sky.',
 'A once-in-a-lifetime concert experience under the stars of the Arabian desert. International artists, premium VIP cabanas, and a curated culinary journey.',
 '2026-01-18', '8:00 PM', 'Al Marmoom Desert, Dubai', '/src/assets/gallery-2.jpg', 450, 'upcoming', TRUE, 'Concert'),

('luxury-brand-launch', 'Maison Or — Brand Launch', 'The unveiling of a new luxury fashion house in Dubai.',
 'An invite-style launch reimagined for Dubai. Runway showcase, champagne lounge, and a curated guest list of taste-makers.',
 '2025-12-05', '9:00 PM', 'One&Only The Palm', '/src/assets/gallery-5.jpg', 0, 'upcoming', FALSE, 'Brand Launch'),

('platinum-wedding-showcase', 'Platinum Wedding Showcase', 'Inspiration evening for couples planning a luxury Dubai wedding.',
 'Meet Dubai''s top wedding designers, planners, florists, and entertainment partners in one curated evening at a five-star venue.',
 '2026-02-14', '6:00 PM', 'Burj Al Arab, Skyview', '/src/assets/gallery-1.jpg', 250, 'upcoming', TRUE, 'Wedding'),

('corporate-summit-dubai', 'Dubai Leaders Summit', 'A premium networking and keynote evening for C-level executives.',
 'An exclusive evening connecting Dubai''s top business leaders with curated keynote sessions, fine dining, and high-trust networking.',
 '2026-03-08', '6:30 PM', 'Address Downtown, Sky Lounge', '/src/assets/gallery-3.jpg', 1200, 'upcoming', FALSE, 'Corporate'),

('new-year-rooftop-2026', 'New Year Rooftop 2026', 'Ring in 2026 with Dubai''s most exclusive rooftop celebration.',
 'A premium rooftop celebration overlooking the Burj Khalifa fireworks. International DJs, curated cocktails, and unforgettable views.',
 '2025-12-31', '9:00 PM till late', 'SLS Dubai, Privilege Rooftop', '/src/assets/gallery-4.jpg', 950, 'sold_out', TRUE, 'Party');

-- Seed ticket categories for each event
INSERT INTO public.ticket_categories (event_id, name, description, price, quantity_total, sort_order)
SELECT e.id, t.name, t.description, t.price, t.qty, t.so FROM public.events e
CROSS JOIN LATERAL (
  VALUES
    ('Standard', 'General admission with full access to the event', e.base_price, 200, 1),
    ('Premium', 'Reserved premium seating with welcome drink', e.base_price * 1.6, 80, 2),
    ('VIP', 'VIP table, dedicated host, premium bar package', e.base_price * 2.5, 30, 3)
) AS t(name, description, price, qty, so)
WHERE e.base_price > 0;
