
-- PORTFOLIO BACKEND SCHEMA (SUPABASE)
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the table
CREATE TABLE IF NOT EXISTS portfolio_configs (
  id BIGINT PRIMARY KEY,
  config JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE portfolio_configs ENABLE ROW LEVEL SECURITY;

-- 3. Define Access Policies
CREATE POLICY "Public Read Access" ON portfolio_configs FOR SELECT USING (true);
CREATE POLICY "Public Update Access" ON portfolio_configs FOR ALL USING (true) WITH CHECK (true);

-- 4. Initial Seed Data
-- This part populates the "Empty Table" so you can edit it immediately in the dashboard.
INSERT INTO portfolio_configs (id, config)
VALUES (1, '{
  "siteName": "VIVID MOTION",
  "logo": "🎬",
  "primaryColor": "#00E676",
  "secondaryColor": "#00C853",
  "adminPasscode": "edit123",
  "sections": [
    {
      "id": "hero-1",
      "type": "hero",
      "order": 0,
      "isVisible": true,
      "themeColor": "#00E676",
      "backgroundVideo": "https://assets.mixkit.co/videos/preview/mixkit-abstract-motion-of-vibrant-colors-40076-large.mp4",
      "content": {
        "title": "I BRING PIXELS TO LIFE",
        "subtitle": "Professional Video Editor",
        "description": "Transforming raw footage into cinematic stories.",
        "buttons": [{"text": "View Projects", "link": "#projects-1", "variant": "primary", "visible": true}]
      }
    },
    {
      "id": "projects-1",
      "type": "projects",
      "order": 1,
      "isVisible": true,
      "themeColor": "#00E676",
      "backgroundVideo": "https://assets.mixkit.co/videos/preview/mixkit-urban-traffic-in-the-city-at-night-4402-large.mp4",
      "content": {
        "title": "RECENT BANGERS",
        "items": [
          { 
            "id": "p1", 
            "title": "Cyberpunk Edit", 
            "category": "Commercial", 
            "thumbnail": "https://picsum.photos/seed/edit1/800/450",
            "videoUrl": "https://assets.mixkit.co/videos/preview/mixkit-urban-traffic-in-the-city-at-night-4402-large.mp4"
          }
        ]
      }
    }
  ]
}')
ON CONFLICT (id) DO NOTHING;

-- 5. Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_portfolio_configs_modtime ON portfolio_configs;
CREATE TRIGGER update_portfolio_configs_modtime
    BEFORE UPDATE ON portfolio_configs
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
