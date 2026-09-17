import { listTranslations } from "@/lib/db";

export const dynamic = "force-dynamic";

function BandHead({ title }: { title: string }) {
  return (
    <div className="band-head">
      <p className="label label-blue">{title}</p>
    </div>
  );
}

export default async function JournalPage() {
  let rows: Awaited<ReturnType<typeof listTranslations>> = [];
  let error: string | null = null;

  try {
    rows = await listTranslations();
  } catch {
    error =
      "Impossible de lire le journal — la base Postgres est-elle connectée (variable DATABASE_URL) ?";
  }

  return (
    <div className="shell">
      <header className="bar">
        <span className="wordmark">Journal</span>
        <p className="label">{rows.length} entrées</p>
      </header>

      <main className="main">
        {error && (
          <section className="band">
            <p className="notice small">{error}</p>
          </section>
        )}

        {!error && rows.length === 0 && (
          <section className="band">
            <p className="body small">Aucune requête enregistrée pour l'instant.</p>
          </section>
        )}

        {rows.map((row) => (
          <section key={row.id} className="band">
            <BandHead
              title={new Date(row.created_at).toLocaleString("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
            <p className="title" style={{ marginBottom: "var(--s2)" }}>
              {row.situation}
            </p>
            <p className="small" style={{ marginBottom: "var(--s1)" }}>
              Notes : {row.notes_olfactives.join(", ")}
            </p>
            <p className="small" style={{ marginBottom: "var(--s1)" }}>
              Familles : {row.familles_olfactives.join(", ")}
            </p>
            <p className="small">
              Parfums :{" "}
              {row.parfums_suggeres.length > 0
                ? row.parfums_suggeres.map((p) => `${p.marque} ${p.nom}`).join(" · ")
                : "aucun"}
            </p>
          </section>
        ))}
      </main>
    </div>
  );
}
