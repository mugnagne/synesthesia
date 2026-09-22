import { z } from "zod";

// Mirrors SynesthesiaResult's notes_olfactives / familles_olfactives field
// names and shape on purpose — the matching engine (lib/match.ts) just
// compares sets between the two, no translation layer needed.
export const PerfumeSchema = z.object({
  marque: z.string(),
  nom: z.string(),
  genre: z.enum(["homme", "femme", "mixte"]),
  familles_olfactives: z.array(z.string()),
  notes_olfactives: z.array(z.string()),
});

export type Perfume = z.infer<typeof PerfumeSchema>;

// Filtre de genre exposé côté formulaire : "tout" en plus des trois valeurs
// réelles du catalogue (mixte = unisexe côté UI).
export const GENRE_FILTERS = ["tout", "homme", "femme", "mixte"] as const;
export type GenreFilter = (typeof GENRE_FILTERS)[number];

export const PerfumeBatchSchema = z.object({
  parfums: z.array(PerfumeSchema),
});

export type PerfumeBatch = z.infer<typeof PerfumeBatchSchema>;

// Hand-written wire schema (flat, no $ref) — see lib/schema.ts for why
// zodOutputFormat() is not used here (it produces a malformed schema with
// the currently installed @anthropic-ai/sdk + zod v4 combination).
const PERFUME_BATCH_JSON_SCHEMA = {
  type: "object",
  properties: {
    parfums: {
      type: "array",
      items: {
        type: "object",
        properties: {
          marque: { type: "string" },
          nom: { type: "string" },
          genre: { type: "string", enum: ["homme", "femme", "mixte"] },
          familles_olfactives: {
            type: "array",
            items: { type: "string" },
            description: "Familles/accords olfactifs, ex: chypré, boisé, floral, oriental, hespéridé",
          },
          notes_olfactives: {
            type: "array",
            items: { type: "string" },
            description: "Notes de parfumerie réelles de ce parfum, en français, classées de la plus évidente à la plus subtile",
          },
        },
        required: ["marque", "nom", "genre", "familles_olfactives", "notes_olfactives"],
        additionalProperties: false,
      },
    },
  },
  required: ["parfums"],
  additionalProperties: false,
} satisfies Record<string, unknown>;

export const perfumeBatchOutputFormat = {
  type: "json_schema" as const,
  schema: PERFUME_BATCH_JSON_SCHEMA,
  parse: (content: string): PerfumeBatch | null => {
    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      return null;
    }
    const result = PerfumeBatchSchema.safeParse(raw);
    return result.success ? result.data : null;
  },
};
