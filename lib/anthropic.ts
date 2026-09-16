import Anthropic from "@anthropic-ai/sdk";

// Resolves credentials from the environment (ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN).
export const anthropic = new Anthropic();

// claude-opus-5 gives the most nuanced sensory/emotional reading; swap to
// claude-sonnet-5 via env if the per-request cost matters more than nuance.
export const TRANSLATION_MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5";

// Used only by scripts/generate-perfumes.ts (a bulk, offline, factual-recall
// job) — sonnet is the cost-appropriate default there regardless of
// TRANSLATION_MODEL. Override with PERFUME_MODEL if quality > cost matters
// more for this one-off run.
export const PERFUME_GENERATION_MODEL = process.env.PERFUME_MODEL ?? "claude-sonnet-5";
