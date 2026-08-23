import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useProStatus } from "@/hooks/useProStatus";
import { PaywallModal } from "@/components/chord-detective/PaywallModal";

const BASE_URL = "https://wtfchord.lovable.app";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — WTFChord" },
      {
        name: "description",
        content:
          "Compare Free and Pro plans for WTFChord. Pro unlocks ukulele, mandolin, cavaquinho, custom tunings, cloud sync and more.",
      },
      { property: "og:title", content: "Pricing — WTFChord" },
      {
        property: "og:description",
        content:
          "Compare Free and Pro plans for WTFChord. Pro unlocks ukulele, mandolin, cavaquinho, custom tunings, cloud sync and more.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${BASE_URL}/pricing` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/pricing` }],
  }),
});

const FEATURES = [
  { label: "Interactive fretboard", free: true, pro: true },
  { label: "Chord identification", free: true, pro: true },
  { label: "Reverse chord finder", free: true, pro: true },
  { label: "Standard guitar tuning", free: true, pro: true },
  { label: "Progression builder", free: true, pro: true },
  { label: "Share progressions by URL", free: true, pro: true },
  { label: "Ukulele (high & low G)", free: false, pro: true, badge: "Pro" },
  { label: "Mandolin (GDAE)", free: false, pro: true, badge: "Pro" },
  { label: "Cavaquinho (GGBD)", free: false, pro: true, badge: "Pro" },
  { label: "Custom 6-string tuning", free: false, pro: true, badge: "Pro" },
  { label: "Cloud sync across devices", free: false, pro: true, badge: "Pro" },
  { label: "Priority support", free: false, pro: true, badge: "Pro" },
];

function PricingPage() {
  const { isPro } = useProStatus();
  const [paywallOpen, setPaywallOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-xl border-b border-border">
        <Link
          to="/"
          className="font-extrabold italic tracking-tighter text-lg"
        >
          WTFChord
        </Link>
        <Link
          to="/"
          className="text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground"
        >
          Back to app
        </Link>
      </nav>

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter mb-4">
            Simple pricing
          </h1>
          <p className="text-muted text-lg">
            Start free. Upgrade once you need more instruments, custom tunings and cloud sync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Free */}
          <div className="rounded-3xl border border-border bg-surface/50 p-6 sm:p-8">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
              Free
            </div>
            <div className="text-4xl font-extrabold tracking-tighter mb-1">€0</div>
            <p className="text-sm text-muted mb-6">Forever free for guitar chord discovery.</p>
            <ul className="space-y-3 mb-8">
              {FEATURES.filter((f) => f.free).map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  <Check />
                  {f.label}
                </li>
              ))}
            </ul>
            <Link
              to="/"
              className="block w-full text-center px-4 py-3 rounded-xl border border-border font-bold hover:border-primary/50 transition-colors"
            >
              Continue free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest">
              Pro
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary mb-2">
              Pro
            </div>
            <div className="text-4xl font-extrabold tracking-tighter mb-1">€4.99</div>
            <p className="text-sm text-muted mb-6">One-time unlock. All devices.</p>
            <ul className="space-y-3 mb-8">
              {FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  <Check />
                  {f.label}
                  {f.badge && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[9px] font-mono uppercase tracking-widest">
                      {f.badge}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="block w-full text-center px-4 py-3 rounded-xl bg-primary/20 text-primary font-bold border border-primary/30">
                You already have Pro
              </div>
            ) : (
              <button
                onClick={() => setPaywallOpen(true)}
                className="block w-full text-center px-4 py-3 rounded-xl bg-foreground text-background font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface/50 p-6 text-center">
          <p className="text-sm text-muted">
            Questions? Pro is a single purchase tied to your WTFChord account. You can use it on any device after signing in.
          </p>
        </div>
      </main>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}

function Check() {
  return (
    <svg
      className="size-4 text-primary shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
