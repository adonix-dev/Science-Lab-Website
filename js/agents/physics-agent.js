export class PhysicsAgent {
  constructor(bus) {
    this.bus = bus;
  }

  init() {}

  dispose() {}

  tunnelTransmission({ energy, barrierHeight, barrierWidth }) {
    if (energy >= barrierHeight) {
      return 0.95;
    }
    const delta = Math.max(barrierHeight - energy, 0.0001);
    const widthFactor = Math.max(barrierWidth, 0.05);
    const attenuation = Math.exp(-6 * delta * (1 + widthFactor * 3));
    return Math.max(0.02, 1 - attenuation);
  }

  doubleSlitIntensity(x, { visibility = 1, openSlits = true }) {
    const single = Math.exp(-x * x * 0.35);
    if (!openSlits) {
      return single * 0.6;
    }
    const fringe = (1 + visibility * Math.cos(10 * x)) / 2;
    return single * fringe;
  }

  machZehnderProbabilities(phase) {
    const p1 = Math.pow(Math.cos(phase / 2), 2);
    const p2 = Math.pow(Math.sin(phase / 2), 2);
    return { p1, p2 };
  }

  photoelectricEmission({ frequency, intensity, workFunction }) {
    const threshold = workFunction;
    const excess = frequency - threshold;
    if (excess <= 0) {
      return { emitted: false, kineticEnergy: 0, rate: 0 };
    }
    const kineticEnergy = excess;
    const rate = Math.min(1, intensity * 0.9);
    return { emitted: true, kineticEnergy, rate };
  }

  sternGerlachDistribution(angle, beamWidth) {
    const radians = (angle * Math.PI) / 180;
    const separation = Math.sin(radians);
    const spread = Math.max(beamWidth, 0.2) * 0.4;
    return { separation, spread };
  }

  entanglementCorrelation(angleA, angleB) {
    const radA = (angleA * Math.PI) / 180;
    const radB = (angleB * Math.PI) / 180;
    return -Math.cos(radA - radB);
  }

  bellCHSH({ angleA, angleAprime, angleB, angleBprime }) {
    const e = (a, b) => -Math.cos(((a - b) * Math.PI) / 180);
    const s = e(angleA, angleB) + e(angleA, angleBprime) + e(angleAprime, angleB) - e(angleAprime, angleBprime);
    return s;
  }
}
