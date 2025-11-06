export class AgentAnimation {
  constructor(bus, physics) {
    this.bus = bus;
    this.physics = physics;
    this.pageType = this.detectPageType();
    this.currentSketch = null;
    this.currentId = null;
    this.state = {};
    this.loopFrame = 0;
    this.animations = this.createAnimationDefinitions();
  }

  detectPageType() {
    const path = window.location.pathname;
    return path.includes('/experiments/') ? 'experiment' : 'index';
  }

  init() {
    if (this.pageType !== 'experiment') return;

    this.bus.on('data:ready', () => {
      this.mountCurrentExperiment();
    });

    this.bus.on('ui:change', ({ key, value }) => {
      if (!this.currentId) return;
      this.state[key] = value;
      const definition = this.animations[this.currentId];
      if (definition && typeof definition.onStateChange === 'function') {
        definition.onStateChange(this.state, this.currentSketch, this.physics);
      }
      this.bus.emit('animation:updated', { id: this.currentId, state: this.state });
    });

    this.bus.on('interface:replay', () => {
      if (this.currentSketch && typeof this.currentSketch.reset === 'function') {
        this.currentSketch.reset();
      }
    });
  }

  mountCurrentExperiment() {
    const experimentId = document.body.dataset.experimentId;
    const definition = this.animations[experimentId];
    this.currentId = experimentId;
    if (!definition) {
      console.warn(`[AgentAnimation] Aucune animation pour ${experimentId}`);
      return;
    }

    this.state = { ...definition.initialState };
    const container = document.querySelector('[data-canvas]');
    if (!container) return;

    if (this.currentSketch && this.currentSketch.remove) {
      this.currentSketch.remove();
    }

    const sketchFactory = (p) => definition.sketch(p, this.state, this.physics, container);
    this.currentSketch = new window.p5(sketchFactory, container);
    if (typeof definition.postCreate === 'function') {
      definition.postCreate(this.currentSketch);
    }

    this.bus.emit('animation:loaded', {
      id: experimentId,
      controls: definition.controls,
      state: this.state
    });
  }

  getControlsFor(id) {
    return this.animations[id]?.controls || [];
  }

  createAnimationDefinitions() {
    const gradientBackground = (p, alpha = 180) => {
      const topColor = p.color(12, 18, 28, alpha);
      const bottomColor = p.color(6, 8, 12, alpha);
      for (let y = 0; y < p.height; y++) {
        const inter = p.map(y, 0, p.height, 0, 1);
        const c = p.lerpColor(topColor, bottomColor, inter);
        p.stroke(c);
        p.line(0, y, p.width, y);
      }
    };

    return {
      'effet-tunnel': {
        initialState: {
          energy: 3,
          barrierHeight: 5,
          barrierWidth: 1.5
        },
        controls: [
          { key: 'energy', label: 'Énergie incidente', min: 1, max: 6, step: 0.1, type: 'range', unit: 'E₀' },
          { key: 'barrierHeight', label: 'Hauteur de barrière', min: 2, max: 8, step: 0.1, type: 'range', unit: 'V₀' },
          { key: 'barrierWidth', label: 'Épaisseur de barrière', min: 0.5, max: 3, step: 0.1, type: 'range', unit: 'L' }
        ],
        sketch: (p, state, physics, container) => {
          let phase = 0;
          const getParentWidth = () => {
            if (!container) return window.innerWidth || 720;
            return container.clientWidth || container.offsetWidth || 720;
          };
          p.setup = () => {
            const canvas = p.createCanvas(getParentWidth(), 360);
            canvas.style('width', '100%');
          };
          p.windowResized = () => {
            p.resizeCanvas(getParentWidth(), 360);
          };
          p.draw = () => {
            p.background(9, 12, 20);
            gradientBackground(p, 220);
            phase += 0.04;
            const barrierPixels = p.map(state.barrierWidth, 0.5, 3, 60, 220);
            const barrierX = p.width * 0.5;
            p.noStroke();
            p.fill(40, 205, 255, 160);
            p.rect(barrierX, p.height * 0.1, barrierPixels, p.height * 0.8, 12);

            const transmission = physics.computeTunnelTransmission({
              energy: state.energy,
              barrierHeight: state.barrierHeight,
              barrierWidth: state.barrierWidth
            });

            const amplitude = p.map(state.energy, 1, 6, 40, 90);
            const samples = 260;
            p.noFill();
            p.strokeWeight(2);

            p.stroke(58, 215, 255);
            p.beginShape();
            for (let i = 0; i < samples; i++) {
              const x = p.map(i, 0, samples - 1, 0, barrierX);
              const y = p.height / 2 + Math.sin(phase + i * 0.18) * amplitude * Math.exp(-(barrierX - x) / 400);
              p.vertex(x, y);
            }
            p.endShape();

            p.stroke(80, 250, 210, 200);
            p.beginShape();
            for (let i = 0; i < samples; i++) {
              const x = p.map(i, 0, samples - 1, barrierX + barrierPixels, p.width);
              const attenuation = transmission;
              const y = p.height / 2 + Math.sin(phase + i * 0.18) * amplitude * attenuation;
              p.vertex(x, y);
            }
            p.endShape();

            p.fill(162, 205, 255, 80);
            p.noStroke();
            p.textSize(14);
            p.text(`Transmission estimée : ${(transmission * 100).toFixed(1)}%`, 20, 28);
          };

          p.reset = () => {
            phase = 0;
          };
        },
        onStateChange: (_, sketch) => {
          if (sketch && typeof sketch.reset === 'function') {
            sketch.reset();
          }
        }
      },
      'fentes-de-young': {
        initialState: {
          slitOpen: 1,
          detector: 0
        },
        controls: [
          { key: 'slitOpen', label: 'Nombre de fentes ouvertes', min: 1, max: 2, step: 1, type: 'range' },
          { key: 'detector', label: 'Détecteur de chemin', min: 0, max: 1, step: 1, type: 'range' }
        ],
        sketch: (p, state, _physics, container) => {
          const impacts = [];
          const getParentWidth = () => {
            if (!container) return window.innerWidth || 720;
            return container.clientWidth || container.offsetWidth || 720;
          };
          p.setup = () => {
            const canvas = p.createCanvas(getParentWidth(), 360);
            canvas.style('width', '100%');
          };
          p.windowResized = () => {
            p.resizeCanvas(getParentWidth(), 360);
          };
          p.draw = () => {
            p.background(8, 11, 18);
            gradientBackground(p, 200);

            p.stroke(58, 215, 255, 160);
            p.strokeWeight(4);
            p.line(p.width * 0.35, p.height * 0.2, p.width * 0.35, p.height * 0.8);
            if (state.slitOpen >= 1) {
              p.strokeWeight(6);
              p.line(p.width * 0.35, p.height * 0.35, p.width * 0.35, p.height * 0.42);
            }
            if (state.slitOpen >= 2) {
              p.strokeWeight(6);
              p.line(p.width * 0.35, p.height * 0.58, p.width * 0.35, p.height * 0.65);
            }

            if (impacts.length < 600) {
              const x = p.random(p.width * 0.55, p.width * 0.95);
              const baseY = p.random(0, p.height);
              let weight = 1;
              if (state.slitOpen === 2 && state.detector === 0) {
                const interference = (1 + Math.cos((x / p.width) * Math.PI * 12)) / 2;
                weight = Math.pow(interference, 2);
              }
              if (state.slitOpen === 1) {
                weight = Math.exp(-Math.pow(baseY - p.height / 2, 2) / 20000);
              }
              impacts.push({
                x,
                y: baseY,
                alpha: p.map(weight, 0, 1, 40, 220)
              });
            }

            impacts.forEach((impact) => {
              p.noStroke();
              p.fill(58, 215, 255, impact.alpha);
              p.circle(impact.x, impact.y, 4);
              impact.alpha = Math.min(255, impact.alpha + 0.4);
            });

            if (state.detector === 1) {
              p.noStroke();
              p.fill(255, 120, 120, 180);
              p.rect(p.width * 0.42, p.height * 0.25, 8, p.height * 0.5, 4);
            }
          };

          p.reset = () => {
            impacts.length = 0;
          };
        },
        onStateChange: (_, sketch) => {
          if (sketch && typeof sketch.reset === 'function') {
            sketch.reset();
          }
        }
      },
      'mach-zehnder': {
        initialState: {
          phase: 0
        },
        controls: [
          { key: 'phase', label: 'Différence de phase (°)', min: 0, max: 360, step: 1, type: 'range' }
        ],
        sketch: (p, state, _physics, container) => {
          const getParentWidth = () => {
            if (!container) return window.innerWidth || 720;
            return container.clientWidth || container.offsetWidth || 720;
          };
          p.setup = () => {
            const canvas = p.createCanvas(getParentWidth(), 320);
            canvas.style('width', '100%');
          };
          p.windowResized = () => {
            p.resizeCanvas(getParentWidth(), 320);
          };
          p.draw = () => {
            p.background(10, 13, 22);
            gradientBackground(p, 180);
            p.noFill();
            p.stroke(58, 215, 255);
            p.strokeWeight(3);
            const midY = p.height / 2;
            p.line(60, midY, p.width - 60, midY);

            const intensity1 = Math.pow(Math.cos((state.phase * Math.PI) / 360), 2);
            const intensity2 = Math.pow(Math.sin((state.phase * Math.PI) / 360), 2);

            p.fill(58, 215, 255, 160);
            p.rect(p.width - 120, midY - 80, 40, 160, 12);
            p.fill(58, 215, 255, p.map(intensity1, 0, 1, 40, 220));
            p.circle(p.width - 100, midY - 60, p.map(intensity1, 0, 1, 10, 42));
            p.circle(p.width - 100, midY + 60, p.map(intensity2, 0, 1, 10, 42));

            p.noStroke();
            p.fill(162, 205, 255);
            p.textSize(14);
            p.text(`Détecteur 1 : ${(intensity1 * 100).toFixed(0)}%`, 40, 40);
            p.text(`Détecteur 2 : ${(intensity2 * 100).toFixed(0)}%`, 40, 64);
          };

          p.reset = () => {};
        },
        onStateChange: () => {}
      },
      'effet-photoelectrique': {
        initialState: {
          frequency: 6.5,
          workFunction: 5.5
        },
        controls: [
          { key: 'frequency', label: 'Fréquence lumineuse (10¹⁴ Hz)', min: 4, max: 9, step: 0.1, type: 'range' },
          { key: 'workFunction', label: 'Travail d’extraction (10⁻¹⁹ J)', min: 3, max: 7, step: 0.1, type: 'range' }
        ],
        sketch: (p, state, physics, container) => {
          const electrons = [];
          const getParentWidth = () => {
            if (!container) return window.innerWidth || 720;
            return container.clientWidth || container.offsetWidth || 720;
          };
          p.setup = () => {
            const canvas = p.createCanvas(getParentWidth(), 320);
            canvas.style('width', '100%');
          };
          p.windowResized = () => {
            p.resizeCanvas(getParentWidth(), 320);
          };
          p.draw = () => {
            p.background(8, 12, 18);
            gradientBackground(p, 200);
            p.fill(70, 80, 120, 220);
            p.rect(0, p.height - 80, p.width, 80);

            const frequencyReal = state.frequency * 1e14;
            const workReal = state.workFunction * 1e-19;
            const kinetic = physics.computePhotoelectricKineticEnergy({
              frequency: frequencyReal,
              workFunction: workReal
            });
            const emission = kinetic > 0;

            if (p.frameCount % 6 === 0) {
              electrons.push({
                x: p.random(p.width * 0.2, p.width * 0.8),
                y: p.height - 90,
                vy: emission ? -p.random(2, 4 + kinetic * 1e18) : 0,
                alpha: 255
              });
            }
            if (electrons.length > 120) {
              electrons.splice(0, electrons.length - 120);
            }

            p.noStroke();
            electrons.forEach((electron) => {
              if (emission) {
                electron.y += electron.vy;
                electron.alpha = Math.max(40, electron.alpha - 2);
              } else {
                electron.alpha = Math.max(20, electron.alpha - 4);
              }
              p.fill(58, 215, 255, electron.alpha);
              p.circle(electron.x, electron.y, 6);
            });

            p.fill(emission ? p.color(58, 215, 255) : p.color(180, 90, 90));
            p.textSize(14);
            p.text(`Émission : ${emission ? 'Oui' : 'Non'}`, 20, 30);
            p.text(`Énergie cinétique max : ${(kinetic * 1e19).toFixed(2)} ×10⁻¹⁹ J`, 20, 52);
          };

          p.reset = () => {
            electrons.length = 0;
          };
        },
        onStateChange: (_, sketch) => {
          if (sketch && typeof sketch.reset === 'function') {
            sketch.reset();
          }
        }
      },
      'stern-gerlach': {
        initialState: {
          angle: 0
        },
        controls: [
          { key: 'angle', label: 'Orientation du champ (°)', min: -90, max: 90, step: 1, type: 'range' }
        ],
        sketch: (p, state, _physics, container) => {
          const particles = [];
          const getParentWidth = () => {
            if (!container) return window.innerWidth || 720;
            return container.clientWidth || container.offsetWidth || 720;
          };
          p.setup = () => {
            const canvas = p.createCanvas(getParentWidth(), 320);
            canvas.style('width', '100%');
          };
          p.windowResized = () => {
            p.resizeCanvas(getParentWidth(), 320);
          };
          p.draw = () => {
            p.background(10, 14, 22);
            gradientBackground(p, 190);
            p.push();
            p.translate(p.width * 0.3, p.height * 0.5);
            p.rotate((state.angle * Math.PI) / 180);
            p.fill(70, 90, 160, 160);
            p.noStroke();
            p.rect(-40, -120, 80, 240, 12);
            p.pop();

            if (p.frameCount % 5 === 0) {
              particles.push({
                x: p.width * 0.1,
                y: p.height / 2,
                vx: 2.2,
                vy: Math.random() > 0.5 ? -2 : 2,
                alpha: 255
              });
            }
            if (particles.length > 200) particles.splice(0, particles.length - 200);

            particles.forEach((particle) => {
              particle.x += particle.vx;
              particle.y += particle.vy + Math.sin((state.angle * Math.PI) / 180) * 0.5;
              particle.alpha = Math.max(60, particle.alpha - 2);
              p.noStroke();
              p.fill(58, 215, 255, particle.alpha);
              p.circle(particle.x, particle.y, 6);
            });
          };

          p.reset = () => {
            particles.length = 0;
          };
        },
        onStateChange: (_, sketch) => {
          if (sketch && typeof sketch.reset === 'function') {
            sketch.reset();
          }
        }
      },
      intrication: {
        initialState: {
          angleA: 0,
          angleB: 45
        },
        controls: [
          { key: 'angleA', label: 'Polariseur A (°)', min: 0, max: 180, step: 1, type: 'range' },
          { key: 'angleB', label: 'Polariseur B (°)', min: 0, max: 180, step: 1, type: 'range' }
        ],
        sketch: (p, state, physics, container) => {
          const getParentWidth = () => {
            if (!container) return window.innerWidth || 720;
            return container.clientWidth || container.offsetWidth || 720;
          };
          p.setup = () => {
            const canvas = p.createCanvas(getParentWidth(), 320);
            canvas.style('width', '100%');
          };
          p.windowResized = () => {
            p.resizeCanvas(getParentWidth(), 320);
          };
          p.draw = () => {
            p.background(6, 10, 18);
            gradientBackground(p, 200);
            const centerY = p.height / 2;
            const leftX = p.width * 0.3;
            const rightX = p.width * 0.7;

            p.noFill();
            p.stroke(58, 215, 255, 200);
            p.strokeWeight(3);
            p.bezier(leftX, centerY, p.width * 0.45, centerY - 80, p.width * 0.55, centerY + 80, rightX, centerY);

            const corr = physics.computeBellCorrelation(state.angleA, state.angleB);
            const intensity = Math.abs(corr);

            p.noStroke();
            p.fill(58, 215, 255, 120 + intensity * 120);
            p.circle(leftX, centerY, 80);
            p.circle(rightX, centerY, 80);

            p.push();
            p.translate(leftX, centerY);
            p.rotate((state.angleA * Math.PI) / 180);
            p.fill(50, 80, 160, 200);
            p.rect(-8, -50, 16, 100, 6);
            p.pop();

            p.push();
            p.translate(rightX, centerY);
            p.rotate((state.angleB * Math.PI) / 180);
            p.fill(50, 80, 160, 200);
            p.rect(-8, -50, 16, 100, 6);
            p.pop();

            p.fill(162, 205, 255);
            p.textSize(14);
            p.text(`Corrélation cosinus : ${corr.toFixed(2)}`, 20, 30);
          };

          p.reset = () => {};
        },
        onStateChange: () => {}
      },
      'inegalites-bell': {
        initialState: {
          angleA: 0,
          angleB: 45,
          angleAprime: 90,
          angleBprime: 135
        },
        controls: [
          { key: 'angleA', label: 'a (°)', min: 0, max: 180, step: 1, type: 'range' },
          { key: 'angleAprime', label: "a' (°)", min: 0, max: 180, step: 1, type: 'range' },
          { key: 'angleB', label: 'b (°)', min: 0, max: 180, step: 1, type: 'range' },
          { key: 'angleBprime', label: "b' (°)", min: 0, max: 180, step: 1, type: 'range' }
        ],
        sketch: (p, state, physics, container) => {
          const getParentWidth = () => {
            if (!container) return window.innerWidth || 720;
            return container.clientWidth || container.offsetWidth || 720;
          };
          p.setup = () => {
            const canvas = p.createCanvas(getParentWidth(), 340);
            canvas.style('width', '100%');
          };
          p.windowResized = () => {
            p.resizeCanvas(getParentWidth(), 340);
          };
          p.draw = () => {
            p.background(8, 11, 19);
            gradientBackground(p, 200);
            const corr = (a, b) => physics.computeBellCorrelation(a, b);
            const s =
              corr(state.angleA, state.angleB) +
              corr(state.angleA, state.angleBprime) +
              corr(state.angleAprime, state.angleB) -
              corr(state.angleAprime, state.angleBprime);

            p.fill(162, 205, 255);
            p.textSize(14);
            p.text(`Paramètre S (CHSH) : ${s.toFixed(2)}`, 24, 36);
            p.text('Limite classique : |S| ≤ 2', 24, 58);

            const gaugeWidth = p.width - 120;
            const gaugeX = 60;
            const gaugeY = 120;
            p.noFill();
            p.stroke(58, 215, 255, 140);
            p.strokeWeight(3);
            p.rect(gaugeX, gaugeY, gaugeWidth, 40, 12);
            const normalized = p.constrain((Math.abs(s) / (2 * Math.sqrt(2))), 0, 1);
            p.noStroke();
            p.fill(58, 215, 255, 180);
            p.rect(gaugeX + 4, gaugeY + 4, (gaugeWidth - 8) * normalized, 32, 10);

            p.text(`Quantum : 2√2 ≈ ${(2 * Math.sqrt(2)).toFixed(2)}`, 24, gaugeY + 80);
          };

          p.reset = () => {};
        },
        onStateChange: () => {}
      }
    };
  }

  dispose() {
    if (this.currentSketch && this.currentSketch.remove) {
      this.currentSketch.remove();
    }
    this.currentSketch = null;
  }
}
