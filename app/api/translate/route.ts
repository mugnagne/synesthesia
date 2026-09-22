import { NextRequest, NextResponse, after } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, TRANSLATION_MODEL } from "@/lib/anthropic";
import { synesthesiaOutputFormat } from "@/lib/schema";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompt";
import { matchPerfumes } from "@/lib/match";
import { PERFUMES, NICHE_MODE_EXCLUDED_BRANDS } from "@/lib/catalogue";
import { logTranslation } from "@/lib/db";
import { GENRE_FILTERS, type GenreFilter } from "@/lib/perfumeSchema";

const MAX_SITUATION_LENGTH = 600;

type Locale = "fr" | "en";

function parseLocale(value: unknown): Locale {
  return value === "en" ? "en" : "fr";
}

function parseGenre(value: unknown): GenreFilter {
  return typeof value === "string" && (GENRE_FILTERS as readonly string[]).includes(value)
    ? (value as GenreFilter)
    : "tout";
}

function parseNiche(value: unknown): boolean {
  return value === true;
}

const MESSAGES = {
  invalidJson: { fr: "Corps de requête JSON invalide.", en: "Invalid JSON request body." },
  situationTooShort: {
    fr: "Décris une situation d'au moins quelques mots.",
    en: "Describe a situation in at least a few words.",
  },
  situationTooLong: (max: number) => ({
    fr: `La situation doit tenir en moins de ${max} caractères.`,
    en: `The situation must be under ${max} characters.`,
  }),
  unparseableOutput: {
    fr: "La réponse du modèle n'a pas pu être interprétée.",
    en: "The model's response could not be parsed.",
  },
  missingApiKey: {
    fr: "Clé API Anthropic manquante ou invalide côté serveur.",
    en: "Missing or invalid Anthropic API key on the server.",
  },
  rateLimited: {
    fr: "Trop de requêtes en ce moment, réessaie dans quelques instants.",
    en: "Too many requests right now, try again in a moment.",
  },
  insufficientCredit: {
    fr: "Crédit Anthropic insuffisant : ajoute du crédit dans console.anthropic.com.",
    en: "Insufficient Anthropic credit: add credit at console.anthropic.com.",
  },
  badRequest: {
    fr: "Requête invalide envoyée au modèle.",
    en: "Invalid request sent to the model.",
  },
  serviceDown: {
    fr: "Le service de traduction est indisponible.",
    en: "The translation service is unavailable.",
  },
} as const;

function localized(entry: { fr: string; en: string }, locale: Locale): string {
  return entry[locale];
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: MESSAGES.invalidJson.fr }, { status: 400 });
  }

  const locale = parseLocale((body as { locale?: unknown })?.locale);

  const situation = (body as { situation?: unknown })?.situation;
  if (typeof situation !== "string" || situation.trim().length < 3) {
    return NextResponse.json(
      { error: localized(MESSAGES.situationTooShort, locale) },
      { status: 400 },
    );
  }
  if (situation.length > MAX_SITUATION_LENGTH) {
    return NextResponse.json(
      { error: localized(MESSAGES.situationTooLong(MAX_SITUATION_LENGTH), locale) },
      { status: 400 },
    );
  }

  const genre = parseGenre((body as { genre?: unknown })?.genre);
  const niche = parseNiche((body as { niche?: unknown })?.niche);

  try {
    const response = await anthropic.messages.parse({
      model: TRANSLATION_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(situation) }],
      output_config: {
        format: synesthesiaOutputFormat,
      },
    });

    if (!response.parsed_output) {
      return NextResponse.json(
        { error: localized(MESSAGES.unparseableOutput, locale) },
        { status: 502 },
      );
    }

    let pool = genre === "tout" ? PERFUMES : PERFUMES.filter((p) => p.genre === genre);
    if (niche) {
      pool = pool.filter((p) => !NICHE_MODE_EXCLUDED_BRANDS.includes(p.marque));
    }
    const parfums_suggeres = matchPerfumes(response.parsed_output, pool);

    // Runs after the response is sent, not racing it — a bare unawaited
    // promise risks the serverless runtime freezing before the write lands.
    // A missing/unreachable database (e.g. before the Postgres integration
    // is connected) must not break the actual feature — only the journal
    // loses that entry.
    after(() => {
      logTranslation({
        situation,
        result: response.parsed_output!,
        parfums: parfums_suggeres,
        model: TRANSLATION_MODEL,
      }).catch((error) => {
        console.error("[/api/translate] log", error);
      });
    });

    return NextResponse.json({ result: response.parsed_output, parfums_suggeres });
  } catch (error) {
    // Logged server-side only (visible in Vercel's function logs), never sent to the client.
    console.error("[/api/translate]", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: localized(MESSAGES.missingApiKey, locale) },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: localized(MESSAGES.rateLimited, locale) },
        { status: 429 },
      );
    }
    // Anthropic returns insufficient credit as a 400 invalid_request_error (not the
    // 402 billing_error its docs describe for billing problems generally) — matched
    // on message text since the error `.type` is the same generic invalid_request_error.
    if (error instanceof Anthropic.APIError && /credit balance/i.test(error.message)) {
      return NextResponse.json(
        { error: localized(MESSAGES.insufficientCredit, locale) },
        { status: 402 },
      );
    }
    if (error instanceof Anthropic.BadRequestError) {
      return NextResponse.json({ error: localized(MESSAGES.badRequest, locale) }, { status: 400 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: localized(MESSAGES.serviceDown, locale) }, { status: 502 });
    }
    throw error;
  }
}
