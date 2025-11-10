# Lab – Visualisations quantiques interactives

Bienvenue sur **Lab**, un laboratoire numérique qui illustre les phénomènes incontournables de la physique quantique. Le site fonctionne intégralement en HTML/CSS/JavaScript et peut être ouvert en double-cliquant sur `index.html`.

## 🚀 Démarrage

1. Clonez ou téléchargez le dépôt.
2. Ouvrez `index.html` dans votre navigateur (Chrome, Firefox, Safari…).
3. Cliquez sur une carte pour accéder à l’expérience correspondante.

> 💡 **Chargement local** : certains navigateurs bloquent `fetch` sur des fichiers `JSON` en mode `file://`. Si les expériences ne se chargent pas, démarrez un mini-serveur (`python -m http.server`) depuis la racine du projet. Un jeu de données de secours est néanmoins embarqué pour un usage hors ligne.

## 🧱 Structure du projet

```
.
├── index.html                # Page d’accueil (grille + recherche)
├── experiment.html           # Modèle unique pour toutes les expériences
├── experiments/              # Données de chaque phénomène au format JSON
│   ├── effet-tunnel.json
│   ├── fentes-de-young.json
│   ├── …
├── css/
│   └── style.css             # Thème sombre et mise en page responsive
├── data/
│   ├── phenomenes.json       # Liste des expériences (métadonnées + chemins JSON)
│   └── phenomenes-inline.js  # Fallback embarqué (liste + contenus détaillés)
├── js/
│   ├── main.js               # Bootstrap de l’application
│   ├── utils/event-bus.js    # Bus d’événements minimaliste
│   ├── agents/               # Agents métiers (données, interface, animations…)
│   └── animations/           # Sketches p5.js modulaires
├── AGENTS.md                 # Règles d’architecture orientée agents
└── README.md
```

## 🧠 Architecture orientée agents

Le cœur de l’application repose sur un **EventBus** (`js/utils/event-bus.js`). Chaque agent reste autonome et communique en publiant/écoutant des événements :

- **DataAgent** charge `data/phenomenes.json`, gère le cache des fichiers JSON dans `experiments/` et bascule sur `phenomenes-inline.js` si nécessaire.
- **InterfaceAgent** construit la page d’accueil, gère la recherche, installe la page d’expérience générique et déclenche le montage de l’animation.
- **AnimationAgent** instancie les sketches p5.js correspondants (`js/animations/`) et réagit aux curseurs.
- **PhysicsAgent** regroupe les fonctions de calcul (transmission tunnel, corrélation de Bell, etc.).
- **UIAgent** génère dynamiquement les contrôles (curseurs, bascules) à partir de la configuration JSON.
- **ThemeAgent** applique le thème sombre et la couleur d’accent cyan.
- **LoggerAgent** trace les interactions utiles au debug.

`js/main.js` assemble et initialise ces agents.

## 🎨 Contenu des fichiers d’expérience

Chaque expérience est décrite par un fichier JSON dans `experiments/` avec la structure suivante :

```json
{
  "id": "effet-tunnel",
  "title": "Effet tunnel",
  "icon": "🌌",
  "summary": "Résumé court utilisé sur la carte",
  "introduction": "Texte vulgarisé affiché sur la page",
  "tags": ["onde", "probabilité"],
  "further": [{ "label": "Universitaire", "content": "Texte académique" }],
  "animation": {
    "type": "tunnel",               // clé correspondant au sketch p5.js
    "description": "Phrase affichée sous le titre",
    "controls": [                     // paramètres exposés dans l’UI
      { "id": "energy", "label": "Énergie", "type": "range", "min": 0.1, "max": 1, "step": 0.01, "value": 0.4 }
    ],
    "parameters": {                   // options spécifiques transmises au sketch
      "speed": 0.9
    }
  }
}
```

La page `experiment.html` lit l’identifiant dans `?id=` et va chercher le JSON correspondant. Les sections “Niveau curieux” et “Pour aller plus loin” sont injectées à partir des champs `introduction` et `further`.

## ➕ Ajouter un nouveau phénomène

1. Créez `experiments/<id>.json` en reprenant la structure ci-dessus.
2. Ajoutez les métadonnées associées dans `data/phenomenes.json` (`id`, `title`, `summary`, `icon`, `tags`, `path`).
3. Implémentez le sketch p5.js correspondant dans `js/animations/` et exportez-le via `js/animations/index.js`.
4. Si vous souhaitez assurer le fonctionnement hors ligne, ajoutez le même contenu dans `data/phenomenes-inline.js` (section `details`).

Aucune page HTML supplémentaire n’est nécessaire : l’interface réutilise `experiment.html` pour toutes les expériences.

Bonnes explorations quantiques !
