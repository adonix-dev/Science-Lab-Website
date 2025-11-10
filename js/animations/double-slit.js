import { createResponsiveSketch } from './helpers.js';

export function createDoubleSlitSketch({ container, physics, config = {}, initialValues = {} }) {
  const state = {
    visibility: initialValues.visibility ?? 1,
    openSlits: initialValues.openSlits ?? true,
    emissionRate: config.emissionRate ?? 0.6
  };

  const particles = [];
  const maxParticles = 700;

  const controller = createResponsiveSketch(container, (p, getSize) => {
    return {
      draw: () => {
        const { width, height } = getSize();
        p.background(8, 10, 18, 240);

        // screen background
        p.noStroke();
        p.fill(20, 28, 45, 180);
        p.rect(width * 0.1, height * 0.15, width * 0.8, height * 0.7, 18);

        const emitCount = Math.floor(3 + state.emissionRate * 8);
        for (let i = 0; i < emitCount; i += 1) {
          if (particles.length >= maxParticles) break;
          const xNorm = Math.random() * 2 - 1; // -1 to 1
          const intensity = physics.doubleSlitIntensity(xNorm, state);
          if (Math.random() < intensity) {
            const x = width * (0.1 + 0.8 * ((xNorm + 1) / 2));
            const y = height * (0.15 + Math.random() * 0.7);
            particles.push({ x, y, life: 1 });
          }
        }

        if (particles.length > maxParticles) {
          particles.splice(0, particles.length - maxParticles);
        }

        // draw particles
        particles.forEach((particle) => {
          particle.life *= 0.995;
          p.fill(58, 215, 255, 200 * particle.life + 40);
          p.noStroke();
          p.circle(particle.x, particle.y, 4);
        });

        // central indicator
        p.stroke(58, 215, 255, 120);
        p.line(width / 2, height * 0.15, width / 2, height * 0.85);

        p.noStroke();
        p.fill(58, 215, 255, 200);
        const message = state.openSlits ? 'Franges visibles' : 'Une seule fente ouverte';
        p.textAlign(p.CENTER, p.BOTTOM);
        p.text(message, width / 2, height - 12);
      }
    };
  });

  return {
    update(controlId, value) {
      state[controlId] = value;
      if (controlId === 'openSlits') {
        state.openSlits = Boolean(value);
      }
    },
    replay() {
      particles.length = 0;
    },
    destroy() {
      controller.destroy();
    }
  };
}
