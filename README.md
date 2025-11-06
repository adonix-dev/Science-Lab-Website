# Lab – Visualisations quantiques interactives

Bienvenue sur **Lab**, un laboratoire numérique qui illustre les phénomènes incontournables de la physique quantique. Le site est conçu pour être ouvert simplement en double-cliquant sur `index.html` et fonctionne intégralement en HTML/CSS/JavaScript sans serveur.

## 🚀 Démarrage

1. Clonez ou téléchargez le dépôt.
2. Ouvrez le fichier `index.html` dans votre navigateur favori (Chrome, Firefox, Edge…).
3. Naviguez entre les expériences depuis la grille d’accueil.

> 💡 **Astuce** : certains navigateurs limitent le chargement des fichiers `JSON` en mode `file://`. Si les cartes ne s’affichent pas, lancez un petit serveur statique (`python -m http.server`) depuis la racine du projet. Un jeu de données de secours est intégré côté client pour garantir le fonctionnement hors ligne.

## 🧱 Structure du projet

```
.
├── index.html
├── experiments/
│   ├── effet-photoelectrique.html
│   ├── effet-tunnel.html
│   ├── fentes-de-young.html
│   ├── inegalites-bell.html
│   ├── intrication.html
│   ├── mach-zehnder.html
│   └── stern-gerlach.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── utils/
│   │   └── event-bus.js
│   └── agents/
│       ├── agent-animation.js
│       ├── agent-data.js
│       ├── agent-interface.js
│       ├── agent-logger.js
│       ├── agent-physics.js
│       ├── agent-theme.js
│       └── agent-ui.js
├── data/
│   ├── phenomenes.json
│   └── phenomenes-inline.js
├── assets/
├── README.md
└── AGENTS.md
```

## 🧠 Architecture orientée agents

Le cœur de l’application repose sur un **EventBus** minimaliste (`js/utils/event-bus.js`). Chaque module spécialisé écoute les événements dont il a besoin et publie ceux qu’il émet :

- **AgentData** charge `data/phenomenes.json` et fournit les contenus des expériences (avec un fallback embarqué pour le mode hors ligne).
- **AgentInterface** construit l’accueil, applique le filtrage et alimente les pages expériences.
- **AgentAnimation** orchestre les animations p5.js dédiées à chaque phénomène.
- **AgentPhysics** propose des helpers mathématiques pour les visualisations.
- **AgentUI** génère les contrôles (curseurs) et relaie les interactions utilisateurs.
- **AgentTheme** applique le thème sombre et les couleurs d’accent.
- **AgentLogger** trace les événements pour faciliter le debug.

Le fichier `js/main.js` instancie ces agents et lance la séquence d’initialisation.

## 🎨 Expériences et contrôles

Chaque page de la section `experiments/` charge dynamiquement son contenu depuis le JSON et installe une visualisation p5.js. Les curseurs situés sous l’animation vous permettent de modifier les paramètres essentiels : énergie et barrière pour l’effet tunnel, phase pour Mach-Zehnder, angles des polariseurs pour l’intrication, etc.

Le bloc “Pour aller plus loin” contient l’extrait universitaire du PDF source et peut être replié/affiché à volonté.

## ➕ Ajouter un nouveau phénomène

1. Ajouter un objet dans `data/phenomenes.json` avec les clés `id`, `titre`, `resume`, `universitaire`, `animation`.
2. Créer une page `experiments/<id>.html` en copiant l’un des templates existants et en adaptant l’attribut `data-experiment-id`.
3. Définir l’animation dans `js/agents/agent-animation.js` :
   - Ajouter une entrée dans `createAnimationDefinitions()` avec `initialState`, `controls` et `sketch` p5.js.
   - Exposer les paramètres nécessaires via `controls` pour que l’UI génère automatiquement les curseurs.
4. Mettre à jour le fallback `data/phenomenes-inline.js` pour garantir la cohérence hors ligne.

Une fois ces étapes terminées, l’expérience apparaîtra automatiquement sur la page d’accueil et sera entièrement fonctionnelle.

Bonnes explorations quantiques !
