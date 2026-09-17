import { neon } from "@neondatabase/serverless";
import type { SynesthesiaResult } from "@/lib/schema";
import type { MatchedPerfume } from "@/lib/match";

// Set by Vercel's Neon integration (Storage → Create Database → Postgres)
// once connected to the project. Locally, put the same connection string in
// .env.local to log against the same database from `npm run dev`.
function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL manquante — la base Postgres n'est pas connectée.");
  }
  return neon(url);
}

let schemaReady: Promise<unknown> | null = null;

function ensureSchema(): Promise<unknown> {
  if (!schemaReady) {
    schemaReady = sql()`
      CREATE TABLE IF NOT EXISTS translations (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        situation TEXT NOT NULL,
        emotions JSONB NOT NULL,
        notes_olfactives JSONB NOT NULL,
        familles_olfactives JSONB NOT NULL,
        recit TEXT NOT NULL,
        parfums_suggeres JSONB NOT NULL,
        model TEXT NOT NULL
      )
    `;
  }
  return schemaReady;
}

export type TranslationLogEntry = {
  situation: string;
  result: SynesthesiaResult;
  parfums: MatchedPerfume[];
  model: string;
};

// Fire-and-forget from the caller's side — this throws on any failure (no
// DATABASE_URL, unreachable database, bad schema) rather than swallowing it,
// so the route handler's own try/catch decides how loud to be. Never awaited
// in a way that would delay the user-facing response.
export async function logTranslation(entry: TranslationLogEntry): Promise<void> {
  await ensureSchema();
  await sql()`
    INSERT INTO translations
      (situation, emotions, notes_olfactives, familles_olfactives, recit, parfums_suggeres, model)
    VALUES (
      ${entry.situation},
      ${JSON.stringify(entry.result.emotions)}::jsonb,
      ${JSON.stringify(entry.result.notes_olfactives)}::jsonb,
      ${JSON.stringify(entry.result.familles_olfactives)}::jsonb,
      ${entry.result.recit},
      ${JSON.stringify(entry.parfums.map((p) => ({ marque: p.marque, nom: p.nom })))}::jsonb,
      ${entry.model}
    )
  `;
}

export type TranslationRow = {
  id: number;
  created_at: string;
  situation: string;
  emotions: SynesthesiaResult["emotions"];
  notes_olfactives: string[];
  familles_olfactives: string[];
  recit: string;
  parfums_suggeres: { marque: string; nom: string }[];
  model: string;
};

export async function listTranslations(limit = 200): Promise<TranslationRow[]> {
  await ensureSchema();
  const rows = await sql()`
    SELECT id, created_at, situation, emotions, notes_olfactives, familles_olfactives,
           recit, parfums_suggeres, model
    FROM translations
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as TranslationRow[];
}
