export const experimentsFallback = {
  list: [
    {
      id: 'fentes-de-young',
      title: 'Interférences à deux fentes',
      summary: "Un faisceau quantique traversant deux fentes dessine des franges lumineuses même en flux de particules uniques.",
      icon: '🌊',
      tags: ['onde', 'interférence', 'double fente']
    },
    {
      id: 'mach-zehnder',
      title: 'Interféromètre de Mach-Zehnder',
      summary: "Deux séparateurs de faisceau contrôlent la sortie d'un photon grâce au déphasage introduit entre les chemins.",
      icon: '🪞',
      tags: ['phase', 'interférence', 'optique']
    },
    {
      id: 'effet-photoelectrique',
      title: 'Effet photoélectrique',
      summary: "Sous la fréquence seuil, aucun électron n'est éjecté, quelle que soit l'intensité lumineuse.",
      icon: '🔆',
      tags: ['photon', 'électron', 'seuil']
    },
    {
      id: 'stern-gerlach',
      title: 'Spin et expérience de Stern–Gerlach',
      summary: 'Un faisceau atomique se sépare en deux lobes correspondant aux projections ±ħ/2 du spin.',
      icon: '🧲',
      tags: ['spin', 'mesure', 'aimant']
    },
    {
      id: 'effet-tunnel',
      title: 'Effet tunnel',
      summary: "Une particule traverse une barrière grâce à la pénétration de sa fonction d'onde.",
      icon: '🌌',
      tags: ['onde', 'barrière', 'probabilité']
    },
    {
      id: 'intrication',
      title: 'Intrication quantique',
      summary: "Deux particules intriquées présentent des corrélations cosinus qui défient l'intuition classique.",
      icon: '🪐',
      tags: ['corrélation', 'polariseur', 'bell']
    },
    {
      id: 'inegalites-bell',
      title: 'Inégalités de Bell',
      summary: 'La combinaison CHSH de corrélations quantiques dépasse la borne locale |S| ≤ 2.',
      icon: '📈',
      tags: ['bell', 'non-localité', 'corrélation']
    }
  ],
  details: {
    'effet-tunnel': {
      id: 'effet-tunnel',
      title: 'Effet tunnel',
      icon: '🌌',
      summary: "Une particule peut traverser une barrière même si son énergie est inférieure au seuil classique.",
      introduction:
        "Imaginez une bille quantique frappant un mur : parfois elle réapparaît de l'autre côté sans jamais grimper par-dessus. L'effet tunnel illustre la nature ondulatoire des particules et la non-intuitivité du monde quantique.",
      tags: ['onde', 'barrière', 'probabilité', 'quantique'],
      further: [
        {
          label: 'Universitaire',
          content:
            "En régime 1D, une barrière rectangulaire de hauteur V₀ et de largeur L donne un coefficient de transmission T ≈ e^{-2κL} avec κ = √(2m(V₀ - E)) / ħ lorsque E < V₀. Les solutions dans la barrière décroissent exponentiellement et se recollent en sortie, ce qui explique la présence d'une amplitude transmise non nulle."
        }
      ],
      animation: {
        type: 'tunnel',
        description:
          "Visualisation d'un paquet d'ondes qui rencontre une barrière potentielle modulable. Les curseurs contrôlent l'énergie incidente et la largeur de la barrière pour observer l'amplitude transmise.",
        controls: [
          { id: 'energy', label: 'Énergie incidente', type: 'range', min: 0.1, max: 1, step: 0.01, value: 0.45, unit: 'E₀' },
          { id: 'barrierHeight', label: 'Hauteur de barrière', type: 'range', min: 0.3, max: 1.2, step: 0.01, value: 0.8, unit: 'V₀' },
          { id: 'barrierWidth', label: 'Largeur de barrière', type: 'range', min: 0.2, max: 0.8, step: 0.01, value: 0.45, unit: 'L' }
        ],
        parameters: { speed: 0.9 }
      }
    },
    'fentes-de-young': {
      id: 'fentes-de-young',
      title: 'Interférences à deux fentes',
      icon: '🌊',
      summary: "Un faisceau quantique traversant deux fentes dessine un motif d'interférences même lorsque les particules arrivent une à une.",
      introduction:
        "Les fentes de Young révèlent la dualité onde-corpuscule : si l'on n'observe pas le chemin, les impacts forment des franges lumineuses et sombres, signatures d'interférences.",
      tags: ['onde', 'interférence', 'double fente'],
      further: [
        {
          label: 'Universitaire',
          content:
            "La fonction d'onde incident se divise sur deux fentes, donnant ψ = ψ₁ + ψ₂. L'intensité sur l'écran suit I(x) ∝ |ψ₁ + ψ₂|² = |ψ₁|² + |ψ₂|² + 2Re(ψ₁ψ₂*). Une mesure de chemin détruit la cohérence et supprime le terme d'interférence, illustrant le principe de complémentarité."
        }
      ],
      animation: {
        type: 'doubleSlit',
        description:
          "Accumulation d'impacts sur un écran avec possibilité de fermer une fente ou d'activer un détecteur qui réduit la visibilité des franges.",
        controls: [
          { id: 'visibility', label: 'Visibilité des interférences', type: 'range', min: 0, max: 1, step: 0.01, value: 1, unit: '' },
          { id: 'openSlits', label: 'Fentes ouvertes', type: 'toggle', value: true }
        ],
        parameters: { emissionRate: 0.6 }
      }
    },
    'mach-zehnder': {
      id: 'mach-zehnder',
      title: 'Interféromètre de Mach-Zehnder',
      icon: '🪞',
      summary:
        "Un photon se sépare en deux chemins, acquiert une différence de phase puis est recombiné : les interférences déterminent le détecteur qui clique.",
      introduction:
        "L'interféromètre de Mach-Zehnder est une double fente fermée : deux séparateurs de faisceau encadrent des chemins où l'on peut introduire un déphasage contrôlé.",
      tags: ['interférence', 'phase', 'photons'],
      further: [
        {
          label: 'Universitaire',
          content:
            "Après le premier séparateur, l'état du photon est (|A⟩ + |B⟩)/√2. Un déphasage Δφ le transforme en (|A⟩ + e^{iΔφ}|B⟩)/√2 et les probabilités de détection deviennent P₁ = cos²(Δφ/2), P₂ = sin²(Δφ/2)."
        }
      ],
      animation: {
        type: 'machZehnder',
        description:
          "Deux bras optiques représentant les chemins A et B, avec un curseur de phase qui fait osciller la probabilité d'arrivée sur les détecteurs.",
        controls: [
          { id: 'phase', label: 'Déphasage Δφ', type: 'range', min: 0, max: 6.283, step: 0.01, value: 1.047, unit: 'rad' }
        ],
        parameters: { pulseInterval: 1600 }
      }
    },
    'effet-photoelectrique': {
      id: 'effet-photoelectrique',
      title: 'Effet photoélectrique',
      icon: '🔆',
      summary: "En dessous d'une fréquence seuil, aucune lumière ne peut éjecter d'électrons, quel que soit son éclat.",
      introduction:
        "L'effet photoélectrique a mené Einstein à proposer que la lumière est quantifiée en photons d'énergie hν. Seule une fréquence suffisante permet d'arracher des électrons d'une plaque métallique.",
      tags: ['photon', 'électron', 'seuil'],
      further: [
        {
          label: 'Universitaire',
          content:
            "Un photon apporte l'énergie E = hν. Si E dépasse le travail d'extraction W du métal, l'électron éjecté possède une énergie cinétique maximale Ec = hν - W. Les mesures de Millikan ont confirmé la relation linéaire entre Ec et ν."
        }
      ],
      animation: {
        type: 'photoelectric',
        description:
          "Un faisceau lumineux coloré frappe une plaque : ajustez la fréquence et l'intensité pour voir apparaître ou disparaître les électrons émis.",
        controls: [
          { id: 'frequency', label: 'Fréquence lumineuse', type: 'range', min: 3.0, max: 9.0, step: 0.1, value: 5.5, unit: '10¹⁴ Hz' },
          { id: 'intensity', label: 'Intensité', type: 'range', min: 0.2, max: 1, step: 0.05, value: 0.7, unit: 'I' }
        ],
        parameters: { workFunction: 5.0 }
      }
    },
    'stern-gerlach': {
      id: 'stern-gerlach',
      title: 'Spin et expérience de Stern–Gerlach',
      icon: '🧲',
      summary:
        "Un faisceau d'atomes se scinde en deux lobes discrets dans un champ magnétique non uniforme, révélant la quantification du spin.",
      introduction:
        "L'expérience de Stern et Gerlach montre que le moment magnétique d'un atome d'argent ne prend que deux valeurs projetées : spin up ou spin down. L'orientation du champ de mesure change la statistique des résultats.",
      tags: ['spin', 'mesure', 'aimant'],
      further: [
        {
          label: 'Universitaire',
          content:
            "Pour un spin s = 1/2, l'opérateur Sz a pour valeurs propres ±ħ/2. Le gradient de champ magnétique produit une force ±μ_B ∂B/∂z qui sépare le faisceau en deux composantes. Des mesures successives selon des axes non commutatifs reconstruisent la structure de l'espace de Hilbert."
        }
      ],
      animation: {
        type: 'sternGerlach',
        description:
          "Des particules représentées par des points traversent une région magnétique et se séparent suivant l'orientation choisie.",
        controls: [
          { id: 'angle', label: 'Orientation du champ', type: 'range', min: 0, max: 180, step: 1, value: 45, unit: '°' },
          { id: 'beamWidth', label: 'Largeur du faisceau', type: 'range', min: 0.2, max: 1, step: 0.05, value: 0.6, unit: '' }
        ],
        parameters: { emissionRate: 0.8 }
      }
    },
    intrication: {
      id: 'intrication',
      title: 'Intrication quantique',
      icon: '🪐',
      summary:
        "Deux particules intriquées affichent des corrélations fortes, indépendamment de la distance qui les sépare.",
      introduction:
        "L'intrication relie deux systèmes en un tout unique : mesurer l'un d'eux fixe instantanément le résultat de l'autre selon la base choisie, sans permettre de signaler plus vite que la lumière.",
      tags: ['corrélation', 'polariseur', 'bell'],
      further: [
        {
          label: 'Universitaire',
          content:
            "Un état singulet de deux spins vaut |Ψ⁻⟩ = (|↑↓⟩ - |↓↑⟩)/√2. Les mesures de spin sur des axes séparés donnent une corrélation -cos(θ_A - θ_B). Les inégalités de Bell, comme CHSH, sont violées avec une valeur maximale 2√2."
        }
      ],
      animation: {
        type: 'entanglement',
        description:
          "Deux polariseurs rotatifs mesurent des photons intriqués. Les curseurs fixent les angles de mesure et montrent la corrélation cosinus.",
        controls: [
          { id: 'angleA', label: 'Polariseur A', type: 'range', min: 0, max: 180, step: 1, value: 0, unit: '°' },
          { id: 'angleB', label: 'Polariseur B', type: 'range', min: 0, max: 180, step: 1, value: 45, unit: '°' }
        ],
        parameters: { sampleSize: 200 }
      }
    },
    'inegalites-bell': {
      id: 'inegalites-bell',
      title: 'Inégalités de Bell',
      icon: '📈',
      summary:
        "Les tests de Bell comparent les corrélations quantiques à la limite imposée par toute théorie locale.",
      introduction:
        "La formulation CHSH des inégalités de Bell combine quatre configurations de polariseurs. En mécanique quantique, certaines orientations donnent une valeur S = 2√2, supérieure à la borne classique S ≤ 2.",
      tags: ['bell', 'corrélation', 'non-localité'],
      further: [
        {
          label: 'Universitaire',
          content:
            "La quantité CHSH s'exprime S = E(a, b) + E(a, b') + E(a', b) - E(a', b') avec E les corrélations ±1. Les modèles locaux vérifient |S| ≤ 2 alors que les états de Bell optimisent S = 2√2 en choisissant des angles séparés de 45°. Les expériences modernes ferment progressivement les principales échappatoires."
        }
      ],
      animation: {
        type: 'bellInequality',
        description:
          "Réglez quatre angles de polariseurs et observez la valeur de S comparée à la limite classique.",
        controls: [
          { id: 'angleA', label: 'a', type: 'range', min: 0, max: 180, step: 1, value: 0, unit: '°' },
          { id: 'angleAprime', label: "a'", type: 'range', min: 0, max: 180, step: 1, value: 90, unit: '°' },
          { id: 'angleB', label: 'b', type: 'range', min: 0, max: 180, step: 1, value: 45, unit: '°' },
          { id: 'angleBprime', label: "b'", type: 'range', min: 0, max: 180, step: 1, value: 135, unit: '°' }
        ],
        parameters: { sampleSize: 400 }
      }
    }
  }
};
