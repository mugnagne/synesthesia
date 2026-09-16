import { z } from "zod";

export const EmotionSchema = z.object({
  nom: z.string().describe("Nom de l'émotion en français, ex: mélancolie"),
  intensite: z
    .number()
    .min(1)
    .max(5)
    .describe("Intensité de l'émotion dans la situation, de 1 (légère) à 5 (dominante)"),
});

export const SynesthesiaResultSchema = z.object({
  emotions: z
    .array(EmotionSchema)
    .min(2)
    .max(6)
    .describe("Les émotions dominantes évoquées par la situation décrite"),
  notes_olfactives: z
    .array(z.string())
    .min(6)
    .max(14)
    .describe(
      "Notes de parfumerie au vocabulaire standard (celui utilisé sur Fragrantica: bergamote, " +
        "vétiver, cuir, ambre, feuilles mortes, foin coupé, musc, papier, etc.), classées de la " +
        "plus évidente à la plus subtile, prêtes à être copiées-collées dans un moteur de " +
        "recherche de parfums par notes.",
    ),
  familles_olfactives: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe("Familles ou accords olfactifs correspondants, ex: chypré, boisé, hespéridé, poudré, aromatique"),
  recit: z
    .string()
    .describe(
      "Deux à trois phrases qui expliquent, sensoriellement, le lien entre la situation " +
        "décrite et les notes choisies.",
    ),
});

export type SynesthesiaResult = z.infer<typeof SynesthesiaResultSchema>;
