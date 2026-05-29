import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth, signOut } from "@/hooks/useAuth";

export function AuthButton({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!user) {
    return (
      <Link
        to="/login"
        className={
          compact
            ? "w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-sm font-mono uppercase tracking-widest text-muted hover:text-foreground block"
            : "text-xs font-mono text-muted hover:text-foreground transition-colors uppercase tracking-widest"
        }
      >
        Sign in
      </Link>
    );
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  if (compact) {
    return (
      <div className="px-3 py-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">Signed in</div>
        <div className="text-xs truncate mb-2">{user.email}</div>
        <button
          onClick={() => signOut()}
          className="text-xs font-mono uppercase tracking-widest text-danger hover:opacity-80"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="size-8 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center hover:border-primary/60 transition-colors"
        aria-label="Account"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
          <div className="px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted">Signed in</div>
            <div className="text-xs truncate">{user.email}</div>
          </div>
          <div className="h-px bg-border my-1" />
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-xs font-mono uppercase tracking-widest text-danger"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
