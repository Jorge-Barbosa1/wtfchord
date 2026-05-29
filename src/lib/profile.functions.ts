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
    // Profile may not exist yet if trigger lagged — return a default
    return (
      data ?? { id: userId, email: null, is_pro: false, pro_activated_at: null }
    );
  });

export const claimLegacyPro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ is_pro: true, pro_activated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
