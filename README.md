# Lab — Expérimentez les limites du réel

Ce dépôt contient la version statique du site [lab.antonylaget.com](https://lab.antonylaget.com) présentant plusieurs expériences de physique quantique à travers des animations interactives.

## Démarrage rapide

Aucun serveur n’est requis : tous les fichiers sont statiques. Clonez ou téléchargez le dépôt puis ouvrez les fichiers directement dans votre navigateur.

```bash
# clone le dépôt
git clone https://github.com/antonylaget/lab.git
cd lab

# ouvrir la page d’accueil dans le navigateur
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Les pages d’expériences sont accessibles dans le dossier `experiments/`. Chaque page charge dynamiquement son contenu depuis `data/phenomenes.json`.

## Structure

```
.
├── index.html
├── experiments/
├── js/
│   ├── agents/
│   └── main.js
├── css/
├── data/
├── assets/
├── README.md
└── AGENTS.md
```

## Technologies

- HTML, CSS, JavaScript pur
- [p5.js](https://p5js.org/) pour les animations interactives
- Architecture orientée agents orchestrée par un bus d’événements interne

## Licence

Le contenu est fourni à des fins pédagogiques. Toute réutilisation doit citer la source.
