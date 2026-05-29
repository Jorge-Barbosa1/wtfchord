import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sigHeader = request.headers.get("stripe-signature");
        const body = await request.text();
        const secret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!secret) {
          console.error("STRIPE_WEBHOOK_SECRET is not configured");
          return new Response("Server misconfigured", { status: 500 });
        }
        if (!sigHeader) {
          return new Response("Missing signature", { status: 401 });
        }

        // Stripe signature header: "t=<ts>,v1=<sig>,v1=<sig2>,..."
        const parts = Object.fromEntries(
          sigHeader.split(",").map((kv) => {
            const [k, v] = kv.split("=");
            return [k, v];
          })
        ) as Record<string, string>;
        const timestamp = parts.t;
        const signatures = sigHeader
          .split(",")
          .filter((kv) => kv.startsWith("v1="))
          .map((kv) => kv.slice(3));

        if (!timestamp || signatures.length === 0) {
          return new Response("Malformed signature", { status: 401 });
        }

        const signedPayload = `${timestamp}.${body}`;
        const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");
        const expectedBuf = Buffer.from(expected, "hex");

        const valid = signatures.some((s) => {
          try {
            const sBuf = Buffer.from(s, "hex");
            return sBuf.length === expectedBuf.length && timingSafeEqual(sBuf, expectedBuf);
          } catch {
            return false;
          }
        });

        if (!valid) {
          return new Response("Invalid signature", { status: 401 });
        }

        // Replay protection: reject events older than 5 minutes
        const eventAge = Math.floor(Date.now() / 1000) - Number(timestamp);
        if (eventAge > 300) {
          return new Response("Event too old", { status: 401 });
        }

        let event: any;
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // We care about completed checkouts.
        if (
          event.type === "checkout.session.completed" ||
          event.type === "checkout.session.async_payment_succeeded"
        ) {
          const session = event.data?.object;
          const userId: string | undefined = session?.client_reference_id || undefined;
          const email: string | undefined =
            session?.customer_details?.email || session?.customer_email || undefined;

          let targetId: string | null = null;

          if (userId) {
            targetId = userId;
          } else if (email) {
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("id")
              .eq("email", email)
              .maybeSingle();
            targetId = profile?.id ?? null;
          }

          if (!targetId) {
            console.warn("Stripe webhook: no matching user for session", session?.id, { email });
            // Acknowledge so Stripe doesn't retry forever; we logged it.
            return new Response("No user match", { status: 200 });
          }

          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: true,
              pro_activated_at: new Date().toISOString(),
            })
            .eq("id", targetId);

          if (error) {
            console.error("Failed to mark Pro:", error.message);
            return new Response("DB error", { status: 500 });
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
