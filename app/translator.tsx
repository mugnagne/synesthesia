"use client";

import { useEffect, useRef, useState } from "react";
import type { SynesthesiaResult } from "@/lib/schema";
import type { MatchedPerfume } from "@/lib/match";
import { CURRENT_EXAMPLE } from "@/lib/examples";

const FRAGRANTICA_NOTE_SEARCH = "https://www.fragrantica.fr/search-notes/";
const MAX_LENGTH = 600;

const INDEX: [string, string, string][] = [
  ["002", "Émotions", "Ce que la scène contient, et à quelle intensité."],
  ["003", "Notes olfactives", "La même scène en vocabulaire de parfumeur."],
  ["004", "Familles", "Les accords qui correspondent."],
  ["005", "Parfums", "Les entrées les plus proches dans la base."],
  ["006", "Le lien", "Pourquoi ces notes pour cette scène."],
];

function Blocks({ filled }: { filled: number }) {
  const on = Math.min(5, Math.max(0, Math.round(filled)));
  return (
    <span className="blocks" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < on ? "block block-on" : "block"} />
      ))}
    </span>
  );
}

function BandHead({ index, title }: { index: string; title: string }) {
  return (
    <div className="band-head">
      <p className="label label-blue">{index}</p>
      <p className="label">{title}</p>
    </div>
  );
}

type VideoTier = "hd" | "sd" | "mobile";

// Charge la meilleure définition que l'appareil et la connexion peuvent
// raisonnablement tenir, plutôt qu'une seule vidéo pour tout le monde.
function chooseVideoTier(): VideoTier {
  if (window.innerWidth < 640) return "mobile";

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  const connection = nav.connection;
  if (connection?.saveData) return "mobile";
  if (connection?.effectiveType && ["slow-2g", "2g", "3g"].includes(connection.effectiveType)) {
    return "mobile";
  }

  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  if (memory <= 2 || cores <= 2) return "sd";
  return "hd";
}

const ASCII_TARGET = "SYNESTHESIA";
const ASCII_GLYPHS = "!@#$%&*_/\\|<>[]{}=+-?01XY";

function randomGlyph() {
  return ASCII_GLYPHS[Math.floor(Math.random() * ASCII_GLYPHS.length)];
}

function AsciiTitle() {
  const [frame, setFrame] = useState<string[]>(() => ASCII_TARGET.split(""));
  const [replayKey, setReplayKey] = useState(0);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrame(ASCII_TARGET.split(""));
      return;
    }

    let cancelled = false;
    let raf = 0;

    function scramble() {
      const total = ASCII_TARGET.length;
      const start = performance.now();
      const duration = 900;
      const lockDelay = duration / total;

      function tick(now: number) {
        if (cancelled) return;
        const lockedCount = Math.min(total, Math.floor((now - start) / lockDelay));
        setFrame(ASCII_TARGET.split("").map((ch, i) => (i < lockedCount ? ch : randomGlyph())));
        if (lockedCount < total) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) scramble();
      },
      { threshold: 0.6 }
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [replayKey]);

  return (
    <h1
      ref={ref}
      className="hero-ascii"
      role="button"
      tabIndex={0}
      aria-label={ASCII_TARGET}
      onClick={() => setReplayKey((k) => k + 1)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setReplayKey((k) => k + 1);
        }
      }}
    >
      {frame.join("")}
    </h1>
  );
}

function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    video.src = `/video/crash-bg-${chooseVideoTier()}.mp4`;
    video.load();
    video.play().catch(() => {});
  }, []);

  return (
    <section className="hero">
      <video
        ref={videoRef}
        className="hero-video"
        muted
        loop
        playsInline
        preload="none"
        poster="/video/crash-bg-poster.jpg"
      />
      <div className="hero-scrim" aria-hidden="true" />

      <div className="hero-chrome">
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--s1)" }}>
          <Blocks filled={3} />
          <span className="wordmark">Synesthésie</span>
        </span>
        <p className="label">001 — 006</p>
      </div>

      <div className="hero-body">
        <AsciiTitle />
        <a className="label hero-cta" href="#situation-form">
          Traduire une situation <span className="hero-cta-arrow">↓</span>
        </a>
      </div>
    </section>
  );
}

function Reveal({
  className = "",
  id,
  children,
}: {
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={`${className} reveal${visible ? " reveal-in" : ""}`}>
      {children}
    </section>
  );
}

