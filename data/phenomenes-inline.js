export const experimentsFallback = {
  "list": [
    {
      "id": "fentes-de-young",
      "title": "Interférences à deux fentes",
      "summary": "Un faisceau quantique traversant deux fentes dessine des franges lumineuses même en flux de particules uniques.",
      "icon": "🌊",
      "tags": [
        "onde",
        "interférence",
        "double fente"
      ],
      "path": "experiments/fentes-de-young.json"
    },
    {
      "id": "mach-zehnder",
      "title": "Interféromètre de Mach-Zehnder",
      "summary": "Deux séparateurs de faisceau contrôlent la sortie d'un photon grâce au déphasage introduit entre les chemins.",
      "icon": "🪞",
      "tags": [
        "phase",
        "interférence",
        "optique"
      ],
      "path": "experiments/mach-zehnder.json"
    },
    {
      "id": "effet-photoelectrique",
      "title": "Effet photoélectrique",
      "summary": "Sous la fréquence seuil, aucun électron n'est éjecté, quelle que soit l'intensité lumineuse.",
      "icon": "🔆",
      "tags": [
        "photon",
        "électron",
        "seuil"
      ],
      "path": "experiments/effet-photoelectrique.json"
    },
    {
      "id": "stern-gerlach",
      "title": "Spin et expérience de Stern–Gerlach",
      "summary": "Un faisceau atomique se sépare en deux lobes correspondant aux projections ±ħ/2 du spin.",
      "icon": "🧲",
      "tags": [
        "spin",
        "mesure",
        "aimant"
      ],
      "path": "experiments/stern-gerlach.json"
    },
    {
      "id": "effet-tunnel",
      "title": "Effet tunnel",
      "summary": "Une particule traverse une barrière grâce à la pénétration de sa fonction d'onde.",
      "icon": "🌌",
      "tags": [
        "onde",
        "barrière",
        "probabilité"
      ],
      "path": "experiments/effet-tunnel.json"
    },
    {
      "id": "intrication",
      "title": "Intrication quantique",
      "summary": "Deux particules intriquées présentent des corrélations cosinus qui défient l'intuition classique.",
      "icon": "🪐",
      "tags": [
        "corrélation",
        "polariseur",
        "bell"
      ],
      "path": "experiments/intrication.json"
    },
    {
      "id": "inegalites-bell",
      "title": "Inégalités de Bell",
      "summary": "La combinaison CHSH de corrélations quantiques dépasse la borne locale |S| ≤ 2.",
      "icon": "📈",
      "tags": [
        "bell",
        "non-localité",
        "corrélation"
      ],
      "path": "experiments/inegalites-bell.json"
    }
  ],
  "details": {
    "fentes-de-young": {
      "id": "fentes-de-young",
      "title": "Interférences à deux fentes (Expérience de Young)",
      "icon": "🌊",
      "summary": "Une particule quantique, envoyée à travers deux fentes, crée un motif d’interférences comme une onde. Même envoyées une par une, les particules forment des franges lumineuses et sombres. Observer le chemin détruit ces interférences.",
      "introduction": "Les fentes de Young révèlent la dualité onde-corpuscule : si l'on n'observe pas le chemin, les impacts forment des franges lumineuses et sombres, signatures d'interférences.",
      "tags": [
        "onde",
        "interférence",
        "double fente"
      ],
      "further": [
        {
          "label": "Universitaire",
          "content": "La fonction d'onde incident se divise sur deux fentes, donnant ψ = ψ₁ + ψ₂. L'intensité sur l'écran suit I(x) ∝ |ψ₁ + ψ₂|² = |ψ₁|² + |ψ₂|² + 2Re(ψ₁ψ₂*). Une mesure de chemin détruit la cohérence et supprime le terme d'interférence, illustrant le principe de complémentarité."
        }
      ],
      "animation": {
        "description": "Accumulation d'impacts sur un écran avec possibilité de fermer une fente ou d'activer un détecteur qui réduit la visibilité des franges.",
        "controls": [
          {
            "id": "visibility",
            "label": "Visibilité des interférences",
            "type": "range",
            "min": 0,
            "max": 1,
            "step": 0.01,
            "value": 1
          },
          {
            "id": "openSlits",
            "label": "Fentes ouvertes",
            "type": "toggle",
            "value": true
          }
        ],
        "parameters": {
          "emissionRate": 0.6
        },
        "sketch": {
          "library": "p5",
          "code": "(() => {\n  return {\n    setup({ state, params }) {\n      state.particles = [];\n      state.maxParticles = 700;\n      state.emissionRate = params.emissionRate || 0.6;\n    },\n    draw({ p, state, helpers }) {\n      const width = p.width;\n      const height = p.height;\n      p.background(8, 10, 18, 245);\n      p.noStroke();\n      p.fill(20, 28, 45, 200);\n      p.rect(width * 0.1, height * 0.15, width * 0.8, height * 0.7, 18);\n      const emitCount = Math.floor(3 + (state.emissionRate || 0.6) * 8);\n      for (let i = 0; i < emitCount; i += 1) {\n        if (state.particles.length >= state.maxParticles) break;\n        const xNorm = helpers.random(-1, 1);\n        const intensity = helpers.physics.doubleSlitIntensity(xNorm, {\n          visibility: state.visibility,\n          openSlits: state.openSlits\n        });\n        if (Math.random() < intensity) {\n          const x = width * (0.1 + 0.8 * ((xNorm + 1) / 2));\n          const y = height * (0.15 + Math.random() * 0.7);\n          state.particles.push({ x, y, life: 1 });\n        }\n      }\n      if (state.particles.length > state.maxParticles) {\n        state.particles.splice(0, state.particles.length - state.maxParticles);\n      }\n      state.particles.forEach((particle) => {\n        particle.life *= 0.995;\n        p.fill(58, 215, 255, 220 * particle.life + 30);\n        p.noStroke();\n        p.circle(particle.x, particle.y, 4);\n      });\n      p.stroke(58, 215, 255, 120);\n      p.line(width / 2, height * 0.15, width / 2, height * 0.85);\n      p.noStroke();\n      p.fill(58, 215, 255, 200);\n      const message = state.openSlits ? 'Franges visibles' : 'Une seule fente ouverte';\n      p.textAlign(p.CENTER, p.BOTTOM);\n      p.text(message, width / 2, height - 12);\n    },\n    update({ state, key, value }) {\n      if (key === 'openSlits') {\n        state[key] = Boolean(value);\n      } else {\n        state[key] = value;\n      }\n    },\n    replay({ state }) {\n      state.particles = [];\n    }\n  };\n})()"
        }
      }
    },
    "mach-zehnder": {
      "id": "mach-zehnder",
      "title": "Interféromètre de Mach-Zehnder",
      "icon": "🪞",
      "summary": "Un photon est séparé en deux chemins puis recombiné. Selon la différence de phase, les interférences dirigent le signal vers une sortie.",
      "introduction": "L'interféromètre de Mach-Zehnder est une double fente fermée : deux séparateurs de faisceau encadrent des chemins où l'on peut introduire un déphasage contrôlé.",
      "tags": [
        "interférence",
        "phase",
        "photons"
      ],
      "further": [
        {
          "label": "Universitaire",
          "content": "Après le premier séparateur, l'état du photon est (|A⟩ + |B⟩)/√2. Un déphasage Δφ le transforme en (|A⟩ + e^{iΔφ}|B⟩)/√2 et les probabilités de détection deviennent P₁ = cos²(Δφ/2), P₂ = sin²(Δφ/2)."
        }
      ],
      "animation": {
        "description": "Deux bras optiques représentant les chemins A et B, avec un curseur de phase qui fait osciller la probabilité d'arrivée sur les détecteurs.",
        "controls": [
          {
            "id": "phase",
            "label": "Déphasage Δφ",
            "type": "range",
            "min": 0,
            "max": 6.283,
            "step": 0.01,
            "value": 1.047,
            "unit": "rad"
          }
        ],
        "parameters": {
          "pulseInterval": 1600
        },
        "sketch": {
          "library": "p5",
          "code": "(() => {\n  return {\n    setup({ state, params }) {\n      state.pulses = [];\n      state.lastPulse = 0;\n      state.interval = params.pulseInterval || 1600;\n    },\n    draw({ p, state, helpers }) {\n      const width = p.width;\n      const height = p.height;\n      const centerY = height / 2;\n      const leftX = width * 0.15;\n      const rightX = width * 0.85;\n      const topY = height * 0.28;\n      const bottomY = height * 0.72;\n      if (!state.lastPulse) {\n        state.lastPulse = p.millis();\n      }\n      p.background(8, 10, 18, 245);\n      p.stroke(58, 215, 255, 120);\n      p.strokeWeight(3);\n      p.noFill();\n      p.line(leftX, centerY, width * 0.32, centerY);\n      p.line(width * 0.32, centerY, width * 0.48, topY);\n      p.line(width * 0.32, centerY, width * 0.48, bottomY);\n      p.line(width * 0.48, topY, width * 0.65, topY);\n      p.line(width * 0.48, bottomY, width * 0.65, bottomY);\n      p.line(width * 0.65, topY, rightX, centerY * 0.7);\n      p.line(width * 0.65, bottomY, rightX, centerY * 1.3);\n      p.fill(58, 215, 255, 200);\n      p.noStroke();\n      p.rect(width * 0.32 - 8, centerY - 35, 16, 70, 6);\n      p.rect(width * 0.65 - 8, topY - 35, 16, 70, 6);\n      const { p1, p2 } = helpers.physics.machZehnderProbabilities(state.phase || 0);\n      const now = p.millis();\n      if (now - state.lastPulse > state.interval) {\n        state.lastPulse = now;\n        state.pulses.push({ t: 0 });\n      }\n      state.pulses.forEach((pulse) => {\n        pulse.t += 0.01;\n      });\n      while (state.pulses.length && state.pulses[0].t > 2) {\n        state.pulses.shift();\n      }\n      p.fill(58, 215, 255);\n      state.pulses.forEach((pulse) => {\n        const progress = Math.min(pulse.t, 1);\n        const x = p.lerp(leftX, width * 0.32, progress);\n        p.circle(x, centerY, 10);\n        if (pulse.t > 0.3 && pulse.t < 1.3) {\n          const branchProgress = Math.min(Math.max(pulse.t - 0.3, 0), 1);\n          const topX = p.lerp(width * 0.32, width * 0.48, branchProgress);\n          const topCurve = p.lerp(centerY, topY, branchProgress);\n          const bottomCurve = p.lerp(centerY, bottomY, branchProgress);\n          p.fill(58, 215, 255, 200);\n          p.circle(topX, topCurve, 8);\n          p.circle(topX, bottomCurve, 8);\n        }\n        if (pulse.t > 1) {\n          const exitProgress = Math.min(pulse.t - 1, 1);\n          const topExitX = p.lerp(width * 0.65, rightX, exitProgress);\n          const bottomExitX = topExitX;\n          const topExitY = p.lerp(topY, centerY * 0.7, exitProgress);\n          const bottomExitY = p.lerp(bottomY, centerY * 1.3, exitProgress);\n          p.fill(58, 215, 255, 160 * p1);\n          p.circle(topExitX, topExitY, 12);\n          p.fill(58, 215, 255, 160 * p2);\n          p.circle(bottomExitX, bottomExitY, 12);\n        }\n      });\n      p.noStroke();\n      p.fill(58, 215, 255, 150);\n      p.rect(rightX - 14, centerY * 0.7 - 20, 28, 40, 6);\n      p.rect(rightX - 14, centerY * 1.3 - 20, 28, 40, 6);\n      p.textAlign(p.RIGHT, p.TOP);\n      p.fill(58, 215, 255, 210);\n      p.textSize(14);\n      p.text(`P₁ = ${(p1 * 100).toFixed(0)}%`, rightX - 18, centerY * 0.7 - 50);\n      p.text(`P₂ = ${(p2 * 100).toFixed(0)}%`, rightX - 18, centerY * 1.3 - 50);\n      p.textAlign(p.LEFT, p.TOP);\n      p.text(`Δφ = ${(state.phase || 0).toFixed(2)} rad`, 20, 20);\n    },\n    update({ state, key, value }) {\n      state[key] = value;\n    },\n    replay({ state }) {\n      state.pulses = [];\n      state.lastPulse = 0;\n    }\n  };\n})()"
        }
      }
    },
    "effet-photoelectrique": {
      "id": "effet-photoelectrique",
      "title": "Effet photoélectrique",
      "icon": "🔆",
      "summary": "Une lumière suffisamment énergétique arrache des électrons d’une plaque métallique. En dessous d’une fréquence seuil, aucun électron n’est émis.",
      "introduction": "L'effet photoélectrique a mené Einstein à proposer que la lumière est quantifiée en photons d'énergie hν. Seule une fréquence suffisante permet d'arracher des électrons d'une plaque métallique.",
      "tags": [
        "photon",
        "électron",
        "seuil"
      ],
      "further": [
        {
          "label": "Universitaire",
          "content": "Un photon apporte l'énergie E = hν. Si E dépasse le travail d'extraction W du métal, l'électron éjecté possède une énergie cinétique maximale Ec = hν - W. Les mesures de Millikan ont confirmé la relation linéaire entre Ec et ν."
        }
      ],
      "animation": {
        "description": "Un faisceau lumineux coloré frappe une plaque : ajustez la fréquence et l'intensité pour voir apparaître ou disparaître les électrons émis.",
        "controls": [
          {
            "id": "frequency",
            "label": "Fréquence lumineuse",
            "type": "range",
            "min": 3.0,
            "max": 9.0,
            "step": 0.1,
            "value": 5.5,
            "unit": "10¹⁴ Hz"
          },
          {
            "id": "intensity",
            "label": "Intensité",
            "type": "range",
            "min": 0.2,
            "max": 1,
            "step": 0.05,
            "value": 0.7,
            "unit": "I"
          }
        ],
        "parameters": {
          "workFunction": 5.0
        },
        "sketch": {
          "library": "p5",
          "code": "(() => {\n  const frequencyToColor = (p, frequency) => {\n    const t = Math.min(Math.max((frequency - 3) / 6, 0), 1);\n    const hue = p.lerp(200, 320, t);\n    return p.color(`hsla(${hue}, 80%, 60%, 0.85)`);\n  };\n  return {\n    setup({ state, params }) {\n      state.electrons = [];\n      state.workFunction = params.workFunction || 5;\n    },\n    draw({ p, state, helpers }) {\n      const width = p.width;\n      const height = p.height;\n      p.background(8, 10, 18, 240);\n      const result = helpers.physics.photoelectricEmission({\n        frequency: state.frequency,\n        intensity: state.intensity,\n        workFunction: state.workFunction\n      });\n      p.noStroke();\n      p.fill(25, 32, 48, 220);\n      p.rect(width * 0.2, height * 0.6, width * 0.6, height * 0.08, 12);\n      const photonColor = frequencyToColor(p, state.frequency);\n      const photonCount = Math.floor(4 + state.intensity * 12);\n      for (let i = 0; i < photonCount; i += 1) {\n        const offset = Math.random() * width * 0.6;\n        const x = width * 0.2 + offset;\n        const length = height * 0.3 * state.intensity;\n        p.stroke(photonColor);\n        p.strokeWeight(2);\n        p.line(x, height * 0.2, x, height * 0.2 + length);\n        if (result.emitted && Math.random() < result.rate * 0.3) {\n          state.electrons.push({ x, y: height * 0.6, vx: 1 + result.kineticEnergy * 0.8 });\n        }\n      }\n      p.noStroke();\n      p.fill(58, 215, 255, 180);\n      p.textSize(14);\n      p.textAlign(p.LEFT, p.TOP);\n      const kinetic = result.emitted ? result.kineticEnergy.toFixed(2) : '0.00';\n      p.text(`ν = ${state.frequency.toFixed(2)} × 10¹⁴ Hz`, 20, 20);\n      p.text(`Émission: ${result.emitted ? 'oui' : 'non'}`, 20, 40);\n      p.text(`Énergie cinétique max: ${kinetic}`, 20, 60);\n      for (let i = state.electrons.length - 1; i >= 0; i -= 1) {\n        const e = state.electrons[i];\n        e.x += e.vx * 4;\n        e.y -= Math.sin(e.x / 30) * 0.6;\n        p.fill(58, 215, 255, 200);\n        p.circle(e.x, e.y, 6);\n        if (e.x > width * 0.8) {\n          state.electrons.splice(i, 1);\n        }\n      }\n    },\n    update({ state, key, value }) {\n      state[key] = value;\n    },\n    replay({ state }) {\n      state.electrons = [];\n    }\n  };\n})()"
        }
      }
    },
    "stern-gerlach": {
      "id": "stern-gerlach",
      "title": "Spin quantique et expérience de Stern–Gerlach",
      "icon": "🧲",
      "summary": "Un faisceau d’atomes d’argent se sépare en deux directions distinctes dans un champ magnétique, révélant la quantification du spin : chaque atome est soit 'spin up', soit 'spin down', jamais entre les deux.",
      "introduction": "L'expérience de Stern et Gerlach montre que le moment magnétique d'un atome d'argent ne prend que deux valeurs projetées : spin up ou spin down. L'orientation du champ de mesure change la statistique des résultats.",
      "tags": [
        "spin",
        "mesure",
        "aimant"
      ],
      "further": [
        {
          "label": "Universitaire",
          "content": "Pour un spin s = 1/2, l'opérateur Sz a pour valeurs propres ±ħ/2. Le gradient de champ magnétique produit une force ±μ_B ∂B/∂z qui sépare le faisceau en deux composantes. Des mesures successives selon des axes non commutatifs reconstruisent la structure de l'espace de Hilbert."
        }
      ],
      "animation": {
        "description": "Des particules représentées par des points traversent une région magnétique et se séparent suivant l'orientation choisie.",
        "controls": [
          {
            "id": "angle",
            "label": "Orientation du champ",
            "type": "range",
            "min": 0,
            "max": 180,
            "step": 1,
            "value": 45,
            "unit": "°"
          },
          {
            "id": "beamWidth",
            "label": "Largeur du faisceau",
            "type": "range",
            "min": 0.2,
            "max": 1,
            "step": 0.05,
            "value": 0.6
          }
        ],
        "parameters": {
          "emissionRate": 0.8
        },
        "sketch": {
          "library": "p5",
          "code": "(() => {\n  return {\n    setup({ state, params }) {\n      state.atoms = [];\n      state.emissionRate = params.emissionRate || 0.8;\n    },\n    draw({ p, state, helpers }) {\n      const width = p.width;\n      const height = p.height;\n      p.background(8, 10, 18, 245);\n      const { separation, spread } = helpers.physics.sternGerlachDistribution(state.angle || 0, state.beamWidth || 0.6);\n      p.noStroke();\n      p.fill(25, 34, 52, 200);\n      p.rect(width * 0.4, height * 0.3, width * 0.2, height * 0.4, 18);\n      const newAtoms = Math.floor(2 + (state.emissionRate || 0.8) * 5);\n      for (let i = 0; i < newAtoms; i += 1) {\n        state.atoms.push({\n          x: width * 0.15,\n          y: height * 0.5 + (Math.random() - 0.5) * height * 0.15,\n          spin: Math.random() > 0.5 ? 1 : -1,\n          speed: 2 + Math.random() * 1.5\n        });\n      }\n      for (let i = state.atoms.length - 1; i >= 0; i -= 1) {\n        const atom = state.atoms[i];\n        atom.x += atom.speed;\n        const targetY = height * 0.5 + atom.spin * separation * height * 0.25;\n        atom.y += (targetY - atom.y) * 0.03;\n        atom.y += (Math.random() - 0.5) * spread;\n        p.fill(58, 215, 255, 220);\n        p.noStroke();\n        p.circle(atom.x, atom.y, 6);\n        if (atom.x > width * 0.85) {\n          state.atoms.splice(i, 1);\n        }\n      }\n      p.fill(58, 215, 255, 180);\n      p.textAlign(p.LEFT, p.TOP);\n      p.textSize(14);\n      p.text(`Orientation: ${(state.angle || 0).toFixed(0)}°`, 20, 20);\n      p.text(`Séparation relative: ${(separation * 100).toFixed(0)}%`, 20, 40);\n    },\n    update({ state, key, value }) {\n      state[key] = value;\n    },\n    replay({ state }) {\n      state.atoms = [];\n    }\n  };\n})()"
        }
      }
    },
    "effet-tunnel": {
      "id": "effet-tunnel",
      "title": "Effet tunnel",
      "icon": "🌌",
      "summary": "Une particule peut traverser une barrière même si son énergie est inférieure au seuil classique.",
      "introduction": "Imaginez une bille quantique frappant un mur : parfois elle réapparaît de l'autre côté sans jamais grimper par-dessus. L'effet tunnel illustre la nature ondulatoire des particules et la non-intuitivité du monde quantique.",
      "tags": [
        "onde",
        "barrière",
        "probabilité",
        "quantique"
      ],
      "further": [
        {
          "label": "Universitaire",
          "content": "En régime 1D, une barrière rectangulaire de hauteur V₀ et de largeur L donne un coefficient de transmission T ≈ e^{-2κL} avec κ = √(2m(V₀ - E)) / ħ lorsque E < V₀. Les solutions dans la barrière décroissent exponentiellement et se recollent en sortie, ce qui explique la présence d'une amplitude transmise non nulle."
        }
      ],
      "animation": {
        "description": "Visualisation d'un paquet d'ondes qui rencontre une barrière potentielle modulable. Les curseurs contrôlent l'énergie incidente et la largeur de la barrière pour observer l'amplitude transmise.",
        "controls": [
          {
            "id": "energy",
            "label": "Énergie incidente",
            "type": "range",
            "min": 0.1,
            "max": 1,
            "step": 0.01,
            "value": 0.45,
            "unit": "E₀"
          },
          {
            "id": "barrierHeight",
            "label": "Hauteur de barrière",
            "type": "range",
            "min": 0.3,
            "max": 1.2,
            "step": 0.01,
            "value": 0.8,
            "unit": "V₀"
          },
          {
            "id": "barrierWidth",
            "label": "Largeur de barrière",
            "type": "range",
            "min": 0.2,
            "max": 0.8,
            "step": 0.01,
            "value": 0.45,
            "unit": "L"
          }
        ],
        "parameters": {
          "speed": 0.9
        },
        "sketch": {
          "library": "p5",
          "code": "(() => {\n  return {\n    setup({ state, params }) {\n      state.time = 0;\n      state.speed = params.speed || 0.9;\n    },\n    draw({ p, state, helpers }) {\n      const width = p.width;\n      const height = p.height;\n      p.background(11, 13, 19);\n      state.time += 0.012 * (state.speed || 0.9);\n      const transmission = helpers.physics.tunnelTransmission({\n        energy: state.energy,\n        barrierHeight: state.barrierHeight,\n        barrierWidth: state.barrierWidth\n      });\n      const barrierWidthPx = width * (0.25 + state.barrierWidth * 0.35);\n      const barrierLeft = width * 0.45;\n      const barrierRight = barrierLeft + barrierWidthPx;\n      const barrierHeightPx = height * (0.2 + state.barrierHeight * 0.5);\n      p.noStroke();\n      p.fill(20, 28, 45, 220);\n      p.rect(barrierLeft, (height - barrierHeightPx) / 2, barrierWidthPx, barrierHeightPx, 16);\n      const drawWave = (startX, endX, amplitude, alpha) => {\n        const steps = 180;\n        p.stroke(58, 215, 255, alpha);\n        p.noFill();\n        p.beginShape();\n        for (let i = 0; i <= steps; i += 1) {\n          const t = i / steps;\n          const x = p.lerp(startX, endX, t);\n          const phase = state.time * 3 + t * 18;\n          const envelope = Math.min(1, Math.exp((x - startX) / 120));\n          const y = height / 2 + Math.sin(phase) * amplitude * envelope;\n          p.vertex(x, y);\n        }\n        p.endShape();\n      };\n      drawWave(width * 0.05, barrierLeft, height * (0.2 + state.energy * 0.2), 220);\n      p.stroke(120, 150, 255, 120);\n      p.noFill();\n      p.beginShape();\n      const stepsBarrier = 60;\n      for (let i = 0; i <= stepsBarrier; i += 1) {\n        const t = i / stepsBarrier;\n        const x = p.lerp(barrierLeft, barrierRight, t);\n        const decay = Math.exp(-t * 4 * (state.barrierHeight - state.energy + 0.3));\n        const y = height / 2 + Math.sin(state.time * 3 + t * 8) * height * 0.18 * decay;\n        p.vertex(x, y);\n      }\n      p.endShape();\n      drawWave(barrierRight, width * 0.95, height * 0.18 * transmission, 160);\n      p.noStroke();\n      p.fill(58, 215, 255, 190);\n      p.textSize(14);\n      p.textAlign(p.LEFT, p.TOP);\n      p.text(`Transmission ~ ${(transmission * 100).toFixed(0)}%`, 20, 20);\n      p.text(`E = ${state.energy.toFixed(2)}  |  V₀ = ${state.barrierHeight.toFixed(2)}  |  L = ${state.barrierWidth.toFixed(2)}`, 20, 40);\n    },\n    update({ state, key, value }) {\n      state[key] = value;\n    },\n    replay({ state }) {\n      state.time = 0;\n    }\n  };\n})()"
        }
      }
    },
    "intrication": {
      "id": "intrication",
      "title": "Intrication quantique",
      "icon": "🪐",
      "summary": "Deux particules peuvent être liées de manière telle que la mesure de l’une détermine instantanément l’état de l’autre, quelle que soit la distance. Le système forme un tout indivisible.",
      "introduction": "L'intrication relie deux systèmes en un tout unique : mesurer l'un d'eux fixe instantanément le résultat de l'autre selon la base choisie, sans permettre de signaler plus vite que la lumière.",
      "tags": [
        "corrélation",
        "polariseur",
        "bell"
      ],
      "further": [
        {
          "label": "Universitaire",
          "content": "Un état singulet de deux spins vaut |Ψ⁻⟩ = (|↑↓⟩ - |↓↑⟩)/√2. Les mesures de spin sur des axes séparés donnent une corrélation -cos(θ_A - θ_B). Les inégalités de Bell, comme CHSH, sont violées avec une valeur maximale 2√2."
        }
      ],
      "animation": {
        "description": "Deux polariseurs A/B à angles réglables ; tracer corrélation cosinus et résultats de coïncidences.",
        "controls": [
          {
            "id": "angleA",
            "label": "Polariseur A",
            "type": "range",
            "min": 0,
            "max": 180,
            "step": 1,
            "value": 0,
            "unit": "°"
          },
          {
            "id": "angleB",
            "label": "Polariseur B",
            "type": "range",
            "min": 0,
            "max": 180,
            "step": 1,
            "value": 45,
            "unit": "°"
          }
        ],
        "parameters": {
          "sampleSize": 200
        },
        "sketch": {
          "library": "p5",
          "code": "(() => {\n  const drawPolarizer = (p, center, angle, correlation) => {\n    p.push();\n    p.translate(center.x, center.y);\n    p.rotate((angle * Math.PI) / 180);\n    p.fill(25, 36, 58, 200);\n    p.stroke(58, 215, 255, 160);\n    p.strokeWeight(2);\n    p.rect(-14, -60, 28, 120, 12);\n    p.pop();\n    p.noStroke();\n    p.fill(58, 215, 255, 200);\n    p.circle(center.x, center.y, 18);\n    p.fill(8, 10, 18, 200);\n    p.textAlign(p.CENTER, p.CENTER);\n    p.textSize(12);\n    p.text(correlation > 0 ? '+' : '−', center.x, center.y);\n  };\n  const regenerate = (state, physics) => {\n    state.measurements = [];\n    const correlation = physics.entanglementCorrelation(state.angleA || 0, state.angleB || 0);\n    const sameProb = (correlation + 1) / 2;\n    let sameCount = 0;\n    for (let i = 0; i < state.sampleSize; i += 1) {\n      const same = Math.random() < sameProb;\n      const resultA = Math.random() > 0.5 ? 1 : -1;\n      const resultB = same ? resultA : -resultA;\n      state.measurements.push({ same, a: resultA, b: resultB });\n      if (same) sameCount += 1;\n    }\n    state.sameCount = sameCount;\n    state.diffCount = state.sampleSize - sameCount;\n  };\n  return {\n    setup({ state, params, helpers }) {\n      state.sampleSize = params.sampleSize || 200;\n      regenerate(state, helpers.physics);\n    },\n    draw({ p, state, helpers }) {\n      const width = p.width;\n      const height = p.height;\n      p.background(8, 10, 18, 245);\n      const correlation = helpers.physics.entanglementCorrelation(state.angleA || 0, state.angleB || 0);\n      p.noStroke();\n      p.fill(58, 215, 255, 180);\n      p.textAlign(p.LEFT, p.TOP);\n      p.textSize(14);\n      p.text(`Polariseur A: ${(state.angleA || 0).toFixed(0)}°`, 20, 20);\n      p.text(`Polariseur B: ${(state.angleB || 0).toFixed(0)}°`, 20, 40);\n      p.text(`Corrélation ⟨A·B⟩ = ${correlation.toFixed(2)}`, 20, 60);\n      const centerLeft = { x: width * 0.3, y: height * 0.55 };\n      const centerRight = { x: width * 0.7, y: height * 0.55 };\n      drawPolarizer(p, centerLeft, state.angleA || 0, correlation);\n      drawPolarizer(p, centerRight, state.angleB || 0, correlation);\n      p.stroke(58, 215, 255, 120 + Math.abs(correlation) * 80);\n      p.noFill();\n      p.strokeWeight(3);\n      p.bezier(centerLeft.x + 40, centerLeft.y, width * 0.45, height * 0.2, width * 0.55, height * 0.9, centerRight.x - 40, centerRight.y);\n      const radius = Math.min(width, height) * 0.18;\n      state.measurements.slice(0, 120).forEach((m, index) => {\n        const angle = (index / 120) * Math.PI * 2;\n        const r = radius * (0.6 + 0.4 * (m.same ? 1 : 0.6));\n        const x = width * 0.5 + Math.cos(angle) * r;\n        const y = height * 0.55 + Math.sin(angle) * r;\n        const alpha = m.same ? 220 : 120;\n        p.noStroke();\n        p.fill(58, 215, 255, alpha);\n        p.circle(x, y, m.same ? 6 : 4);\n      });\n      p.noStroke();\n      p.fill(58, 215, 255, 180);\n      const barWidth = width * 0.18;\n      const baseY = height * 0.85;\n      const scale = height * 0.25 / state.sampleSize;\n      p.rect(width * 0.25, baseY - state.sameCount * scale, barWidth, state.sameCount * scale, 10);\n      p.rect(width * 0.57, baseY - state.diffCount * scale, barWidth, state.diffCount * scale, 10);\n      p.textAlign(p.CENTER, p.TOP);\n      p.text(`Résultats identiques (${state.sameCount})`, width * 0.25 + barWidth / 2, baseY + 8);\n      p.text(`Résultats opposés (${state.diffCount})`, width * 0.57 + barWidth / 2, baseY + 8);\n    },\n    update({ state, key, value, helpers }) {\n      state[key] = value;\n      regenerate(state, helpers.physics);\n    },\n    replay({ state, helpers }) {\n      regenerate(state, helpers.physics);\n    }\n  };\n})()"
        }
      }
    },
    "inegalites-bell": {
      "id": "inegalites-bell",
      "title": "Inégalités de Bell",
      "icon": "📈",
      "summary": "Les tests de Bell comparent les corrélations quantiques à la limite imposée par toute théorie locale.",
      "introduction": "La formulation CHSH des inégalités de Bell combine quatre configurations de polariseurs. En mécanique quantique, certaines orientations donnent une valeur S = 2√2, supérieure à la borne classique S ≤ 2.",
      "tags": [
        "bell",
        "corrélation",
        "non-localité"
      ],
      "further": [
        {
          "label": "Universitaire",
          "content": "La quantité CHSH s'exprime S = E(a, b) + E(a, b') + E(a', b) - E(a', b') avec E les corrélations ±1. Les modèles locaux vérifient |S| ≤ 2 alors que les états de Bell optimisent S = 2√2 en choisissant des angles séparés de 45°. Les expériences modernes ferment progressivement les principales échappatoires."
        }
      ],
      "animation": {
        "description": "Réglez quatre angles de polariseurs et observez la valeur de S comparée à la limite classique.",
        "controls": [
          {
            "id": "angleA",
            "label": "a",
            "type": "range",
            "min": 0,
            "max": 180,
            "step": 1,
            "value": 0,
            "unit": "°"
          },
          {
            "id": "angleAprime",
            "label": "a'",
            "type": "range",
            "min": 0,
            "max": 180,
            "step": 1,
            "value": 90,
            "unit": "°"
          },
          {
            "id": "angleB",
            "label": "b",
            "type": "range",
            "min": 0,
            "max": 180,
            "step": 1,
            "value": 45,
            "unit": "°"
          },
          {
            "id": "angleBprime",
            "label": "b'",
            "type": "range",
            "min": 0,
            "max": 180,
            "step": 1,
            "value": 135,
            "unit": "°"
          }
        ],
        "parameters": {
          "sampleSize": 400
        },
        "sketch": {
          "library": "p5",
          "code": "(() => {\n  const corrValue = (a, b) => -Math.cos(((a - b) * Math.PI) / 180);\n  return {\n    setup() {},\n    draw({ p, state, helpers }) {\n      const width = p.width;\n      const height = p.height;\n      const angles = {\n        angleA: state.angleA || 0,\n        angleAprime: state.angleAprime || 0,\n        angleB: state.angleB || 0,\n        angleBprime: state.angleBprime || 0\n      };\n      p.background(8, 10, 18, 245);\n      const sValue = helpers.physics.bellCHSH(angles);\n      const correlations = [\n        { label: `E(a, b)`, value: corrValue(angles.angleA, angles.angleB) },\n        { label: `E(a, b')`, value: corrValue(angles.angleA, angles.angleBprime) },\n        { label: `E(a', b)`, value: corrValue(angles.angleAprime, angles.angleB) },\n        { label: `E(a', b')`, value: corrValue(angles.angleAprime, angles.angleBprime) }\n      ];\n      p.noStroke();\n      p.fill(58, 215, 255, 180);\n      p.textAlign(p.LEFT, p.TOP);\n      p.textSize(14);\n      p.text(`S = ${sValue.toFixed(2)}`, 20, 20);\n      p.text('Limite classique |S| ≤ 2', 20, 40);\n      const gaugeWidth = width * 0.6;\n      const gaugeX = width * 0.2;\n      const gaugeY = height * 0.2;\n      const gaugeHeight = 12;\n      p.fill(25, 36, 58, 200);\n      p.rect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, 10);\n      const normalized = Math.min(Math.abs(sValue) / (2 * Math.sqrt(2)), 1);\n      p.fill(58, 215, 255, 220);\n      p.rect(gaugeX, gaugeY, gaugeWidth * normalized, gaugeHeight, 10);\n      p.textAlign(p.CENTER, p.TOP);\n      p.text('|S|/2√2', gaugeX + gaugeWidth / 2, gaugeY + 16);\n      const baseX = width * 0.18;\n      const baseY = height * 0.75;\n      const barWidth = width * 0.16;\n      const scale = height * 0.25;\n      correlations.forEach((corr, index) => {\n        const x = baseX + index * (barWidth + 12);\n        const barHeight = corr.value * scale;\n        p.fill(25, 36, 58, 200);\n        p.rect(x, baseY - scale, barWidth, scale * 2, 12);\n        p.fill(58, 215, 255, 200);\n        p.rect(x, baseY, barWidth, -barHeight, 12);\n        p.textAlign(p.CENTER, p.TOP);\n        p.text(`${corr.label} = ${corr.value.toFixed(2)}`, x + barWidth / 2, baseY + 16);\n      });\n      p.stroke(255, 100, 120, 180);\n      p.strokeWeight(2);\n      const classicalX = gaugeX + (Math.min(Math.abs(2) / (2 * Math.sqrt(2)), 1) * gaugeWidth);\n      p.line(classicalX, gaugeY - 6, classicalX, gaugeY + gaugeHeight + 6);\n    },\n    update({ state, key, value }) {\n      state[key] = value;\n    },\n    replay() {}\n  };\n})()"
        }
      }
    }
  }
};
