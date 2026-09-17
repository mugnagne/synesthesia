import perfumesData from "@/data/perfumes.json";
import type { Perfume } from "@/lib/perfumeSchema";

export const PERFUMES = perfumesData as Perfume[];

export const PERFUME_COUNT = PERFUMES.length;

export const BRAND_COUNT = new Set(PERFUMES.map((p) => p.marque)).size;
