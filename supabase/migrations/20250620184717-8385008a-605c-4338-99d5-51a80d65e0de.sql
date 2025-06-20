
-- Create game_settings table to store admin configuration
CREATE TABLE public.game_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.game_settings (id, settings) VALUES (
  'main',
  '{
    "minAptBet": 0.01,
    "minEmojiBet": 0.01,
    "maxBetAmount": 10,
    "gameEnabled": true,
    "maintenanceMode": false
  }'::jsonb
);

-- Enable RLS (Row Level Security) - only admins should access this
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later based on admin roles)
CREATE POLICY "Allow all operations on game_settings" ON public.game_settings
  FOR ALL USING (true);
