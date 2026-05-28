import { useEffect, useState } from "react";

const KEY = "cd.pro";

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed?.pro;
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

export function useProStatus(): { isPro: boolean } {
  const [isPro, setIsPro] = useState<boolean>(() => read());

  useEffect(() => {
    const sync = () => setIsPro(read());
    window.addEventListener("storage", sync);
    window.addEventListener("cd.pro.changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cd.pro.changed", sync);
    };
  }, []);

  return { isPro };
}
