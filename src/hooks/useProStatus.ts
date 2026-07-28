import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "./useAuth";
import { getMyProfile } from "@/lib/profile.functions";

const LEGACY_KEY = "cd.pro";

/**
 * Pro status is server-verified only. Any local flag is untrusted and removed:
 * a client-side value (or a ?activated=true URL) must never unlock paid features.
 */
export function clearLegacyLocalPro() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

export function useProStatus(): { isPro: boolean } {
  const { user } = useAuth();
  const fetchProfile = useServerFn(getMyProfile);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(),
    enabled: !!user,
    staleTime: 30_000,
  });

  return { isPro: !!user && !!profile?.is_pro };
}
