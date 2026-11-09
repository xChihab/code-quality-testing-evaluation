# Code Quality & Testing Evaluation

Petite application e-commerce (frontend React + backend Express/SQLite) servant de support à la mise en place
d'outils modernes de qualité de code : Prettier, ESLint, Jest, Husky/lint-staged et Lighthouse CI, avec un workflow Git
strict.

Les consignes originales du projet sont conservées dans [`docs/guide.md`](docs/guide.md). L'avancement par rapport à
ces consignes est suivi dans la section [Avancement du projet](#avancement-du-projet).

## Sommaire

- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Démarrage](#démarrage)
- [Scripts disponibles](#scripts-disponibles)
- [Qualité de code : Prettier et ESLint](#qualité-de-code--prettier-et-eslint)
- [Tests et couverture](#tests-et-couverture)
- [Hooks Git](#hooks-git)
- [Performance : Lighthouse CI](#performance--lighthouse-ci)
- [Référence de l'API](#référence-de-lapi)
- [Workflow Git](#workflow-git)
- [Limites connues](#limites-connues)
- [Avancement du projet](#avancement-du-projet)

## Stack technique

| Partie   | Technologies                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Frontend | TypeScript, React 18, React Router 6, Axios, Tailwind CSS 3, Create React App (`react-scripts`)                     |
| Backend  | TypeScript, Node.js, Express 5, SQLite (`sqlite3`), JWT (`jsonwebtoken`), `bcryptjs`                                |
| Outils   | npm workspaces, Prettier, ESLint, Jest, ts-jest, tsx, Testing Library, Supertest, Husky, lint-staged, Lighthouse CI |

## Structure du projet

```
.
├── .husky/                  # Hooks Git (pre-commit, pre-push)
├── docs/
│   └── guide.md             # Consignes originales du projet
├── packages/
│   ├── backend/             # API Express (port 3001)
│   │   ├── src/
│   │   │   ├── controllers/ # Gestionnaires des routes (+ __tests__)
│   │   │   ├── db/          # Connexion SQLite et migrations (+ __tests__)
│   │   │   ├── middleware/  # Authentification JWT (+ __tests__)
│   │   │   ├── routes/      # Routeurs Express (+ __tests__)
│   │   │   ├── server.ts    # Point d'entrée de l'application
│   │   │   └── testSetup.ts # Base de données temporaire pour chaque exécution de Jest
│   │   ├── eslint.config.js
│   │   ├── jest.config.js   # Jest + ts-jest
│   │   ├── tsconfig.json    # Vérification des types (sources + tests)
│   │   ├── tsconfig.build.json # Compilation vers dist/ (sans les tests)
│   │   └── .lintstagedrc.json
│   └── frontend/            # Application React (port 3000)
│       ├── src/
│       │   ├── components/  # Navigation, ErrorBoundary, LoadingSpinner (+ __tests__)
│       │   ├── hooks/       # useApi, useAuth (+ __tests__)
│       │   ├── pages/       # Login, Register, ProductList, AddProduct, UserList (+ __tests__)
│       │   ├── services/    # Client de l'API (+ __tests__)
│       │   ├── utils/       # Fonctions de formatage et de validation (+ __tests__)
│       │   └── types.ts     # Types partagés (User, Product, ApiError)
│       ├── eslint.config.js
│       ├── tailwind.config.js # Fichiers scannés par Tailwind
│       ├── tsconfig.json
│       └── .lintstagedrc.json
├── .lighthouserc.json       # Configuration et seuils de Lighthouse CI
├── .prettierrc              # Configuration Prettier commune
├── .prettierignore
├── .lintstagedrc.json       # Tâches lint-staged pour les fichiers à la racine
└── package.json             # Workspaces et scripts racine
```

## Démarrage

### Prérequis

- Node.js 18 ou plus récent
- npm 8 ou plus récent (support des workspaces)

### Installation

```bash
git clone https://github.com/xChihab/code-quality-testing-evaluation.git
cd code-quality-testing-evaluation
npm install
```

`npm install` installe les dépendances des deux packages et lance le script `prepare`, qui active les hooks Git
Husky.

### Lancer l'application

```bash
npm run dev
```

- Frontend : <http://localhost:3000>
- API backend : <http://localhost:3001/api>

Au premier démarrage, le backend crée `packages/backend/src/database.sqlite` et y insère trois produits d'exemple ainsi
qu'un compte par défaut : **identifiant `admin` / mot de passe `admin123`**. Le fichier de base de données est ignoré
par Git.

### Variables d'environnement (backend)

| Variable  | Valeur par défaut                      | Description              |
| --------- | -------------------------------------- | ------------------------ |
| `PORT`    | `3001`                                 | Port du serveur de l'API |
| `DB_PATH` | `packages/backend/src/database.sqlite` | Chemin de la base SQLite |

## Scripts disponibles

À lancer depuis la racine du dépôt :

| Script                  | Description                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`           | Lance le backend avec `tsx watch` et le serveur de développement du frontend     |
| `npm start`             | Compile le backend (`tsc`) puis le lance avec `node`, et lance le frontend       |
| `npm test`              | Lance les suites de tests Jest des deux packages                                 |
| `npm run test:coverage` | Lance les tests avec rapports de couverture et vérifie les seuils                |
| `npm run lint`          | Analyse les deux packages avec ESLint                                            |
| `npm run lint:fix`      | Analyse et corrige automatiquement ce qui peut l'être                            |
| `npm run format`        | Formate tout le dépôt avec Prettier                                              |
| `npm run format:check`  | Vérifie le formatage sans modifier les fichiers                                  |
| `npm run lighthouse`    | Lance un audit Lighthouse CI (voir [Lighthouse CI](#performance--lighthouse-ci)) |

Un seul package peut être ciblé avec `--workspace`, par exemple `npm run test --workspace=backend` ou
`npm run build --workspace=frontend` (build de production de l'application React).

Chaque package expose aussi `npm run typecheck` (`tsc --noEmit`, mode `strict`), par exemple
`npm run typecheck --workspace=backend`.

## Qualité de code : Prettier et ESLint

### Prettier

Configuration commune dans [`.prettierrc`](.prettierrc) :

| Option          | Valeur | Exigence                 |
| --------------- | ------ | ------------------------ |
| `singleQuote`   | `true` | Guillemets simples       |
| `trailingComma` | `none` | Pas de virgule finale    |
| `tabWidth`      | `2`    | Indentation de 2 espaces |
| `printWidth`    | `120`  | 120 caractères par ligne |

Les fichiers générés (`package-lock.json`, `coverage`, `build`, `.lighthouseci`) sont exclus dans
[`.prettierignore`](.prettierignore).

### ESLint

Chaque package a sa propre configuration au format « flat config » (`eslint.config.js`) :

| Package  | ESLint | Plugins                                                                                                                                  |
| -------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | 8.57   | `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-plugin-perfectionist`, `eslint-plugin-tailwindcss` |
| Backend  | 10     | `eslint-plugin-n`, `eslint-plugin-unicorn`, `eslint-plugin-perfectionist`                                                                |

Le frontend reste sur ESLint 8 car `react-scripts` 5 en dépend ; le backend utilise la dernière version majeure.
Les deux configurations utilisent le parser de `typescript-eslint` pour analyser les fichiers `.ts`/`.tsx`.

Côté frontend, `eslint-plugin-tailwindcss` applique les règles recommandées, passées en erreur pour bloquer le commit :
ordre des classes, raccourcis (`size-full` plutôt que `h-full w-full`…) et classes inexistantes dans la configuration
Tailwind (`no-custom-classname`). L'ordre des classes se corrige automatiquement avec `npm run lint:fix`.

**Faire cohabiter Prettier et ESLint :** les deux configurations intègrent les règles de `eslint-config-prettier`,
qui désactive toutes les règles ESLint en conflit avec Prettier. ESLint s'occupe de la qualité du code (bugs, règles
des hooks React, accessibilité, ordre des imports), Prettier uniquement de la mise en forme.

## Tests et couverture

Jest est configuré dans les deux packages :

- **Backend** ([`jest.config.js`](packages/backend/jest.config.js)) : environnement Node, `ts-jest` pour exécuter les
  tests TypeScript (avec vérification des types), Supertest pour les tests d'intégration HTTP. `src/testSetup.ts` fait pointer `DB_PATH` vers un fichier SQLite temporaire à chaque exécution :
  les tests ne touchent jamais la base de développement.
- **Frontend** (clé `jest` du [`package.json`](packages/frontend/package.json)) : lancé via `react-scripts test` avec
  Testing Library ; les appels à l'API sont mockés.

| Partie   | Ce qui est testé                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend  | Contrôleurs (unitaires), endpoints de l'API (intégration), module de base de données, middleware d'authentification                                |
| Frontend | Tous les composants et pages, formulaires (connexion, inscription, ajout de produit), hooks, service API, utilitaires, parcours d'authentification |

### Seuils de couverture

Vérifiés dans les deux packages par `npm run test:coverage` (la commande échoue en dessous de ces valeurs) :

| Métrique                  | Minimum |
| ------------------------- | ------- |
| Instructions (statements) | 80 %    |
| Branches                  | 60 %    |
| Fonctions                 | 70 %    |
| Lignes                    | 80 %    |

Les rapports HTML sont générés dans `packages/<package>/coverage/lcov-report/index.html` (ignorés par Git).

## Hooks Git

Les hooks sont gérés par [Husky](https://typicode.github.io/husky/) et installés automatiquement par `npm install`.

| Hook         | Commande                | Rôle                                                                                |
| ------------ | ----------------------- | ----------------------------------------------------------------------------------- |
| `pre-commit` | `npx lint-staged`       | Lance ESLint (`--fix`), Prettier et les tests Jest liés aux fichiers indexés        |
| `pre-push`   | `npm run test:coverage` | Lance toute la suite de tests des deux packages et vérifie les seuils de couverture |

[lint-staged](https://github.com/lint-staged/lint-staged) utilise une configuration par package, pour que chaque
fichier soit vérifié avec la version d'ESLint et la configuration Jest de son propre package :

| Fichier de configuration               | Fichiers                                    | Tâches                                                                        |
| -------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| `packages/backend/.lintstagedrc.json`  | `src/**/*.ts`                               | `eslint --fix` → `prettier --write` → `jest --findRelatedTests`               |
| `packages/frontend/.lintstagedrc.json` | `src/**/*.{ts,tsx}`                         | `eslint --fix` → `prettier --write` → `react-scripts test --findRelatedTests` |
| les deux packages                      | `*.{json,md}` (+ css/html dans le frontend) | `prettier --write`                                                            |
| `.lintstagedrc.json` (racine)          | `*.{json,md}`                               | `prettier --write`                                                            |

Le fichier `.gitattributes` force les fins de ligne LF dans `.husky/` pour que les hooks fonctionnent aussi sous
Windows.

## Performance : Lighthouse CI

[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) audite le frontend servi sur `http://localhost:3000`.

```bash
# Terminal 1 : lancer l'application
npm run dev

# Terminal 2 : lancer l'audit
npm run lighthouse
```

L'audit échoue si une catégorie est sous son seuil (configuré dans [`.lighthouserc.json`](.lighthouserc.json)) :

| Catégorie        | Score minimum |
| ---------------- | ------------- |
| Performance      | 80            |
| Accessibilité    | 100           |
| Bonnes pratiques | 90            |
| SEO              | 80            |

Les rapports sont envoyés sur le stockage public temporaire de Lighthouse (le lien est affiché dans le terminal) et
conservés localement dans `.lighthouseci/` (ignoré par Git). Le serveur de développement n'est pas optimisé : pour des
scores de performance représentatifs, il faut auditer un build de production (`npm run build --workspace=frontend`)
servi de manière statique.

## Référence de l'API

URL de base : `http://localhost:3001/api`. Les routes marquées 🔒 nécessitent un en-tête
`Authorization: Bearer <token>` ; le token est renvoyé par `register` et `login` et reste valide 24 heures.

| Méthode | Route                     | Auth | Description                                                           |
| ------- | ------------------------- | ---- | --------------------------------------------------------------------- |
| `POST`  | `/auth/register`          |      | Crée un utilisateur (`username`, `password`, `firstname`, `lastname`) |
| `POST`  | `/auth/login`             |      | Renvoie un JWT et le profil de l'utilisateur                          |
| `GET`   | `/auth/users`             | 🔒   | Liste les utilisateurs (sans les mots de passe)                       |
| `GET`   | `/auth/similar-usernames` | 🔒   | Liste les paires de noms d'utilisateur similaires                     |
| `GET`   | `/products`               | 🔒   | Liste les produits                                                    |
| `POST`  | `/products`               | 🔒   | Crée un produit (`name`, `price`, `stock`)                            |
| `GET`   | `/products/:id`           | 🔒   | Renvoie un produit                                                    |
| `PATCH` | `/products/:id/stock`     | 🔒   | Met à jour le stock d'un produit                                      |

## Workflow Git

- `main` est protégée : toute modification passe par une pull request.
- Une branche par fonctionnalité ou correctif :
  - `feature/<nom-de-la-fonctionnalite>` pour les fonctionnalités (ex. `feature/testing-setup`)
  - `fix/<description-du-probleme>` pour les correctifs (ex. `fix/generate-files-are-push-in-git`)
- Avant d'ouvrir une pull request, on merge la dernière version de `main` dans la branche et on résout les conflits en
  local.
- Les messages de commit suivent [Conventional Commits](https://www.conventionalcommits.org/fr/) :

```
<type>[scope optionnel]: <description>
```

Types autorisés : `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`. Exemples tirés de ce
dépôt :

```
ci(hooks): run lint-staged tasks per workspace
test(backend): isolate tests from local sqlite database
fix(db): await sqlite schema and seed writes
```

## Limites connues

L'application a été reprise « en l'état » et contient encore des problèmes, prévus comme branches `fix/` séparées :

- Le secret JWT est écrit en dur dans le backend au lieu d'être lu depuis une variable d'environnement.
- CORS accepte toutes les origines (`origin: '*'`).
- Un middleware de journalisation garde en mémoire, sans limite, toutes les requêtes (en-têtes et tokens compris).
- L'URL de l'API côté frontend (`http://localhost:3001/api`) est écrite en dur.

## Avancement du projet

### Exigences Git

- [x] Branche `main` protégée, modifications intégrées par pull requests
- [x] Branches `feature/eslint-prettier-setup`, `feature/testing-setup`, `feature/git-hooks`, `feature/lighthouse-ci`
- [x] Conventional Commits

### Exigences principales

- [x] Prettier (guillemets simples, pas de virgule finale, 2 espaces, 120 caractères)
- [x] ESLint frontend : `react`, `react-hooks`, `perfectionist`, `jsx-a11y`
- [x] ESLint backend : `n`, `unicorn`, `perfectionist`
- [x] Prettier et ESLint compatibles (`eslint-config-prettier`)
- [x] Husky et lint-staged
- [x] Hook pre-commit : ESLint, Prettier, tests Jest liés
- [x] Hook pre-push : suite de tests complète et seuils de couverture
- [x] Jest configuré pour les deux packages
- [x] Seuils de couverture (80 % instructions, 60 % branches, 70 % fonctions, 80 % lignes)
- [x] Tests frontend : composants, formulaires, appels API mockés, parcours d'authentification
- [x] Tests backend : contrôleurs, endpoints de l'API, base de données, middleware d'authentification
- [x] Lighthouse CI avec script npm et seuils de score

### Bonus

- [x] Tailwind CSS (styles inline remplacés par des classes utilitaires)
- [x] Plugin ESLint pour Tailwind
- [ ] Design system, responsive, mode sombre
- [x] TypeScript (backend et frontend, mode `strict`)
- [ ] Plugins ESLint pour TypeScript
- [ ] Error boundaries, gestion d'état, système de logs, gestion des variables d'environnement
- [ ] Catégories de produits, recherche, tri/filtrage, pagination, rôles utilisateurs
