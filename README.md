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

Pour cette v1, on a choisi la seconde option (gratuite, immédiate) :
`scripts/generate-perfumes.ts` interroge Claude (`claude-sonnet-5` par défaut, cf.
`lib/perfumeBrands.ts` pour la liste des ~50 maisons couvertes) marque par marque, avec des
sorties structurées, et écrit le résultat dans `data/perfumes.json`. Limite connue : fiable sur
les parfums connus des grandes maisons, moins fiable sur le très niche (risque d'hallucination du
modèle sur des notes précises). Si le produit prend, migrer vers un jeu de données licencié
(comme FragDB) est le prochain palier de qualité.

Lancer la génération (consomme du crédit API — voir le coût dans les logs du script) :

```bash
ANTHROPIC_API_KEY=... npm run generate:perfumes
```

Ou via GitHub Actions : onglet *Actions* → *Generate perfume database* → *Run workflow* (nécessite
un secret de repo `ANTHROPIC_API_KEY`, séparé de celui configuré sur Vercel). Le script est
idempotent : une interruption ne fait perdre que la marque en cours de génération.

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
