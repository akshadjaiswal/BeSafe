-- BeSafe Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROUTES
-- ============================================
CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  departure_location JSONB NOT NULL, -- {lat, lng, address, radius}
  destination_location JSONB NOT NULL, -- {lat, lng, address, radius}
  active_days INTEGER[] NOT NULL, -- [1,2,3,4,5] = Mon-Fri
  expected_duration_mins INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routes"
  ON routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routes"
  ON routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
  ON routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
  ON routes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CONTACTS
-- ============================================
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL, -- E.164 format
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, phone_number)
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ROUTE_CONTACTS (many-to-many)
-- ============================================
CREATE TABLE route_contacts (
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (route_id, contact_id)
);

ALTER TABLE route_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own route contacts"
  ON route_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routes WHERE routes.id = route_contacts.route_id AND routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own route contacts"
  ON route_contacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routes WHERE routes.id = route_contacts.route_id AND routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own route contacts"
  ON route_contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM routes WHERE routes.id = route_contacts.route_id AND routes.user_id = auth.uid()
    )
  );

-- ============================================
-- JOURNEYS
-- ============================================
CREATE TABLE journeys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ,
  expected_arrival_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'timeout_alert_sent', 'cancelled')),
  last_known_location JSONB, -- {lat, lng, timestamp}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journeys_user_id ON journeys(user_id);
CREATE INDEX idx_journeys_status ON journeys(status);
CREATE INDEX idx_journeys_created_at ON journeys(created_at DESC);

ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journeys"
  ON journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journeys"
  ON journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journeys"
  ON journeys FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS LOG
-- ============================================
CREATE TABLE notifications_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  type TEXT NOT NULL CHECK (type IN ('arrival', 'timeout_alert')),
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  sms_provider_id TEXT
);

ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification logs"
  ON notifications_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journeys WHERE journeys.id = notifications_log.journey_id AND journeys.user_id = auth.uid()
    )
  );

-- Service role can insert (used by API routes)
CREATE POLICY "Service role can insert notifications"
  ON notifications_log FOR INSERT
  WITH CHECK (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
