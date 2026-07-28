-- Remove blanket UPDATE privilege from users; grant only the safe column.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (email) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Ensure the privilege-escalation safeguard trigger is actually attached.
DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- Tighten the RLS policy (belt and braces alongside column grants).
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);