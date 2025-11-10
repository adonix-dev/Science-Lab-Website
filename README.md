# Lab – Visualisations quantiques interactives

Bienvenue sur **Lab**, un laboratoire numérique qui illustre les phénomènes incontournables de la physique quantique. Le site
fonctionne intégralement en HTML/CSS/JavaScript et peut être ouvert en double-cliquant sur `index.html`.

## 🚀 Démarrage

1. Clonez ou téléchargez le dépôt.
2. Ouvrez `index.html` dans votre navigateur (Chrome, Firefox, Safari…).
3. Cliquez sur une carte pour explorer une expérience : l’écran bascule en mode détail sans recharger la page.

> 💡 **Chargement local** : certains navigateurs bloquent `fetch` sur des fichiers `JSON` en mode `file://`. Si les expériences
> ne se chargent pas, démarrez un mini-serveur (`python -m http.server`) depuis la racine du projet. Un jeu de données de secours
> est néanmoins embarqué pour un usage hors ligne.

## 🧱 Structure du projet

```
.
├── index.html                # Vue unique (accueil + expérience) gérée en SPA
├── experiments/              # Descripteurs JSON de chaque phénomène
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
│   └── agents/               # Agents métiers (données, interface, animations…)
├── AGENTS.md                 # Règles d’architecture orientée agents
└── README.md
```

## 🧠 Architecture orientée agents

Le cœur de l’application repose sur un **EventBus** (`js/utils/event-bus.js`). Chaque agent reste autonome et communique en
publiant/écoutant des événements :

- **DataAgent** charge `data/phenomenes.json`, gère le cache des fichiers JSON dans `experiments/` et bascule sur
  `phenomenes-inline.js` si nécessaire.
- **InterfaceAgent** construit la page d’accueil, gère la recherche, orchestre la bascule vers la vue détail (SPA) et déclenche
  le montage de l’animation.
- **AnimationAgent** compile et instancie les sketches p5.js décrits directement dans les fichiers JSON (champ `animation.sketch`).
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
    "description": "Phrase affichée sous le titre",
    "controls": [
      { "id": "energy", "label": "Énergie", "type": "range", "min": 0.1, "max": 1, "step": 0.01, "value": 0.4 }
    ],
    "parameters": {
      "speed": 0.9
    },
    "sketch": {
      "library": "p5",
      "code": "(() => {\\n  return {\\n    setup({ state }) { state.time = 0; },\\n    draw({ p, state }) { /* … */ }\\n  };\\n})()"
    }
  }
}
```

- Le champ `animation.controls` décrit les paramètres exposés dans l’UI (curseurs, interrupteurs…).
- Le champ `animation.parameters` fournit des constantes au sketch.
- Le champ `animation.sketch.code` contient le code JavaScript (sous forme de chaîne) retournant un objet compatible p5.js.

L’interface génère automatiquement la vue détail à partir de ces données : explication vulgarisée, encadré “Pour aller plus loin”,
visualisation et contrôles.

## ➕ Ajouter un nouveau phénomène

1. Dupliquez un fichier dans `experiments/` et adaptez les champs (`id`, `title`, textes, contrôles…). Le code p5.js doit être
   retourné par `animation.sketch.code` (cf. exemples existants).
2. Ajoutez les métadonnées associées dans `data/phenomenes.json` (`id`, `title`, `summary`, `icon`, `tags`, `path`).
3. Relancez le script de fallback si nécessaire (`python - <<'PY' …` voir `data/phenomenes-inline.js`) ou copiez le nouveau JSON dans
   `data/phenomenes-inline.js` pour garantir un fonctionnement hors ligne.

Aucune page HTML supplémentaire n’est nécessaire : la navigation entre accueil et expériences est gérée côté client.

Bonnes explorations quantiques !
