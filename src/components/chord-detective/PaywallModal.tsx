interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

const CHECKOUT_URL = "https://buy.stripe.com/eVqbIU04m1i69Uk3uwaIM00";


export function PaywallModal({ open, onClose }: PaywallModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 size-8 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center text-muted hover:text-foreground"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
            PRO
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter mb-2">
          WTFChord Pro
        </h2>
        <p className="text-muted text-sm mb-6">
          Unlock ukulele, cavaquinho, mandolin, and custom tunings with a one-time
          payment.
        </p>

        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-4xl font-extrabold tracking-tighter">€4.99</span>
          <span className="text-xs font-mono text-muted uppercase tracking-widest">
            one-time
          </span>
        </div>

        <a
          href={CHECKOUT_URL}
          className="w-full bg-foreground text-background h-14 rounded-2xl font-extrabold flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors active:scale-[0.98]"
        >
          UNLOCK PRO
        </a>

        <p className="text-[10px] font-mono uppercase tracking-widest text-muted/70 text-center mt-4">
          Secure checkout via Stripe
        </p>
      </div>
    </div>
  );
}
