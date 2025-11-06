export class AgentPhysics {
  constructor(bus) {
    this.bus = bus;
  }

  init() {}

  computeWaveInterference(x, params) {
    const { wavelength = 1, phase = 0, slitDistance = 1 } = params;
    const k = (2 * Math.PI) / wavelength;
    const amplitude1 = Math.cos(k * x);
    const amplitude2 = Math.cos(k * (x + slitDistance) + phase);
    return Math.pow(amplitude1 + amplitude2, 2);
  }

  computeTunnelTransmission({ energy, barrierHeight, barrierWidth }) {
    if (energy >= barrierHeight) {
      return 1;
    }
    const m = 9.11e-31;
    const hbar = 1.054e-34;
    const kappa = Math.sqrt((2 * m * Math.max(barrierHeight - energy, 0)) / (hbar * hbar));
    return Math.exp(-2 * kappa * barrierWidth);
  }

  computePhotoelectricKineticEnergy({ frequency, workFunction }) {
    const h = 6.62607015e-34;
    const energy = h * frequency;
    const kinetic = energy - workFunction;
    return Math.max(0, kinetic);
  }

  computeBellCorrelation(angleA, angleB) {
    return -Math.cos((angleA - angleB) * (Math.PI / 180));
  }

  dispose() {}
}