export default function Translator({
  perfumeCount,
  brandCount,
}: {
  perfumeCount: number;
  brandCount: number;
}) {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SynesthesiaResult | null>(null);
  const [parfums, setParfums] = useState<MatchedPerfume[]>([]);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!situation.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setParfums([]);
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
      setParfums(data.parfums_suggeres ?? []);
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
      setError("Le navigateur a refusé l'accès au presse-papier. Les notes restent lisibles ci-dessus.");
    }
  }

  return (
    <div className="shell">
      <VideoHero />

      <main className="main">
        <Reveal className="band" id="situation-form">
          <BandHead index="001" title="Situation" />
          <form onSubmit={handleSubmit}>
            <p className="body small" style={{ marginBottom: "var(--s3)" }}>
              Une situation précise entre. Des notes de parfumerie et des parfums réels sortent.
            </p>

            <label className="label" htmlFor="situation" style={{ display: "block", marginBottom: "var(--s1)" }}>
              Décrivez la scène
            </label>
            <textarea
              id="situation"
              className="field"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder={CURRENT_EXAMPLE}
              rows={4}
              maxLength={MAX_LENGTH}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--s2)",
                marginTop: "var(--s2)",
              }}
            >
              <button type="submit" className="btn" disabled={loading || !situation.trim()}>
                {loading ? "Traduction en cours" : "Traduire"}
              </button>
              <p className="label">
                {situation.length} / {MAX_LENGTH}
              </p>
            </div>
          </form>
        </Reveal>

        {!result && !loading && !error && (
          <Reveal className="band">
            <BandHead index="000" title="Index" />
            <ul className="rows">
              {INDEX.map(([n, titre, description]) => (
                <li key={n} className="row-stack">
                  <p className="label">
                    <span className="label-blue">{n}</span> {titre}
                  </p>
                  <p className="small" style={{ marginTop: "var(--s1)" }}>
                    {description}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <div aria-live="polite">
          {loading && (
            <section className="band">
              <BandHead index="002" title="Lecture" />
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--s2)" }}>
                <div className="skeleton" style={{ height: "var(--s3)", width: "60%" }} />
                <div className="skeleton" style={{ height: "var(--s6)", width: "100%" }} />
                <div className="skeleton" style={{ height: "var(--s3)", width: "40%" }} />
              </div>
            </section>
          )}

          {error && (
            <section className="band">
              <BandHead index="ERR" title="Incident" />
              <p className="notice small">{error}</p>
            </section>
          )}

          {result && (
            <>
              <Reveal className="band">
                <BandHead index="002" title="Émotions" />
                <ul className="rows">
                  {result.emotions.map((emotion) => (
                    <li key={emotion.nom} className="row">
                      <span>{emotion.nom}</span>
                      <Blocks filled={emotion.intensite} />
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal className="band band-blue">
                <BandHead index="003" title="Notes olfactives" />
                <div>
                  <p className="notes">{result.notes_olfactives.join(", ")}</p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "var(--s3)",
                      marginTop: "var(--s3)",
                    }}
                  >
                    <button
                      type="button"
                      className={`btn btn-quiet label${copied ? " is-copied" : ""}`}
                      onClick={copyNotes}
                    >
                      {copied ? "Copié" : "Copier la liste"}
                    </button>
                    <a
                      className="link label"
                      href={FRAGRANTICA_NOTE_SEARCH}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chercher ces notes sur Fragrantica
                    </a>
                  </div>
                </div>
              </Reveal>

              <Reveal className="band">
                <BandHead index="004" title="Familles" />
                <ul className="tags">
                  {result.familles_olfactives.map((famille) => (
                    <li key={famille} className="tag label">
                      {famille}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal className="band">
                <BandHead index="005" title="Parfums" />
                {parfums.length > 0 ? (
                  <ul className="rows">
                    {parfums.map((p) => (
                      <li key={`${p.marque}-${p.nom}`} className="row-stack">
                        <p className="label label-blue">{p.marque}</p>
                        <p className="title" style={{ marginTop: "var(--s1)" }}>
                          {p.nom}
                        </p>
                        {p.notes_communes.length > 0 && (
                          <p className="small" style={{ marginTop: "var(--s1)" }}>
                            En commun : {p.notes_communes.join(", ")}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="body small">
                    Aucun parfum de la base ne partage assez de notes avec cette situation. La liste
                    du bloc 003 reste utilisable pour chercher plus large.
                  </p>
                )}
              </Reveal>

              <Reveal className="band">
                <BandHead index="006" title="Le lien" />
                <p className="wall-text">{result.recit}</p>
              </Reveal>
            </>
          )}
        </div>
      </main>

      <footer className="bar" style={{ borderBottom: 0 }}>
        <p className="label">Camille - 2026</p>
        <p className="label">
          {perfumeCount} parfums, {brandCount} maisons
        </p>
      </footer>
    </div>
  );
}
