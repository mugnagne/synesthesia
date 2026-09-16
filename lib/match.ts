import type { SynesthesiaResult } from "@/lib/schema";
import type { Perfume } from "@/lib/perfumeSchema";

export type MatchedPerfume = Perfume & {
  score: number;
  notes_communes: string[];
  familles_communes: string[];
};

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Two terms "match" if they're equal once normalized, or one contains the
// other (e.g. "bois de santal" should match "santal") — situation notes and
// perfume notes are both free-form LLM output, so exact equality alone
// misses a lot of otherwise-good matches.
function termsOverlap(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function findOverlap(situationTerms: string[], perfumeTerms: string[]): string[] {
  const matched: string[] = [];
  for (const term of perfumeTerms) {
    if (situationTerms.some((s) => termsOverlap(s, term))) {
      matched.push(term);
    }
  }
  return matched;
}

export function matchPerfumes(
  situation: SynesthesiaResult,
  perfumes: Perfume[],
  limit = 5,
): MatchedPerfume[] {
  const scored = perfumes.map((perfume) => {
    const notes_communes = findOverlap(situation.notes_olfactives, perfume.notes_olfactives);
    const familles_communes = findOverlap(
      situation.familles_olfactives,
      perfume.familles_olfactives,
    );
    const score = notes_communes.length * 2 + familles_communes.length;
    return { ...perfume, score, notes_communes, familles_communes };
  });

  return scored
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
