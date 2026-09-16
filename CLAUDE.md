@AGENTS.md

## Règles du projet

- **Exemple de prompt (placeholder)** : `lib/examples.ts` liste des situations d'exemple.
  À chaque version publiée (chaque push déployé), avancer `CURRENT_EXAMPLE_INDEX` d'un cran
  (en boucle sur le tableau `EXAMPLES`) pour que le placeholder du formulaire change à chaque
  fois. Ne jamais republier sans changer cet index si le code a par ailleurs changé.
