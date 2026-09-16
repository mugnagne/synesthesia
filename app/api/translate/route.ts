import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, TRANSLATION_MODEL } from "@/lib/anthropic";
import { synesthesiaOutputFormat } from "@/lib/schema";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompt";

const MAX_SITUATION_LENGTH = 600;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  const situation = (body as { situation?: unknown })?.situation;
  if (typeof situation !== "string" || situation.trim().length < 3) {
    return NextResponse.json(
      { error: "Décris une situation d'au moins quelques mots." },
      { status: 400 },
    );
  }
  if (situation.length > MAX_SITUATION_LENGTH) {
    return NextResponse.json(
      { error: `La situation doit tenir en moins de ${MAX_SITUATION_LENGTH} caractères.` },
      { status: 400 },
    );
  }

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
        { error: "La réponse du modèle n'a pas pu être interprétée." },
        { status: 502 },
      );
    }

    return NextResponse.json({ result: response.parsed_output });
  } catch (error) {
    // Logged server-side only (visible in Vercel's function logs), never sent to the client.
    console.error("[/api/translate]", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Clé API Anthropic manquante ou invalide côté serveur." },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Trop de requêtes en ce moment, réessaie dans quelques instants." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.BadRequestError) {
      return NextResponse.json({ error: "Requête invalide envoyée au modèle." }, { status: 400 });
    }
    if (error instanceof Anthropic.APIError && error.status === 402) {
      return NextResponse.json(
        { error: "Crédit Anthropic insuffisant : ajoute du crédit dans console.anthropic.com." },
        { status: 402 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: "Le service de traduction est indisponible." }, { status: 502 });
    }
    throw error;
  }
}
