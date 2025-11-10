import { createResponsiveSketch } from './helpers.js';

export function createTunnelSketch({ container, physics, config = {}, initialValues = {} }) {
  const state = {
    energy: initialValues.energy ?? 0.45,
    barrierHeight: initialValues.barrierHeight ?? 0.8,
    barrierWidth: initialValues.barrierWidth ?? 0.45,
    speed: config.speed ?? 0.9
  };

  let animationTime = 0;

  const controller = createResponsiveSketch(container, (p, getSize) => {
    const backgroundColor = p.color(11, 13, 19);
    const waveColor = p.color(58, 215, 255, 200);
    const transmittedColor = p.color(58, 215, 255, 120);

    return {
      draw: () => {
        const { width, height } = getSize();
        p.background(backgroundColor);
        animationTime += 0.01 * state.speed;
        const transmission = physics.tunnelTransmission(state);

        const barrierPx = width * (0.25 + state.barrierWidth * 0.35);
        const barrierLeft = width * 0.45;
        const barrierRight = barrierLeft + barrierPx;
        const barrierHeightPx = height * (0.2 + state.barrierHeight * 0.5);

        // Barrier
        p.noStroke();
        p.fill(20, 28, 45, 220);
        p.rect(barrierLeft, (height - barrierHeightPx) / 2, barrierPx, barrierHeightPx, 16);

        const drawWave = (startX, endX, amplitude, color = waveColor) => {
          const steps = 180;
          p.stroke(color);
          p.noFill();
          p.beginShape();
          for (let i = 0; i <= steps; i += 1) {
            const t = i / steps;
            const x = p.lerp(startX, endX, t);
            const phase = animationTime * 3 + t * 18;
            const envelope = Math.min(1, Math.exp((x - startX) / 120));
            const y = height / 2 + Math.sin(phase) * amplitude * envelope;
            p.vertex(x, y);
          }
          p.endShape();
        };

        // Incident wave
        drawWave(width * 0.05, barrierLeft, height * (0.2 + state.energy * 0.2));

        // Inside barrier (decaying)
        p.stroke(120, 150, 255, 120);
        p.beginShape();
        const stepsBarrier = 60;
        for (let i = 0; i <= stepsBarrier; i += 1) {
          const t = i / stepsBarrier;
          const x = p.lerp(barrierLeft, barrierRight, t);
          const decay = Math.exp(-t * 4 * (state.barrierHeight - state.energy + 0.3));
          const y = height / 2 + Math.sin(animationTime * 3 + t * 8) * height * 0.18 * decay;
          p.vertex(x, y);
        }
        p.endShape();

        // Transmitted wave
        p.stroke(transmittedColor);
        drawWave(barrierRight, width * 0.95, height * 0.18 * transmission, transmittedColor);

        // Labels
        p.noStroke();
        p.fill(58, 215, 255, 180);
        p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        p.text(`Transmission ~ ${(transmission * 100).toFixed(0)}%`, 20, 20);
        p.text(`Énergie: ${(state.energy).toFixed(2)}  |  Barrière: ${(state.barrierHeight).toFixed(2)}`, 20, 40);
      }
    };
  });

  return {
    update(controlId, value) {
      state[controlId] = value;
    },
    replay() {
      animationTime = 0;
    },
    destroy() {
      controller.destroy();
    }
  };
}
