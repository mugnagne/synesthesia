import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl ? `https://${productionUrl}` : "http://localhost:3000"),
  title: "Synesthésie, traducteur de situations en notes de parfum",
  description:
    "Décrivez une situation précise que vous aimez. Synesthésie en extrait les émotions, les traduit en notes de parfumerie et propose des parfums réels qui les portent.",
  openGraph: {
    title: "Synesthésie",
    description:
      "Une situation précise entre, des notes de parfumerie et des parfums réels sortent.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${mono.variable}`}>
      <body>
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
