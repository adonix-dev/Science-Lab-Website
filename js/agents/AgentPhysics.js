export default class AgentPhysics {
  constructor(bus) {
    this.bus = bus;
  }

  init() {}

  dispose() {}

  computeTunnelTransmission({ energy, barrierHeight, barrierWidth }) {
    const m = 9.11e-31;
    const hbar = 1.055e-34;
    const eV = 1.602e-19;
    const E = energy * eV;
    const V0 = barrierHeight * eV;
    if (E >= V0) {
      return 1;
    }
    const kappa = Math.sqrt(Math.max(2 * m * (V0 - E), 0)) / hbar;
    return Math.exp(-2 * kappa * barrierWidth * 1e-9);
  }

  computeWavePacket({ barrierPosition = 0.5, resolution = 200, barrierWidth, barrierHeight, energy }) {
    const points = [];
    for (let i = 0; i < resolution; i += 1) {
      const x = i / (resolution - 1);
      let amplitude;
      if (x < barrierPosition) {
        const k = Math.sqrt(Math.max(energy, 0.01)) * 8 * Math.PI;
        amplitude = Math.sin(k * x) * Math.exp(-Math.pow((x - 0.25) * 6, 2));
      } else if (x < barrierPosition + barrierWidth) {
        const decay = Math.exp(-Math.sqrt(Math.max(barrierHeight - energy, 0.01)) * (x - barrierPosition) * 12);
        amplitude = 0.6 * decay;
      } else {
        const transmission = this.computeTunnelTransmission({ energy, barrierHeight, barrierWidth });
        const k = Math.sqrt(Math.max(energy, 0.01)) * 6 * Math.PI;
        amplitude = transmission * Math.sin(k * (x - barrierPosition - barrierWidth));
      }
      points.push({ x, amplitude });
    }
    return points;
  }

  computeInterferencePattern({ phase = 0, visibility = 1, resolution = 200 }) {
    const pattern = [];
    for (let i = 0; i < resolution; i += 1) {
      const x = i / (resolution - 1) * 6 - 3;
      const intensity = visibility * (Math.cos(x + phase) + 1) * 0.5;
      pattern.push({ x, intensity });
    }
    return pattern;
  }

  computeMachZehnder({ phase = 0 }) {
    const p1 = Math.pow(Math.cos(phase / 2), 2);
    const p2 = Math.pow(Math.sin(phase / 2), 2);
    return { p1, p2 };
  }

  computePhotoelectric({ frequency, threshold }) {
    const h = 4.135667696e-15; // eV·s
    const energy = h * frequency;
    const emitted = energy > threshold;
    const kinetic = emitted ? Math.max(energy - threshold, 0) : 0;
    return { emitted, kinetic };
  }

  computeSternGerlach({ angle }) {
    const rad = (angle * Math.PI) / 180;
    const up = (1 + Math.cos(rad)) / 2;
    const down = 1 - up;
    return { up, down };
  }

  computeIntricationCorrelation({ angleA, angleB }) {
    const radA = (angleA * Math.PI) / 180;
    const radB = (angleB * Math.PI) / 180;
    const correlation = -Math.cos(radA - radB);
    return { correlation };
  }

  computeBellCHSH({ a, aPrime, b, bPrime }) {
    const corr = (x, y) => -Math.cos(((x - y) * Math.PI) / 180);
    const S = Math.abs(corr(a, b) - corr(a, bPrime) + corr(aPrime, b) + corr(aPrime, bPrime));
    return { S, classicalLimit: 2 };
  }
}
