# Adriano Web

Base du projet de jeu construite avec [Next.js](https://nextjs.org/), TypeScript et l'App Router.

Le projet nécessite Node.js 20.9 ou une version ultérieure.

## Démarrage

Installez les dépendances puis lancez le serveur de développement :

```bash
npm install
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Jeu

La V1 propose une partie complète en sept manches contre trois bots : pioche et fosse, échanges, combinaisons, pouvoirs des cartes 3, 7, 8 et 9, annonce ADRIANO et cumul des scores. Les règles officielles et les cas de score sont documentés dans [`docs/RULES.md`](docs/RULES.md).

## Commandes

- `npm run dev` lance le serveur de développement.
- `npm run check:conflicts` vérifie qu'aucun marqueur de conflit Git ne subsiste.
- `npm run build` crée une version de production.
- `npm start` démarre la version de production.
- `npm run lint` analyse le code avec ESLint.
- `npm run typecheck` vérifie le code TypeScript utilisé par la production.
- `npm test` exécute les tests du moteur de jeu.
