import { createResponsiveSketch } from './helpers.js';

export function createSternGerlachSketch({ container, physics, config = {}, initialValues = {} }) {
  const state = {
    angle: initialValues.angle ?? 45,
    beamWidth: initialValues.beamWidth ?? 0.6,
    emissionRate: config.emissionRate ?? 0.8
  };

  const atoms = [];

  const controller = createResponsiveSketch(container, (p, getSize) => {
    return {
      draw: () => {
        const { width, height } = getSize();
        p.background(8, 10, 18, 245);

        const { separation, spread } = physics.sternGerlachDistribution(state.angle, state.beamWidth);

        p.noStroke();
        p.fill(25, 34, 52, 180);
        p.rect(width * 0.4, height * 0.3, width * 0.2, height * 0.4, 18);

        const newAtoms = Math.floor(2 + state.emissionRate * 5);
        for (let i = 0; i < newAtoms; i += 1) {
          atoms.push({
            x: width * 0.15,
            y: height * 0.5 + (Math.random() - 0.5) * height * 0.15,
            spin: Math.random() > 0.5 ? 1 : -1,
            speed: 2 + Math.random() * 1.5
          });
        }

        for (let i = atoms.length - 1; i >= 0; i -= 1) {
          const atom = atoms[i];
          atom.x += atom.speed;
          const targetY = height * 0.5 + atom.spin * separation * height * 0.25;
          atom.y += (targetY - atom.y) * 0.03;
          atom.y += (Math.random() - 0.5) * spread;

          p.fill(58, 215, 255, 220);
          p.circle(atom.x, atom.y, 6);

          if (atom.x > width * 0.85) {
            atoms.splice(i, 1);
          }
        }

        p.fill(58, 215, 255, 180);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(14);
        p.text(`Orientation: ${state.angle.toFixed(0)}°`, 20, 20);
        p.text(`Séparation relative: ${(separation * 100).toFixed(0)}%`, 20, 40);
      }
    };
  });

  return {
    update(controlId, value) {
      state[controlId] = value;
    },
    replay() {
      atoms.length = 0;
    },
    destroy() {
      controller.destroy();
    }
  };
}
