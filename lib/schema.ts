import { z } from "zod";

export const EmotionSchema = z.object({
  nom: z.string().describe("Nom de l'émotion en français, ex: mélancolie"),
  intensite: z
    .number()
    .describe("Intensité de l'émotion dans la situation, entier de 1 (légère) à 5 (dominante)"),
});

export const SynesthesiaResultSchema = z.object({
  emotions: z
    .array(EmotionSchema)
    .describe("2 à 6 émotions dominantes évoquées par la situation décrite"),
  notes_olfactives: z
    .array(z.string())
    .describe(
      "6 à 14 notes de parfumerie au vocabulaire standard (celui utilisé sur Fragrantica), " +
        "puisées largement dans toutes les familles selon la scène plutôt que sur les mêmes " +
        "notes refuges à chaque fois, classées de la plus évidente à la plus subtile, prêtes à " +
        "être copiées-collées dans un moteur de recherche de parfums par notes.",
    ),
  familles_olfactives: z
    .array(z.string())
    .describe("1 à 4 familles ou accords olfactifs correspondants, ex: chypré, boisé, hespéridé, poudré, aromatique"),
  recit: z
    .string()
    .describe(
      "Deux à trois phrases qui expliquent, sensoriellement, le lien entre la situation " +
        "décrite et les notes choisies.",
    ),
});

export type SynesthesiaResult = z.infer<typeof SynesthesiaResultSchema>;

// The SDK's zodOutputFormat() helper (@anthropic-ai/sdk + zod v4) produces a
// malformed schema on the wire — nested objects get pulled into $defs/$ref,
// and it still leaks a stray top-level `description` artifact. Anthropic's
// structured-output validator rejected that shape with a 400. To sidestep it
// entirely, the wire schema below is hand-written (flat, no $ref) and mirrors
// SynesthesiaResultSchema field-for-field; the response is then parsed and
// validated locally with the Zod schema above.
const SYNESTHESIA_JSON_SCHEMA = {
  type: "object",
  properties: {
    emotions: {
      type: "array",
      description: "2 à 6 émotions dominantes évoquées par la situation décrite",
      items: {
        type: "object",
        properties: {
          nom: { type: "string", description: "Nom de l'émotion en français, ex: mélancolie" },
          intensite: {
            type: "integer",
            description: "Intensité de l'émotion dans la situation, de 1 (légère) à 5 (dominante)",
          },
        },
        required: ["nom", "intensite"],
        additionalProperties: false,
      },
    },
    notes_olfactives: {
      type: "array",
      description:
        "6 à 14 notes de parfumerie au vocabulaire standard (celui utilisé sur Fragrantica), " +
        "puisées largement dans toutes les familles selon la scène plutôt que sur les mêmes " +
        "notes refuges à chaque fois, classées de la plus évidente à la plus subtile, prêtes à " +
        "être copiées-collées dans un moteur de recherche de parfums par notes.",
      items: { type: "string" },
    },
    familles_olfactives: {
      type: "array",
      description:
        "1 à 4 familles ou accords olfactifs correspondants, ex: chypré, boisé, hespéridé, poudré, aromatique",
      items: { type: "string" },
    },
    recit: {
      type: "string",
      description:
        "Deux à trois phrases qui expliquent, sensoriellement, le lien entre la situation " +
        "décrite et les notes choisies.",
    },
  },
  required: ["emotions", "notes_olfactives", "familles_olfactives", "recit"],
  additionalProperties: false,
} satisfies Record<string, unknown>;

export const synesthesiaOutputFormat = {
  type: "json_schema" as const,
  schema: SYNESTHESIA_JSON_SCHEMA,
  // Returns null instead of throwing on a malformed/non-conforming response — the
  // caller already treats a null parsed_output as "model didn't come back clean".
  parse: (content: string): SynesthesiaResult | null => {
    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      return null;
    }
    const result = SynesthesiaResultSchema.safeParse(raw);
    return result.success ? result.data : null;
  },
};
