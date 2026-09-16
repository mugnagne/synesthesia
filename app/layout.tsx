import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synesthésie",
  description: "Traduis une situation que tu aimes en notes de parfum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
