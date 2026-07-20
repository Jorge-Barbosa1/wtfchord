import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, is_pro, pro_activated_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (
      data ?? { id: userId, email: null, is_pro: false, pro_activated_at: null }
    );
  });

export const claimLegacyPro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // NOTE: legacy client-side "Pro" flag cannot be trusted as proof of payment.
    // This endpoint is intentionally a no-op — Pro status is only granted by
    // the verified Stripe webhook (see src/routes/api/public/stripe-webhook.ts).
    return { ok: true, claimed: false, userId: context.userId };
  });
