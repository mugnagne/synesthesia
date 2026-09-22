import perfumesData from "@/data/perfumes.json";
import type { Perfume } from "@/lib/perfumeSchema";

export const PERFUMES = perfumesData as Perfume[];

export const PERFUME_COUNT = PERFUMES.length;

export const BRAND_COUNT = new Set(PERFUMES.map((p) => p.marque)).size;

// Mode Niche : les cinq maisons les plus connues du grand public, celles qui
// sortent presque à chaque requête si on ne les écarte pas. Écarté d'un bloc
// plutôt que calculé (ex: top 5 par nombre d'entrées) — la notoriété n'est
// pas le compte d'entrées dans cette base.
export const NICHE_MODE_EXCLUDED_BRANDS = [
  "Chanel",
  "Dior",
  "Guerlain",
  "Hermès",
  "Yves Saint Laurent",
];
