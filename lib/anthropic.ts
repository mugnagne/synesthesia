import Anthropic from "@anthropic-ai/sdk";

// Resolves credentials from the environment (ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN).
export const anthropic = new Anthropic();

// claude-opus-5 gives the most nuanced sensory/emotional reading; swap to
// claude-sonnet-5 via env if the per-request cost matters more than nuance.
export const TRANSLATION_MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5";
