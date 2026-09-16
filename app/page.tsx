"use client";

import { useState } from "react";
import type { SynesthesiaResult } from "@/lib/schema";

const EXAMPLE = "La rentrée des classes quand on a 8 ans.";
const FRAGRANTICA_NOTE_SEARCH = "https://www.fragrantica.com/findperfume/";

export default function Home() {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SynesthesiaResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!situation.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setResult(data.result);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  async function copyNotes() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.notes_olfactives.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — nothing to do, the notes are still on screen
    }
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Synesthésie</h1>
        <p className="text-sm text-[var(--foreground)]/70">
          Décris une situation précise que tu aimes. On la traduit en notes de parfum, prêtes à
          être collées dans un moteur de recherche de parfums par notes.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder={EXAMPLE}
          rows={3}
          maxLength={600}
          className="w-full resize-none rounded-lg border border-black/10 bg-white/60 p-4 text-base outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={loading || !situation.trim()}
          className="self-start rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Traduction en cours…" : "Traduire en parfum"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {result && (
        <section className="flex flex-col gap-6 rounded-xl border border-black/10 bg-white/50 p-6">
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/60">
              Émotions
            </h2>
            <div className="flex flex-wrap gap-2">
              {result.emotions.map((emotion) => (
                <span
                  key={emotion.nom}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm"
                  title={`Intensité ${emotion.intensite}/5`}
                >
                  {emotion.nom}
                  <span className="ml-1.5 text-[var(--accent)]">
                    {"●".repeat(emotion.intensite)}
                    <span className="text-black/15">{"●".repeat(5 - emotion.intensite)}</span>
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/60">
              Familles olfactives
            </h2>
            <div className="flex flex-wrap gap-2">
              {result.familles_olfactives.map((famille) => (
                <span
                  key={famille}
                  className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-sm text-[var(--accent)]"
                >
                  {famille}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/60">
                Notes olfactives
              </h2>
              <button
                onClick={copyNotes}
                type="button"
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              >
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
            <p className="rounded-lg bg-black/[0.03] p-3 text-sm leading-relaxed">
              {result.notes_olfactives.join(", ")}
            </p>
            <p className="mt-2 text-xs text-[var(--foreground)]/60">
              Colle ces notes dans le{" "}
              <a
                href={FRAGRANTICA_NOTE_SEARCH}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                moteur de recherche par notes de Fragrantica
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/60">
              Le lien
            </h2>
            <p className="text-sm leading-relaxed text-[var(--foreground)]/90">{result.recit}</p>
          </div>
        </section>
      )}
    </main>
  );
}
