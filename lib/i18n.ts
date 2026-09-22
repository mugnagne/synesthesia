export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];

// Ne couvre que l'habillage de l'interface. La génération (émotions, notes,
// récit) reste en français quelle que soit la langue choisie ici : le moteur
// de correspondance (lib/match.ts) compare les notes de la situation à celles
// de data/perfumes.json, qui sont toutes en français — traduire la sortie du
// modèle casserait ce matching. Un vrai mode bilingue de bout en bout
// demanderait un second pipeline de correspondance, hors de portée ici.
const fr = {
  heroCta: "Traduire une situation",
  formIntro: "Une situation précise entre. Des notes de parfumerie et des parfums réels sortent.",
  describeLabel: "Décrivez la scène",
  genreLabel: "Genre",
  genreOptions: { tout: "Tout", homme: "Homme", femme: "Femme", mixte: "Unisexe" },
  nicheLabel: "Mode Niche",
  nicheHint: "Écarte les cinq maisons les plus connues des résultats.",
  submit: "Traduire",
  submitting: "Traduction en cours",
  situationIndexTitle: "Situation",
  indexBandTitle: "Index",
  index: [
    ["002", "Émotions", "Ce que la scène contient, et à quelle intensité."],
    ["003", "Notes olfactives", "La même scène en vocabulaire de parfumeur."],
    ["004", "Familles", "Les accords qui correspondent."],
    ["005", "Parfums", "Les entrées les plus proches dans la base."],
    ["006", "Le lien", "Pourquoi ces notes pour cette scène."],
  ] as [string, string, string][],
  loadingBandTitle: "Lecture",
  errorBandTitle: "Incident",
  emotionsBandTitle: "Émotions",
  notesBandTitle: "Notes olfactives",
  copy: "Copier la liste",
  copied: "Copié",
  fragranticaLink: "Chercher ces notes sur Fragrantica",
  famillesBandTitle: "Familles",
  parfumsBandTitle: "Parfums",
  sharedNotes: "En commun :",
  noMatch:
    "Aucun parfum de la base ne partage assez de notes avec cette situation. La liste du bloc 003 reste utilisable pour chercher plus large.",
  linkBandTitle: "Le lien",
  footerCatalogue: (perfumeCount: number, brandCount: number) =>
    `${perfumeCount} parfums, ${brandCount} maisons`,
  errorGeneric: "Une erreur est survenue.",
  errorNetwork: "Impossible de contacter le serveur.",
  errorClipboard:
    "Le navigateur a refusé l'accès au presse-papier. Les notes restent lisibles ci-dessus.",
  gameInstructions: "MAINTIENS ESPACE OU TAPOTE",
  gameScore: "SCORE",
  gameOver: "GAME OVER",
};

const en: typeof fr = {
  heroCta: "Translate a situation",
  formIntro: "A precise situation goes in. Perfumery notes and real perfumes come out.",
  describeLabel: "Describe the scene",
  genreLabel: "Gender",
  genreOptions: { tout: "All", homme: "Men", femme: "Women", mixte: "Unisex" },
  nicheLabel: "Niche mode",
  nicheHint: "Drops the five best-known houses from the results.",
  submit: "Translate",
  submitting: "Translating",
  situationIndexTitle: "Situation",
  indexBandTitle: "Index",
  index: [
    ["002", "Emotions", "What the scene contains, and how intensely."],
    ["003", "Fragrance notes", "The same scene in a perfumer's vocabulary."],
    ["004", "Families", "The accords that match."],
    ["005", "Perfumes", "The closest entries in the database."],
    ["006", "The thread", "Why these notes for this scene."],
  ],
  loadingBandTitle: "Reading",
  errorBandTitle: "Incident",
  emotionsBandTitle: "Emotions",
  notesBandTitle: "Fragrance notes",
  copy: "Copy the list",
  copied: "Copied",
  fragranticaLink: "Search these notes on Fragrantica",
  famillesBandTitle: "Families",
  parfumsBandTitle: "Perfumes",
  sharedNotes: "Shared:",
  noMatch:
    "None of the perfumes in the database share enough notes with this situation. The list in block 003 still works for a broader search.",
  linkBandTitle: "The thread",
  footerCatalogue: (perfumeCount: number, brandCount: number) =>
    `${perfumeCount} perfumes, ${brandCount} houses`,
  errorGeneric: "Something went wrong.",
  errorNetwork: "Couldn't reach the server.",
  errorClipboard: "The browser refused clipboard access. The notes are still readable above.",
  gameInstructions: "HOLD SPACE OR TAP",
  gameScore: "SCORE",
  gameOver: "GAME OVER",
};

export const STRINGS: Record<Locale, typeof fr> = { fr, en };
