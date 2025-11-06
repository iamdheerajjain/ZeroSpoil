-- ZeroSpoil Database Schema
-- Run this in your Supabase SQL editor to set up the complete database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE food_status AS ENUM ('fresh', 'expiring_soon', 'expired');
CREATE TYPE waste_action AS ENUM ('consumed', 'donated', 'wasted', 'preserved', 'composted');
CREATE TYPE donation_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE measurement_system AS ENUM ('metric', 'imperial');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    dietary_restrictions TEXT[] DEFAULT '{}',
    favorite_cuisines TEXT[] DEFAULT '{}',
    measurement_system measurement_system DEFAULT 'metric',
    business_account BOOLEAN DEFAULT FALSE,
    theme TEXT DEFAULT 'light',
    notification_settings JSONB DEFAULT '{
        "expiration_alerts": true,
        "recipe_suggestions": true,
        "donation_reminders": true,
        "achievement_notifications": true,
        "email_notifications": false
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food items table
CREATE TABLE IF NOT EXISTS food_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    expiration_date DATE,
    predicted_expiration DATE,
    prediction_confidence DECIMAL(3,2),
    storage_location TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    image_url TEXT,
    status food_status DEFAULT 'fresh',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]',
    instructions TEXT[] NOT NULL DEFAULT '{}',
    cuisine_type TEXT,
    dietary_tags TEXT[] DEFAULT '{}',
    prep_time INTEGER,
    cook_time INTEGER,
    servings INTEGER,
    difficulty difficulty_level,
    image_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User saved recipes (many-to-many)
CREATE TABLE IF NOT EXISTS user_saved_recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

-- Donation locations table
CREATE TABLE IF NOT EXISTS donation_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    hours JSONB DEFAULT '{}',
    accepted_items TEXT[] DEFAULT '{}',
    website TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    location_id UUID REFERENCES donation_locations(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status donation_status DEFAULT 'scheduled',
    items JSONB NOT NULL DEFAULT '[]',
    total_weight DECIMAL(10,2),
    estimated_meals INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waste log table
CREATE TABLE IF NOT EXISTS waste_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    food_item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
    action waste_action NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity DECIMAL(10,2),
    estimated_value DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_type TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_items_user_id ON food_items(user_id);
CREATE INDEX IF NOT EXISTS idx_food_items_status ON food_items(status);
CREATE INDEX IF NOT EXISTS idx_food_items_expiration ON food_items(expiration_date);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_public ON recipes(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_logs_user_id ON waste_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_logs_date ON waste_logs(date);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_items_updated_at BEFORE UPDATE ON food_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donation_locations_updated_at BEFORE UPDATE ON donation_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update food item status based on expiration date
CREATE OR REPLACE FUNCTION update_food_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expiration_date IS NOT NULL THEN
        CASE 
            WHEN NEW.expiration_date < CURRENT_DATE THEN
                NEW.status = 'expired';
            WHEN NEW.expiration_date <= CURRENT_DATE + INTERVAL '3 days' THEN
                NEW.status = 'expiring_soon';
            ELSE
                NEW.status = 'fresh';
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic status updates
CREATE TRIGGER update_food_status_trigger 
    BEFORE INSERT OR UPDATE ON food_items 
    FOR EACH ROW EXECUTE FUNCTION update_food_status();

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Food items policies
CREATE POLICY "Users can view own food items" ON food_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food items" ON food_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food items" ON food_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own food items" ON food_items FOR DELETE USING (auth.uid() = user_id);

-- Recipes policies
CREATE POLICY "Users can view public recipes" ON recipes FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- User saved recipes policies
CREATE POLICY "Users can manage own saved recipes" ON user_saved_recipes FOR ALL USING (auth.uid() = user_id);

-- Donations policies
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own donations" ON donations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own donations" ON donations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own donations" ON donations FOR DELETE USING (auth.uid() = user_id);

-- Waste logs policies
CREATE POLICY "Users can view own waste logs" ON waste_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own waste logs" ON waste_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own waste logs" ON waste_logs FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Donation locations are public (read-only for users)
CREATE POLICY "Anyone can view donation locations" ON donation_locations FOR SELECT USING (is_active = TRUE);

-- Insert some sample donation locations
INSERT INTO donation_locations (name, address, latitude, longitude, contact_phone, hours, accepted_items, website) VALUES
('City Food Bank', '123 Main St, Downtown', 40.7128, -74.0060, '(555) 123-4567', 
 '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00", "saturday": "10:00-14:00", "sunday": "closed"}',
 '{"canned goods", "dry goods", "fresh produce", "dairy", "meat"}', 'https://cityfoodbank.org'),
('Community Kitchen', '456 Oak Ave, Midtown', 40.7589, -73.9851, '(555) 987-6543',
 '{"monday": "8:00-16:00", "tuesday": "8:00-16:00", "wednesday": "8:00-16:00", "thursday": "8:00-16:00", "friday": "8:00-16:00", "saturday": "9:00-13:00", "sunday": "closed"}',
 '{"fresh produce", "prepared meals", "dairy", "bread"}', 'https://communitykitchen.org'),
('Local Shelter', '789 Pine St, Uptown', 40.7831, -73.9712, '(555) 456-7890',
 '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00", "saturday": "10:00-15:00", "sunday": "12:00-16:00"}',
 '{"canned goods", "dry goods", "hygiene products", "clothing"}', 'https://localshelter.org');