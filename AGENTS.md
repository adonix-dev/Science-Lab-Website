## 🧪 AGENTS.md

### Contexte général
Le projet **Lab** est un site expérimental hébergé sur `lab.antonylaget.com`.  
Il propose des visualisations interactives de phénomènes physiques (principalement quantiques), à partir d’un fichier JSON contenant les données descriptives de chaque expérience.

Le site fonctionne selon une architecture **orientée agents**, où chaque module JavaScript est autonome et responsable d’une tâche précise (affichage, physique, interface, données, etc.).  
Chaque agent communique avec les autres via des événements légers (pub/sub interne).

---

## 🧩 Structure et responsabilités

### 1. `AgentInterface`
**Rôle :** gérer la navigation et l’affichage général du site.  
**Responsabilités :**
- Charger dynamiquement les pages (`index`, `expérience`, `404`).  
- Générer les cartes du menu principal à partir du JSON.  
- Gérer la recherche et le filtrage.  
- Appliquer les transitions (fade in/out).  
- Adapter la mise en page responsive (mobile/tablette/desktop).  

**Événements émis :**
- `interface:navigate` → lorsqu’un utilisateur clique sur une expérience.  
- `interface:filter` → lorsqu’un terme de recherche est saisi.  

**Dépendances :** `AgentData`, `AgentAnimation`.

---

### 2. `AgentData`
**Rôle :** fournir et structurer les données issues du fichier `phenomenes.json`.  
**Responsabilités :**
- Charger le JSON au démarrage.  
- Exposer des méthodes pour obtenir la liste des phénomènes, un phénomène par ID, etc.  
- Normaliser le contenu (résumés, textes longs, titres).  
- Gérer la mise en cache locale (localStorage).  

**Événements émis :**
- `data:ready` → quand les données sont chargées et prêtes.  

**Dépendances :** aucune.  

---

### 3. `AgentAnimation`
**Rôle :** créer et contrôler les animations scientifiques.  
**Responsabilités :**
- Utiliser **p5.js** ou **Three.js** selon le type d’expérience.  
- Fournir une API générique pour chaque type d’animation (`init`, `start`, `stop`, `updateParams`).  
- Gérer les curseurs utilisateurs pour ajuster les variables (fréquence, phase, énergie, etc.).  
- Nettoyer la scène lors du changement de page.  

**Événements émis :**
- `animation:loaded` → quand une animation est prête à être affichée.  
- `animation:updated` → quand un paramètre a été modifié.  

**Dépendances :** `AgentData`.

---

### 4. `AgentPhysics`
**Rôle :** encapsuler les calculs physiques nécessaires aux visualisations.  
**Responsabilités :**
- Calculs de fonctions d’onde, probabilité, transmission, interférence, etc.  
- Simulation simplifiée des équations (sans moteur physique complet).  
- Fournir des fonctions mathématiques réutilisables aux animations.  

**Exemples :**
- `computeWaveInterference(x, params)`  
- `computeTunnelTransmission(E, V0, L)`  

**Dépendances :** aucune (module pur).  

---

### 5. `AgentUI`
**Rôle :** gérer les éléments de contrôle (curseurs, boutons, bascules).  
**Responsabilités :**
- Créer dynamiquement les contrôles en fonction des paramètres d’une animation.  
- Émettre des événements lors d’un changement d’état.  
- Synchroniser l’UI avec les valeurs de l’animation.  

**Événements émis :**
- `ui:change` → lorsqu’un utilisateur modifie un paramètre.  

**Dépendances :** `AgentAnimation`.

---

### 6. `AgentTheme`
**Rôle :** appliquer le thème graphique global.  
**Responsabilités :**
- Gérer le mode sombre et les couleurs accentuées (bleu cyan).  
- Fournir une API `setTheme(dark|light)` et `applyAccent(color)`.  
- Animer les transitions entre thèmes.  

**Dépendances :** `AgentInterface`.  

---

### 7. `AgentLogger`
**Rôle :** suivre les interactions utilisateur et erreurs système.  
**Responsabilités :**
- Logger les événements importants (chargement d’une expérience, erreur d’animation, etc.).  
- Sauvegarder localement ou envoyer à un endpoint futur.  
- Optionnel : afficher la console des événements pour le debug.  

**Dépendances :** tous les autres agents.

---

## 🧠 Cycle de vie de l’application

1. `AgentData` charge le JSON et émet `data:ready`.  
2. `AgentInterface` construit la page d’accueil à partir des données.  
3. L’utilisateur clique sur une carte → `interface:navigate`.  
4. `AgentAnimation` et `AgentPhysics` chargent le module correspondant.  
5. `AgentUI` installe les curseurs interactifs.  
6. `AgentLogger` enregistre les actions.  
7. Au changement de page, tous les agents nettoient leur contexte (`dispose()`).  

---

## 🔧 Communication entre agents (schéma simplifié)

```
[ AgentInterface ]
       ↓
[ AgentData ] → fournit contenus
       ↓
[ AgentAnimation ] → crée visualisation
       ↔
[ AgentUI ] → ajuste les paramètres
       ↔
[ AgentPhysics ] → fournit les calculs
       ↓
[ AgentLogger ] → trace toutes les actions
```

---

## 🧱 Conventions

- Tous les agents sont placés dans `/js/agents/` et exportent une classe unique.  
- Chaque agent expose au minimum :
  ```js
  class Agent {
    constructor(bus) { ... }    // bus = event emitter partagé
    init() { ... }
    dispose() { ... }
  }
  ```
- La communication inter-agent passe par un bus d’événements commun (`EventBus` minimaliste maison).  
- Aucun accès direct entre agents sauf par le bus.
