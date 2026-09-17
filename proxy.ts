import { NextRequest, NextResponse } from "next/server";

// Basic Auth on /journal only — it shows real user submissions, so it stays
// off the public surface. JOURNAL_PASSWORD is a separate secret from
// ANTHROPIC_API_KEY, set the same way (Vercel → Settings → Environment
// Variables).
export function proxy(req: NextRequest) {
  const expected = process.env.JOURNAL_PASSWORD;
  if (!expected) {
    return new NextResponse("Journal non configuré : variable JOURNAL_PASSWORD manquante.", {
      status: 503,
    });
  }

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = atob(auth.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    const password = separatorIndex === -1 ? "" : decoded.slice(separatorIndex + 1);
    if (password === expected) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Journal"' },
  });
}

export const config = {
  matcher: "/journal",
};
