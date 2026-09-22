# Synesthésie

Traducteur d'émotions en sens. V1 : décrire une situation aimée et précise (ex. *"la rentrée
des classes quand on a 8 ans"*) → obtenir des émotions, des notes olfactives, et des suggestions
de parfums réels tirés de notre propre base.

## Comment ça marche

1. L'utilisateur décrit une situation dans le formulaire.
2. `app/api/translate/route.ts` envoie la description à Claude (`claude-opus-5` par défaut), avec
   un prompt système (`lib/prompt.ts`) qui lui demande de décoder la scène en émotions puis de
   retraduire ses odeurs concrètes en notes de parfumerie reconnues.
3. La réponse est contrainte par un schéma Zod (`lib/schema.ts`) via les sorties structurées de
   l'API Claude (`output_config.format`) : émotions, notes olfactives, familles olfactives, récit.
4. `lib/match.ts` compare ces notes/familles à `data/perfumes.json` (notre base de parfums, voir
   ci-dessous) et renvoie les meilleurs matches.
5. Le front (`app/page.tsx`) affiche le résultat, les parfums suggérés, et permet de copier la
   liste de notes pour une recherche manuelle plus large.

## La base de parfums (`data/perfumes.json`)

**On ne scrape pas Fragrantica** — leurs CGU l'interdisent explicitement (accès automatisé,
crawling, scraping tous prohibés sauf API autorisée par écrit ; ils qualifient eux-mêmes le
scraping de leur base de "contraire à la loi"). Deux options existent pour une base de données
propre : licencier un jeu de données tiers déjà construit (ex. FragDB, ~134k parfums, ~1000$/an,
licence commerciale explicite), ou générer notre propre base à partir de la connaissance
générale de Claude sur les parfums réels et leurs notes publiquement connues.

Pour cette v1, on a choisi la seconde option (gratuite, immédiate) : `data/perfumes.json`
contient actuellement **629 parfums réels sur 92 maisons**, rédigés directement à la main (par
Claude, dans une session Claude Code — donc sans consommer de crédit API séparé) plutôt que
générés en appelant l'API. Couverture volontairement inégale : dense sur les maisons de luxe et
niche (Chanel, Dior, Guerlain, Le Labo, Byredo, Serge Lutens...) où la connaissance du modèle est
fiable, plus légère sur le grand public/célébrités (quelques flagships connus seulement), et
volontairement absente sur la plupart des marques "dupe"/moyen-orientales dont je ne connais pas
le catalogue avec assez de précision pour ne pas inventer. Si le produit prend, migrer vers un
jeu de données licencié (comme FragDB) est le prochain palier de qualité et de couverture.

`scripts/generate-perfumes.ts` (et le workflow GitHub Actions associé) restent disponibles comme
méthode alternative pour étoffer la base via l'API Anthropic si on veut automatiser une montée en
volume plus tard — mais pour l'instant, la voie la plus simple pour l'étoffer reste de redemander
à Claude (dans une session comme celle-ci) d'ajouter des marques/parfums à `data/perfumes.json`.

## Le journal (`/journal`)

Chaque traduction réussie est enregistrée (situation, notes, familles, récit, parfums suggérés)
via `lib/db.ts` — Postgres (Neon, l'intégration native de Vercel), écriture non bloquante après
l'envoi de la réponse (`after()` de Next.js) pour ne jamais ralentir ni casser la traduction si la
base est indisponible. `/journal` liste les entrées les plus récentes, protégée par Basic Auth
(variable `JOURNAL_PASSWORD`) puisqu'elle affiche ce que de vraies personnes ont tapé.

Mise en place (deux variables d'env, séparées de celles de l'app principale) :
1. Vercel → *Storage* → *Create Database* → Postgres (Neon) → connecter au projet. Ça injecte
   automatiquement `DATABASE_URL`.
2. Vercel → *Settings* → *Environment Variables* → ajouter `JOURNAL_PASSWORD` (n'importe quel
   nom d'utilisateur passe l'auth Basic, seul le mot de passe est vérifié).

Sans ces deux variables, le reste du site fonctionne normalement — seul `/journal` répond
503/erreur, et les traductions ne sont simplement pas journalisées.

## Lancer le projet en local

```bash
npm install
cp .env.example .env.local   # puis renseigner ANTHROPIC_API_KEY
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Prochaines étapes possibles

- Migrer vers un jeu de données licencié (FragDB ou équivalent) une fois le produit validé, pour
  une base plus large et plus fiable que la génération LLM.
- Étendre la traduction à d'autres sens : couleurs, moodboards, textures, vêtements.
- Historique des traductions, comptes utilisateurs, partage de résultats.
- Déploiement en SaaS hébergé (ex. Vercel pour le front/API + variable d'env pour la clé
  Anthropic côté serveur uniquement — jamais exposée au client).
