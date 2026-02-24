
-- Create bouquets table for storing digital bouquet data
CREATE TABLE public.bouquets (
  id TEXT NOT NULL PRIMARY KEY,
  sender_name TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  message TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'roses',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bouquets ENABLE ROW LEVEL SECURITY;

-- Anyone can view bouquets (public sharing)
CREATE POLICY "Bouquets are publicly viewable"
  ON public.bouquets
  FOR SELECT
  USING (true);

-- Anyone can create bouquets (no auth required)
CREATE POLICY "Anyone can create bouquets"
  ON public.bouquets
  FOR INSERT
  WITH CHECK (true);
