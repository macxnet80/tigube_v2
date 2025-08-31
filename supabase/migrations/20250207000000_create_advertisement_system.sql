-- Create advertisement system tables

-- Table for storing advertisements
CREATE TABLE advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    link_url TEXT,
    cta_text VARCHAR(100) DEFAULT 'Mehr erfahren',
    
    -- Advertisement type and placement
    ad_type VARCHAR(50) NOT NULL CHECK (ad_type IN ('search_card', 'profile_banner')),
    
    -- Targeting options
    target_pet_types TEXT[] DEFAULT '{}', -- Array of pet types: ['Hund', 'Katze', 'Kleintier', etc.]
    target_locations TEXT[] DEFAULT '{}', -- Array of locations/PLZ
    target_subscription_types TEXT[] DEFAULT '{}', -- Array: ['free', 'premium']
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Status and priority
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    
    -- Budget and tracking
    max_impressions INTEGER,
    current_impressions INTEGER DEFAULT 0,
    max_clicks INTEGER,
    current_clicks INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table for tracking advertisement impressions
CREATE TABLE advertisement_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertisement_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    -- Context information
    page_type VARCHAR(50) NOT NULL, -- 'search', 'profile'
    user_pet_types TEXT[], -- Pet types of the user at time of impression
    user_location TEXT, -- User location at time of impression
    user_subscription_type VARCHAR(20), -- 'free' or 'premium'
    
    -- Tracking
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking advertisement clicks
CREATE TABLE advertisement_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertisement_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
    impression_id UUID REFERENCES advertisement_impressions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id),
    
    -- Context information
    page_type VARCHAR(50) NOT NULL,
    user_pet_types TEXT[],
    user_location TEXT,
    user_subscription_type VARCHAR(20),
    
    -- Tracking
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_advertisements_active ON advertisements(is_active) WHERE is_active = true;
CREATE INDEX idx_advertisements_type ON advertisements(ad_type);
CREATE INDEX idx_advertisements_dates ON advertisements(start_date, end_date);
CREATE INDEX idx_advertisements_priority ON advertisements(priority DESC);
CREATE INDEX idx_advertisement_impressions_ad_id ON advertisement_impressions(advertisement_id);
CREATE INDEX idx_advertisement_impressions_user_id ON advertisement_impressions(user_id);
CREATE INDEX idx_advertisement_impressions_created_at ON advertisement_impressions(created_at);
CREATE INDEX idx_advertisement_clicks_ad_id ON advertisement_clicks(advertisement_id);
CREATE INDEX idx_advertisement_clicks_user_id ON advertisement_clicks(user_id);
CREATE INDEX idx_advertisement_clicks_created_at ON advertisement_clicks(created_at);

-- Create updated_at trigger for advertisements
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_advertisements_updated_at
    BEFORE UPDATE ON advertisements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisement_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisement_clicks ENABLE ROW LEVEL SECURITY;

-- Admin users can manage advertisements
CREATE POLICY "Admin can manage advertisements" ON advertisements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.is_admin = true
        )
    );

-- All authenticated users can view active advertisements (for display)
CREATE POLICY "Users can view active advertisements" ON advertisements
    FOR SELECT USING (
        is_active = true 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    );

-- Users can create impressions for themselves
CREATE POLICY "Users can create impressions" ON advertisement_impressions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view their own impressions
CREATE POLICY "Users can view own impressions" ON advertisement_impressions
    FOR SELECT USING (user_id = auth.uid());

-- Admin can view all impressions
CREATE POLICY "Admin can view all impressions" ON advertisement_impressions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.is_admin = true
        )
    );

-- Users can create clicks for themselves
CREATE POLICY "Users can create clicks" ON advertisement_clicks
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view their own clicks
CREATE POLICY "Users can view own clicks" ON advertisement_clicks
    FOR SELECT USING (user_id = auth.uid());

-- Admin can view all clicks
CREATE POLICY "Admin can view all clicks" ON advertisement_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.is_admin = true
        )
    );

-- Insert some sample advertisements for testing
INSERT INTO advertisements (
    title,
    description,
    image_url,
    link_url,
    cta_text,
    ad_type,
    target_pet_types,
    is_active,
    priority
) VALUES 
(
    'Premium Hundefutter',
    'Das beste Futter für Ihren Vierbeiner. Jetzt 20% Rabatt!',
    'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Hundefutter',
    'https://example.com/hundefutter',
    'Jetzt kaufen',
    'search_card',
    ARRAY['Hund'],
    true,
    10
),
(
    'Katzenzubehör Shop',
    'Alles für Ihre Katze - von Spielzeug bis Kratzbäume',
    'https://via.placeholder.com/300x200/059669/FFFFFF?text=Katzenzubehör',
    'https://example.com/katzenzubehoer',
    'Entdecken',
    'search_card',
    ARRAY['Katze'],
    true,
    8
),
(
    'Tierversicherung',
    'Schützen Sie Ihr Haustier mit unserer umfassenden Versicherung',
    'https://via.placeholder.com/300x150/DC2626/FFFFFF?text=Versicherung',
    'https://example.com/tierversicherung',
    'Mehr erfahren',
    'profile_banner',
    ARRAY['Hund', 'Katze', 'Kleintier'],
    true,
    5
);

-- Create function to get targeted advertisements
CREATE OR REPLACE FUNCTION get_targeted_advertisements(
    p_ad_type TEXT,
    p_user_pet_types TEXT[] DEFAULT '{}',
    p_user_location TEXT DEFAULT NULL,
    p_user_subscription_type TEXT DEFAULT 'free',
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    image_url TEXT,
    link_url TEXT,
    cta_text VARCHAR(100),
    ad_type VARCHAR(50),
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.description,
        a.image_url,
        a.link_url,
        a.cta_text,
        a.ad_type,
        a.priority
    FROM advertisements a
    WHERE 
        a.is_active = true
        AND a.ad_type = p_ad_type
        AND (a.start_date IS NULL OR a.start_date <= NOW())
        AND (a.end_date IS NULL OR a.end_date >= NOW())
        AND (a.max_impressions IS NULL OR a.current_impressions < a.max_impressions)
        AND (
            -- No targeting specified (show to everyone)
            (array_length(a.target_pet_types, 1) IS NULL OR array_length(a.target_pet_types, 1) = 0)
            OR
            -- Pet type targeting
            (array_length(p_user_pet_types, 1) > 0 AND a.target_pet_types && p_user_pet_types)
        )
        AND (
            -- No location targeting specified
            (array_length(a.target_locations, 1) IS NULL OR array_length(a.target_locations, 1) = 0)
            OR
            -- Location targeting (if user location is provided)
            (p_user_location IS NOT NULL AND p_user_location = ANY(a.target_locations))
        )
        AND (
            -- No subscription targeting specified
            (array_length(a.target_subscription_types, 1) IS NULL OR array_length(a.target_subscription_types, 1) = 0)
            OR
            -- Subscription type targeting
            (p_user_subscription_type = ANY(a.target_subscription_types))
        )
    ORDER BY a.priority DESC, RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_targeted_advertisements TO authenticated;