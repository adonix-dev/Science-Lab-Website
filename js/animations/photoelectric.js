import { createResponsiveSketch } from './helpers.js';

export function createPhotoelectricSketch({ container, physics, config = {}, initialValues = {} }) {
  const state = {
    frequency: initialValues.frequency ?? 5.5,
    intensity: initialValues.intensity ?? 0.7,
    workFunction: config.workFunction ?? 5
  };

  const electrons = [];

  const controller = createResponsiveSketch(container, (p, getSize) => {
    return {
      draw: () => {
        const { width, height } = getSize();
        p.background(8, 10, 18, 240);

        const result = physics.photoelectricEmission(state);

        p.noStroke();
        p.fill(25, 32, 48, 220);
        p.rect(width * 0.2, height * 0.6, width * 0.6, height * 0.08, 12);

        const photonColor = frequencyToColor(p, state.frequency);
        const photonCount = Math.floor(4 + state.intensity * 12);

        for (let i = 0; i < photonCount; i += 1) {
          const offset = Math.random() * width * 0.6;
          const x = width * 0.2 + offset;
          const length = height * 0.3 * state.intensity;
          p.stroke(photonColor);
          p.strokeWeight(2);
          p.line(x, height * 0.2, x, height * 0.2 + length);
          if (result.emitted && Math.random() < result.rate * 0.3) {
            electrons.push({ x, y: height * 0.6, vx: 1 + result.kineticEnergy * 0.8 });
          }
        }

        p.noStroke();
        p.fill(58, 215, 255, 180);
        p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        const kinetic = result.emitted ? result.kineticEnergy.toFixed(2) : '0.00';
        p.text(`ν = ${state.frequency.toFixed(2)} × 10¹⁴ Hz`, 20, 20);
        p.text(`Émission: ${result.emitted ? 'oui' : 'non'}`, 20, 40);
        p.text(`Énergie cinétique max: ${kinetic}`, 20, 60);

        // update electrons
        for (let i = electrons.length - 1; i >= 0; i -= 1) {
          const e = electrons[i];
          e.x += e.vx * 4;
          e.y -= Math.sin(e.x / 30) * 0.6;
          p.fill(58, 215, 255, 200);
          p.circle(e.x, e.y, 6);
          if (e.x > width * 0.8) {
            electrons.splice(i, 1);
          }
        }
      }
    };
  });

  return {
    update(controlId, value) {
      state[controlId] = value;
    },
    replay() {
      electrons.length = 0;
    },
    destroy() {
      controller.destroy();
    }
  };
}

function frequencyToColor(p, frequency) {
  const t = Math.min(Math.max((frequency - 3) / 6, 0), 1);
  const hue = p.lerp(200, 320, t);
  return p.color(`hsla(${hue}, 80%, 60%, 0.8)`);
}
