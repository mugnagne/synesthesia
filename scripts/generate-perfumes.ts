// Génère data/perfumes.json à partir de la connaissance générale de Claude —
// aucun scraping de Fragrantica (leurs CGU l'interdisent explicitement).
// Idempotent : relancer ce script saute les marques déjà présentes dans le
// fichier, donc une interruption (rate limit, coupure réseau) ne fait perdre
// que la marque en cours.
//
// Usage : ANTHROPIC_API_KEY=... npx tsx scripts/generate-perfumes.ts
// (ou via le workflow GitHub Actions .github/workflows/generate-perfumes.yml)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Anthropic from "@anthropic-ai/sdk";
import { PERFUME_BRANDS } from "../lib/perfumeBrands";
import { perfumeBatchOutputFormat, type Perfume } from "../lib/perfumeSchema";

try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local (e.g. in CI, where the key comes from the environment already) — fine
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "perfumes.json");
const MODEL = process.env.PERFUME_MODEL ?? "claude-sonnet-5";
const DELAY_MS = 1500;

const SYSTEM_PROMPT = `Tu es un expert en parfumerie. On te donne une maison de parfums et un \
nombre cible. Liste les parfums les plus connus et emblématiques de cette maison (classiques \
et succès récents), avec pour chacun : son genre, ses familles/accords olfactifs, et ses notes \
de parfumerie réelles et reconnaissables (vocabulaire standard : bergamote, vétiver, cuir, \
ambre, iris, musc blanc, etc.), en français, classées de la plus évidente à la plus subtile. \
N'invente pas de parfum qui n'existe pas. Si tu ne peux pas atteindre le nombre cible avec des \
parfums réels que tu connais avec confiance, donne-en moins plutôt que d'inventer.`;

function loadExisting(): Perfume[] {
  if (!existsSync(DATA_PATH)) return [];
  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  } catch {
    console.warn(`[generate-perfumes] ${DATA_PATH} illisible, on repart de zéro.`);
    return [];
  }
}

function save(perfumes: Perfume[]) {
  mkdirSync(dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(perfumes, null, 2) + "\n", "utf-8");
}

async function generateBrand(
  client: Anthropic,
  marque: string,
  cible: number,
): Promise<Perfume[]> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: `Maison : ${marque}\nNombre cible de parfums : ${cible}` },
    ],
    output_config: { format: perfumeBatchOutputFormat },
  });

  if (!response.parsed_output) {
    throw new Error("réponse non conforme au schéma attendu");
  }
  return response.parsed_output.parfums;
}

async function main() {
  const client = new Anthropic();
  const perfumes = loadExisting();
  const doneBrands = new Set(perfumes.map((p) => p.marque));

  const todo = PERFUME_BRANDS.filter((b) => !doneBrands.has(b.marque));
  console.log(
    `[generate-perfumes] ${perfumes.length} parfums déjà en base (${doneBrands.size} marques). ` +
      `${todo.length} marques restantes sur ${PERFUME_BRANDS.length}.`,
  );

  for (const [i, { marque, cible }] of todo.entries()) {
    process.stdout.write(`[generate-perfumes] (${i + 1}/${todo.length}) ${marque}... `);
    try {
      const batch = await generateBrand(client, marque, cible);
      perfumes.push(...batch);
      save(perfumes);
      console.log(`${batch.length} parfums ajoutés (total ${perfumes.length}).`);
    } catch (error) {
      console.log(`ÉCHEC (${error instanceof Error ? error.message : String(error)}), on continue.`);
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`[generate-perfumes] Terminé. ${perfumes.length} parfums dans ${DATA_PATH}.`);
}

main().catch((error) => {
  console.error("[generate-perfumes] Erreur fatale:", error);
  process.exit(1);
});
