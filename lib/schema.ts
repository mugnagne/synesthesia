import { z } from "zod";

// Note: cardinality/range constraints (.min()/.max()/.int()) are deliberately
// NOT used here. The installed @anthropic-ai/sdk's zodOutputFormat() mishandles
// them with zod v4 — it dumps the bounds into a stray `description` string
// instead of proper JSON Schema keywords, producing a malformed schema that
// the API rejects with a 400. Cardinality is communicated via `.describe()`
// text and reinforced in the system prompt instead.

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
      "6 à 14 notes de parfumerie au vocabulaire standard (celui utilisé sur Fragrantica: " +
        "bergamote, vétiver, cuir, ambre, feuilles mortes, foin coupé, musc, papier, etc.), " +
        "classées de la plus évidente à la plus subtile, prêtes à être copiées-collées dans un " +
        "moteur de recherche de parfums par notes.",
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
