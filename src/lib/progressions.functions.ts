import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { ProgressionChord } from "@/lib/progressions";

const chordSchema = z.object({
  id: z.string(),
  rootPc: z.number().int().min(0).max(11),
  suffix: z.string().max(12),
  tuningId: z.string().max(40),
  strings: z.array(z.any()),
  minFret: z.number(),
  maxFret: z.number(),
});

const progressionSchema = z.object({
  id: z.string().max(64),
  name: z.string().max(120),
  tuningId: z.string().max(40),
  chords: z.array(chordSchema).max(64),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const syncSchema = z.object({
  progressions: z.array(progressionSchema).max(200),
});

export const listRemoteProgressions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("progressions")
      .select("local_id, name, tuning_id, chords, created_at, updated_at")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.local_id,
      name: r.name,
      tuningId: r.tuning_id,
      chords: (r.chords as unknown as ProgressionChord[]) ?? [],
      createdAt: new Date(r.created_at as string).getTime(),
      updatedAt: new Date(r.updated_at as string).getTime(),
    }));
  });

/**
 * Merges the local progressions into the account (never replaces):
 * a progression only overwrites its remote twin when it is strictly newer.
 * Returns the merged list.
 */
export const syncProgressions = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => syncSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: remoteRows, error: readErr } = await supabase
      .from("progressions")
      .select("local_id, name, tuning_id, chords, created_at, updated_at")
      .eq("user_id", userId);
    if (readErr) throw new Error(readErr.message);

    const remote = new Map(
      (remoteRows ?? []).map((r) => [r.local_id as string, r]),
    );

    const toUpsert = data.progressions.filter((p) => {
      const r = remote.get(p.id);
      if (!r) return true;
      return p.updatedAt > new Date(r.updated_at as string).getTime();
    });

    if (toUpsert.length > 0) {
      const { error } = await supabase.from("progressions").upsert(
        toUpsert.map((p) => ({
          user_id: userId,
          local_id: p.id,
          name: p.name,
          tuning_id: p.tuningId,
          chords: p.chords,
          created_at: new Date(p.createdAt).toISOString(),
          updated_at: new Date(p.updatedAt).toISOString(),
        })),
        { onConflict: "user_id,local_id" },
      );
      if (error) throw new Error(error.message);
    }

    const { data: merged, error: finalErr } = await supabase
      .from("progressions")
      .select("local_id, name, tuning_id, chords, created_at, updated_at")
      .eq("user_id", userId);
    if (finalErr) throw new Error(finalErr.message);

    return (merged ?? []).map((r) => ({
      id: r.local_id as string,
      name: r.name as string,
      tuningId: r.tuning_id as string,
      chords: (r.chords as unknown as ProgressionChord[]) ?? [],
      createdAt: new Date(r.created_at as string).getTime(),
      updatedAt: new Date(r.updated_at as string).getTime(),
    }));
  });

export const deleteRemoteProgression = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().max(64) }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("progressions")
      .delete()
      .eq("user_id", userId)
      .eq("local_id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
