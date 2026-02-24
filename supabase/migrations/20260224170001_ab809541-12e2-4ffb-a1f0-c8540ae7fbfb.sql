
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can create bouquets" ON public.bouquets;
DROP POLICY IF EXISTS "Bouquets are publicly viewable" ON public.bouquets;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Anyone can create bouquets"
ON public.bouquets
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Bouquets are publicly viewable"
ON public.bouquets
FOR SELECT
TO anon, authenticated
USING (true);
