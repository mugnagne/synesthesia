# Synesthésie

Traducteur d'émotions en sens. V1 : décrire une situation aimée et précise (ex. *"la rentrée
des classes quand on a 8 ans"*) → obtenir des émotions et des notes olfactives, prêtes à copier-
coller dans un moteur de recherche de parfums par notes.

## Comment ça marche

1. L'utilisateur décrit une situation dans le formulaire.
2. `app/api/translate/route.ts` envoie la description à Claude (`claude-opus-5` par défaut), avec
   un prompt système (`lib/prompt.ts`) qui lui demande de décoder la scène en émotions puis de
   retraduire ses odeurs concrètes en notes de parfumerie reconnues.
3. La réponse est contrainte par un schéma Zod (`lib/schema.ts`) via les sorties structurées de
   l'API Claude (`output_config.format`) : émotions, notes olfactives, familles olfactives, récit.
4. Le front (`app/page.tsx`) affiche le résultat et permet de copier la liste de notes.

## Pourquoi pas une intégration directe à Fragrantica ?

Le moteur "recherche par notes" de Fragrantica est piloté en JavaScript côté client (pas d'URL
stable à construire), et Fragrantica n'expose pas d'API publique. Scraper leur HTML pose un
problème de robustesse (page fragile) et de conditions d'utilisation pour un service en
production. Pour cette v1, l'app se contente donc de produire la liste de notes à coller
soi-même dans leur recherche — aucun scraping, aucune dépendance fragile. Une intégration plus
poussée (scraping léger, base de données maison, ou lien direct vers des fiches parfum) est
prévue pour une itération suivante.

## Lancer le projet en local

```bash
npm install
cp .env.example .env.local   # puis renseigner ANTHROPIC_API_KEY
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Prochaines étapes possibles

- Scraper/constituer une base de parfums taguée par notes, pour proposer des parfums précis
  (et pas seulement une liste de notes à chercher soi-même).
- Étendre la traduction à d'autres sens : couleurs, moodboards, textures, vêtements.
- Historique des traductions, comptes utilisateurs, partage de résultats.
- Déploiement en SaaS hébergé (ex. Vercel pour le front/API + variable d'env pour la clé
  Anthropic côté serveur uniquement — jamais exposée au client).
