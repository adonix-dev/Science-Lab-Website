export default class AgentAnimation {
  constructor(bus, physics) {
    this.bus = bus;
    this.physics = physics;
    this.container = null;
    this.currentSketch = null;
    this.currentConfig = null;
    this.state = {};
  }

  init() {
    this.container = document.getElementById('animationContainer');
    this.bus.on('interface:experiment', ({ phenomenon }) => this.loadAnimation(phenomenon));
    this.bus.on('ui:change', ({ id, value }) => this.updateParameter(id, value));
  }

  dispose() {
    this.destroySketch();
    this.container = null;
  }

  loadAnimation(phenomenon) {
    if (!this.container || !phenomenon) return;
    this.destroySketch();
    const config = this.getConfig(phenomenon.id);
    if (!config) {
      this.container.innerHTML = '<p>Animation en cours de préparation.</p>';
      return;
    }
    this.currentConfig = config;
    this.state = { ...config.initialState };
    this.bus.emit('animation:controls', config.controls(this.state));
    const sketchFactory = config.sketch;
    const animationBus = this.bus;
    const physics = this.physics;
    const state = this.state;
    const self = this;
    this.currentSketch = new window.p5((p) => sketchFactory({ p, state, physics, bus: animationBus, config: self.currentConfig, container: self.container }));
    this.bus.emit('animation:loaded', { id: phenomenon.id });
  }

  updateParameter(id, value) {
    if (!this.currentConfig) return;
    this.state[id] = value;
    if (typeof this.currentConfig.onParamChange === 'function') {
      this.currentConfig.onParamChange({ id, value, state: this.state, physics: this.physics });
    }
    this.bus.emit('animation:updated', { id, value });
  }

  destroySketch() {
    if (this.currentSketch) {
      this.currentSketch.remove();
      this.currentSketch = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  getConfig(id) {
    const format = (unit, digits = 2) => (value) => `${value.toFixed(digits)}${unit}`;
    const configs = {
      'effet-tunnel': {
        initialState: { energy: 1.5, barrierHeight: 3, barrierWidth: 0.2 },
        controls: (state) => [
          { id: 'energy', label: 'Énergie (eV)', min: 0.5, max: 4, step: 0.1, value: state.energy, format: format(' eV', 1) },
          { id: 'barrierHeight', label: 'Hauteur V₀ (eV)', min: 1.5, max: 6, step: 0.1, value: state.barrierHeight, format: format(' eV', 1) },
          { id: 'barrierWidth', label: 'Largeur L (nm)', min: 0.05, max: 0.4, step: 0.01, value: state.barrierWidth, format: format(' nm', 2) },
        ],
        onParamChange: () => {},
        sketch: ({ p, state, physics }) => {
          let t = 0;
          p.setup = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.createCanvas(parent.offsetWidth, 280);
          };
          p.windowResized = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.resizeCanvas(parent.offsetWidth, 280);
          };
          p.draw = () => {
            t += 0.01;
            p.background(12, 16, 24);
            p.noFill();
            p.stroke(50, 213, 255, 150);
            const margin = 32;
            const width = p.width - margin * 2;
            const height = p.height - margin * 2;
            const barrierStart = margin + width * 0.45;
            const barrierEnd = barrierStart + width * state.barrierWidth;
            p.strokeWeight(2);
            p.beginShape();
            const wave = physics.computeWavePacket({
              barrierPosition: 0.45,
              barrierWidth: state.barrierWidth,
              barrierHeight: state.barrierHeight,
              energy: state.energy,
              resolution: 240,
            });
            wave.forEach((point, index) => {
              const x = margin + index / (wave.length - 1) * width;
              const y = p.height / 2 - point.amplitude * height * 0.4 * Math.sin(t + index * 0.05);
              p.vertex(x, y);
            });
            p.endShape();
            p.noStroke();
            p.fill(50, 213, 255, 60);
            p.rect(barrierStart, margin, barrierEnd - barrierStart, height);
            const transmission = physics.computeTunnelTransmission({
              energy: state.energy,
              barrierHeight: state.barrierHeight,
              barrierWidth: state.barrierWidth,
            });
            p.fill(255);
            p.textAlign(p.LEFT, p.TOP);
            p.text(`Transmission T ≈ ${(transmission * 100).toFixed(1)}%`, margin, margin);
          };
        },
      },
      'fentes-de-young': {
        initialState: { visibility: 1, phase: 0, detector: 0 },
        controls: (state) => [
          { id: 'visibility', label: 'Ouverture des fentes', min: 0, max: 1, step: 0.05, value: state.visibility, format: (v) => `${Math.round(v * 100)}%` },
          { id: 'phase', label: 'Décalage de phase', min: 0, max: Math.PI * 2, step: 0.1, value: state.phase, format: (v) => `${(v).toFixed(2)} rad` },
          { id: 'detector', label: 'Détecteur de chemin', min: 0, max: 1, step: 1, value: state.detector, format: (v) => (v ? 'Activé' : 'Off') },
        ],
        onParamChange: ({ id, value, state }) => {
          if (id === 'detector') {
            state.visibility = value ? 0.1 : Math.max(state.visibility, 0.2);
          }
          state.__needsUpdate = true;
        },
        sketch: ({ p, state, physics }) => {
          let points = [];
          let time = 0;
          const regenerate = () => {
            points = physics.computeInterferencePattern({
              phase: state.phase,
              visibility: state.visibility,
              resolution: 320,
            });
          };
          p.setup = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.createCanvas(parent.offsetWidth, 280);
            regenerate();
          };
          p.windowResized = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.resizeCanvas(parent.offsetWidth, 280);
          };
          p.draw = () => {
            time += 0.01;
            if (state.__needsUpdate || Math.random() < 0.02) {
              regenerate();
              state.__needsUpdate = false;
            }
            p.background(12, 16, 24);
            p.noStroke();
            const margin = 40;
            const width = p.width - margin * 2;
            points.forEach((pt) => {
              const x = margin + ((pt.x + 3) / 6) * width;
              const intensity = Math.pow(pt.intensity, state.detector ? 0.7 : 1);
              const y = margin + (1 - intensity) * (p.height - margin * 2);
              const size = 6 + intensity * 24 * (0.5 + Math.sin(time * 3 + pt.x) * 0.5);
              p.fill(50, 213, 255, 120 + intensity * 135);
              p.circle(x, y, size * state.visibility);
            });
            p.fill(255);
            p.textAlign(p.LEFT, p.TOP);
            const coherence = state.detector ? 'Incohérence : détecteur activé' : 'Interférences cohérentes';
            p.text(coherence, margin, margin);
          };
        },
      },
      'stern-gerlach': {
        initialState: { angle: 0 },
        controls: (state) => [
          { id: 'angle', label: 'Orientation (°)', min: -90, max: 90, step: 1, value: state.angle, format: format('°', 0) },
        ],
        sketch: ({ p, state, physics }) => {
          p.setup = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.createCanvas(parent.offsetWidth, 280);
          };
          p.windowResized = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.resizeCanvas(parent.offsetWidth, 280);
          };
          p.draw = () => {
            const { up, down } = physics.computeSternGerlach({ angle: state.angle });
            p.background(12, 16, 24);
            p.noStroke();
            const beamX = p.width * 0.25;
            for (let i = 0; i < 120; i += 1) {
              const y = p.height / 2 + Math.sin(i * 0.3 + p.frameCount * 0.05) * 20;
              p.fill(90, 156, 255, 80);
              p.circle(beamX + (i % 5) * 2, y, 6);
            }
            const magnetAngle = (state.angle * Math.PI) / 180;
            p.push();
            p.translate(p.width * 0.5, p.height / 2);
            p.rotate(magnetAngle / 4);
            p.fill(26, 40, 64);
            p.rect(-50, -110, 40, 220, 12);
            p.rect(10, -110, 40, 220, 12);
            p.pop();
            const branchX = p.width * 0.75;
            const spread = 120;
            for (let i = 0; i < 80; i += 1) {
              const targetY = p.height / 2 - spread * (Math.random() < up ? 0.5 : -0.5);
              const startX = beamX + (branchX - beamX) * (i / 80);
              const startY = p.height / 2;
              p.stroke(50, 213, 255, 80);
              p.line(startX, startY, branchX, targetY);
            }
            p.noStroke();
            p.fill(255);
            p.textAlign(p.LEFT, p.TOP);
            p.text(`Probabilité spin ↑ : ${(up * 100).toFixed(0)}%`, 24, 24);
            p.text(`Probabilité spin ↓ : ${(down * 100).toFixed(0)}%`, 24, 48);
          };
        },
      },
      'mach-zehnder': {
        initialState: { phase: Math.PI / 2 },
        controls: (state) => [
          { id: 'phase', label: 'Phase Δφ (rad)', min: 0, max: Math.PI * 2, step: 0.05, value: state.phase, format: (v) => `${v.toFixed(2)} rad` },
        ],
        sketch: ({ p, state, physics }) => {
          p.setup = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.createCanvas(parent.offsetWidth, 280);
          };
          p.windowResized = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.resizeCanvas(parent.offsetWidth, 280);
          };
          p.draw = () => {
            p.background(12, 16, 24);
            p.stroke(80, 140, 220);
            p.strokeWeight(4);
            const startX = 60;
            const midX = p.width / 2;
            const endX = p.width - 80;
            const midY = p.height / 2;
            const offset = 60;
            p.noFill();
            p.bezier(startX, midY, midX - 80, midY - offset, midX, midY - offset, endX, midY - offset);
            p.bezier(startX, midY, midX - 80, midY + offset, midX, midY + offset, endX, midY + offset);
            const { p1, p2 } = physics.computeMachZehnder({ phase: state.phase });
            p.noStroke();
            p.fill(50, 213, 255, 180);
            p.circle(startX, midY, 20 + Math.sin(p.frameCount * 0.1) * 5);
            const barWidth = 28;
            p.rect(endX + 20, midY - offset - p1 * 80, barWidth, p1 * 160);
            p.rect(endX + 20, midY + offset - p2 * 80, barWidth, p2 * 160);
            p.fill(255);
            p.textAlign(p.LEFT, p.TOP);
            p.text(`Détecteur 1 : ${(p1 * 100).toFixed(0)}%`, endX + 60, midY - offset - 20);
            p.text(`Détecteur 2 : ${(p2 * 100).toFixed(0)}%`, endX + 60, midY + offset - 20);
          };
        },
      },
      'effet-photoelectrique': {
        initialState: { frequency: 7e14, threshold: 5.2 },
        controls: (state) => [
          { id: 'frequency', label: 'Fréquence ν (Hz)', min: 4e14, max: 1e15, step: 1e13, value: state.frequency, format: (v) => `${(v / 1e14).toFixed(1)} ×10¹⁴ Hz` },
        ],
        onParamChange: ({ state }) => {
          state.frequency = Math.max(state.frequency, 0);
        },
        sketch: ({ p, state, physics }) => {
          p.setup = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.createCanvas(parent.offsetWidth, 280);
          };
          p.windowResized = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.resizeCanvas(parent.offsetWidth, 280);
          };
          p.draw = () => {
            const { emitted, kinetic } = physics.computePhotoelectric({ frequency: state.frequency, threshold: state.threshold });
            p.background(12, 16, 24);
            p.noStroke();
            p.fill(80, 80, 90);
            p.rect(40, p.height - 70, p.width - 80, 40, 12);
            p.fill(50, 213, 255, 160);
            for (let i = 0; i < 40; i += 1) {
              const x = 60 + (i / 40) * (p.width - 120);
              const y = 80 + Math.sin(p.frameCount * 0.05 + i) * 12;
              p.ellipse(x, y, 12, 12);
            }
            if (emitted) {
              p.fill(120, 255, 200, 200);
              for (let i = 0; i < 18; i += 1) {
                const speed = kinetic * 12;
                const x = 80 + (p.frameCount * 2 + i * 20) % (p.width - 160);
                const y = p.height - 90 - (i % 4) * 18 - speed * 0.5;
                p.circle(x, y, 10 + kinetic * 3);
              }
            }
            p.fill(255);
            p.textAlign(p.LEFT, p.TOP);
            p.text(`hν = ${(4.135667696e-15 * state.frequency).toFixed(2)} eV`, 40, 24);
            p.text(`Seuil W = ${state.threshold.toFixed(1)} eV`, 40, 44);
            p.text(emitted ? `Émission ✓  Ecₘₐₓ = ${kinetic.toFixed(2)} eV` : "Pas d'émission — fréquence trop basse", 40, 64);
          };
        },
      },
      intrication: {
        initialState: { angleA: 0, angleB: 45 },
        controls: (state) => [
          { id: 'angleA', label: 'Polariseur A (°)', min: -90, max: 90, step: 5, value: state.angleA, format: format('°', 0) },
          { id: 'angleB', label: 'Polariseur B (°)', min: -90, max: 90, step: 5, value: state.angleB, format: format('°', 0) },
        ],
        sketch: ({ p, state, physics }) => {
          p.setup = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.createCanvas(parent.offsetWidth, 280);
          };
          p.windowResized = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.resizeCanvas(parent.offsetWidth, 280);
          };
          p.draw = () => {
            const { correlation } = physics.computeIntricationCorrelation({ angleA: state.angleA, angleB: state.angleB });
            p.background(12, 16, 24);
            p.translate(p.width / 2, p.height / 2);
            p.stroke(255);
            p.noFill();
            const radius = Math.min(p.width, p.height) / 3;
            p.circle(0, 0, radius * 2);
            const drawPolariser = (angle, color) => {
              p.push();
              p.rotate((angle * Math.PI) / 180);
              p.stroke(color);
              p.line(-radius, 0, radius, 0);
              p.pop();
            };
            drawPolariser(state.angleA, p.color(50, 213, 255));
            drawPolariser(state.angleB, p.color(120, 255, 200));
            p.noStroke();
            p.fill(255);
            p.textAlign(p.CENTER, p.BOTTOM);
            p.text(`Corrélation = ${correlation.toFixed(2)}`, 0, radius + 20);
            const coincidences = 0.5 * (1 - correlation);
            p.textAlign(p.CENTER, p.TOP);
            p.text(`Coïncidences ≈ ${(coincidences * 100).toFixed(0)}%`, 0, -radius - 40);
          };
        },
      },
      'inegalites-bell': {
        initialState: { a: 0, aPrime: 45, b: 22.5, bPrime: -22.5 },
        controls: (state) => [
          { id: 'a', label: 'a (°)', min: -90, max: 90, step: 5, value: state.a, format: format('°', 0) },
          { id: 'aPrime', label: "a' (°)", min: -90, max: 90, step: 5, value: state.aPrime, format: format('°', 0) },
          { id: 'b', label: 'b (°)', min: -90, max: 90, step: 5, value: state.b, format: format('°', 0) },
          { id: 'bPrime', label: "b' (°)", min: -90, max: 90, step: 5, value: state.bPrime, format: format('°', 0) },
        ],
        sketch: ({ p, state, physics }) => {
          p.setup = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.createCanvas(parent.offsetWidth, 280);
          };
          p.windowResized = () => {
            const parent = p._userNode.parentElement || p._userNode;
            p.resizeCanvas(parent.offsetWidth, 280);
          };
          p.draw = () => {
            const { S, classicalLimit } = physics.computeBellCHSH({
              a: state.a,
              aPrime: state.aPrime,
              b: state.b,
              bPrime: state.bPrime,
            });
            p.background(12, 16, 24);
            p.fill(255);
            p.textAlign(p.LEFT, p.TOP);
            p.text(`|S| = ${S.toFixed(2)}`, 32, 24);
            p.text(`Limite classique = ${classicalLimit.toFixed(0)}`, 32, 44);
            const margin = 80;
            const width = p.width - margin * 2;
            const base = p.height - 80;
            p.stroke(255, 255, 255, 40);
            p.strokeWeight(2);
            p.line(margin, base - classicalLimit * 40, margin + width, base - classicalLimit * 40);
            p.noStroke();
            p.fill(50, 213, 255, 180);
            p.rect(margin, base - S * 40, width, S * 40, 12);
          };
        },
      },
    };
    return configs[id];
  }
}
