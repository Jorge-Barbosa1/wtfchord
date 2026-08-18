ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_started_at timestamptz;

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'authenticated' THEN
    IF NEW.is_pro IS DISTINCT FROM OLD.is_pro
       OR NEW.pro_activated_at IS DISTINCT FROM OLD.pro_activated_at
       OR NEW.id IS DISTINCT FROM OLD.id
       OR NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Not allowed to modify privileged profile fields';
    END IF;
    -- The free trial may be started exactly once and never moved or cleared.
    IF NEW.trial_started_at IS DISTINCT FROM OLD.trial_started_at THEN
      IF OLD.trial_started_at IS NOT NULL OR NEW.trial_started_at IS NULL THEN
        RAISE EXCEPTION 'Trial can only be started once';
      END IF;
      NEW.trial_started_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_profile_privilege_escalation() FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.progressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id text NOT NULL,
  name text NOT NULL DEFAULT 'Untitled progression',
  tuning_id text NOT NULL DEFAULT 'standard',
  chords jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, local_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progressions TO authenticated;
GRANT ALL ON public.progressions TO service_role;

ALTER TABLE public.progressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own progressions" ON public.progressions;
CREATE POLICY "Users manage own progressions"
ON public.progressions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);