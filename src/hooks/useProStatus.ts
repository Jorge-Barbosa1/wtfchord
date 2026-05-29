import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "./useAuth";
import { getMyProfile, claimLegacyPro } from "@/lib/profile.functions";

const KEY = "cd.pro";

function readLocal(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return false;
    return !!JSON.parse(raw)?.pro;
  } catch {
    return false;
  }
}

export function setProStatus(pro: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ pro }));
    window.dispatchEvent(new Event("cd.pro.changed"));
  } catch {}
}

function clearLocalPro() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("cd.pro.changed"));
  } catch {}
}

export function useProStatus(): { isPro: boolean } {
  const { user, loading } = useAuth();
  const [localPro, setLocalPro] = useState<boolean>(() => readLocal());
  const fetchProfile = useServerFn(getMyProfile);
  const claim = useServerFn(claimLegacyPro);
  const qc = useQueryClient();

  useEffect(() => {
    const sync = () => setLocalPro(readLocal());
    window.addEventListener("storage", sync);
    window.addEventListener("cd.pro.changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cd.pro.changed", sync);
    };
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(),
    enabled: !!user,
    staleTime: 30_000,
  });

  // Auto-claim: if user logs in and has legacy localStorage Pro, transfer it.
  useEffect(() => {
    if (!user || !profile) return;
    if (!profile.is_pro && localPro) {
      claim().then(() => {
        clearLocalPro();
        qc.invalidateQueries({ queryKey: ["profile", user.id] });
      }).catch(() => {});
    } else if (profile.is_pro && localPro) {
      // Server is source of truth; clean local flag.
      clearLocalPro();
    }
  }, [user, profile, localPro, claim, qc]);

  if (loading && !user) {
    return { isPro: localPro };
  }
  if (user) {
    return { isPro: !!profile?.is_pro || localPro };
  }
  return { isPro: localPro };
}
