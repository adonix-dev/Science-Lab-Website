import { createResponsiveSketch } from './helpers.js';

export function createMachZehnderSketch({ container, physics, config = {}, initialValues = {} }) {
  const state = {
    phase: initialValues.phase ?? 0,
    pulseInterval: config.pulseInterval ?? 1400
  };

  let lastPulse = performance.now();
  const pulses = [];

  const controller = createResponsiveSketch(container, (p, getSize) => {
    return {
      draw: () => {
        const { width, height } = getSize();
        p.background(8, 10, 18, 245);
        const centerY = height / 2;
        const leftX = width * 0.15;
        const rightX = width * 0.85;
        const topY = height * 0.28;
        const bottomY = height * 0.72;

        p.stroke(58, 215, 255, 120);
        p.strokeWeight(3);
        p.noFill();
        p.line(leftX, centerY, width * 0.32, centerY);
        p.line(width * 0.32, centerY, width * 0.48, topY);
        p.line(width * 0.32, centerY, width * 0.48, bottomY);
        p.line(width * 0.48, topY, width * 0.65, topY);
        p.line(width * 0.48, bottomY, width * 0.65, bottomY);
        p.line(width * 0.65, topY, rightX, centerY * 0.7);
        p.line(width * 0.65, bottomY, rightX, centerY * 1.3);

        p.fill(58, 215, 255, 200);
        p.noStroke();
        p.rect(width * 0.32 - 8, centerY - 35, 16, 70, 6);
        p.rect(width * 0.65 - 8, topY - 35, 16, 70, 6);

        const { p1, p2 } = physics.machZehnderProbabilities(state.phase);

        const now = performance.now();
        if (now - lastPulse > state.pulseInterval) {
          lastPulse = now;
          pulses.push({ t: 0 });
        }

        pulses.forEach((pulse) => {
          pulse.t += 0.01;
        });
        while (pulses.length > 0 && pulses[0].t > 2) {
          pulses.shift();
        }

        pulses.forEach((pulse) => {
          const progress = Math.min(pulse.t, 1);
          const x = p.lerp(leftX, width * 0.32, progress);
          const y = p.lerp(centerY, centerY, progress);
          p.fill(58, 215, 255);
          p.circle(x, y, 10);

          if (pulse.t > 0.3 && pulse.t < 1.3) {
            const branchProgress = Math.min(Math.max(pulse.t - 0.3, 0), 1);
            const topX = p.lerp(width * 0.32, width * 0.48, branchProgress);
            const bottomX = topX;
            const topCurve = p.lerp(centerY, topY, branchProgress);
            const bottomCurve = p.lerp(centerY, bottomY, branchProgress);
            p.fill(58, 215, 255, 180);
            p.circle(topX, topCurve, 8);
            p.circle(bottomX, bottomCurve, 8);
          }

          if (pulse.t > 1) {
            const exitProgress = Math.min(pulse.t - 1, 1);
            const topExitX = p.lerp(width * 0.65, rightX, exitProgress);
            const bottomExitX = topExitX;
            const topExitY = p.lerp(topY, centerY * 0.7, exitProgress);
            const bottomExitY = p.lerp(bottomY, centerY * 1.3, exitProgress);
            p.fill(58, 215, 255, 160 * p1);
            p.circle(topExitX, topExitY, 12);
            p.fill(58, 215, 255, 160 * p2);
            p.circle(bottomExitX, bottomExitY, 12);
          }
        });

        // detectors
        p.noStroke();
        p.fill(58, 215, 255, 150);
        p.rect(rightX - 14, centerY * 0.7 - 20, 28, 40, 6);
        p.rect(rightX - 14, centerY * 1.3 - 20, 28, 40, 6);

        // probabilities text
        p.textAlign(p.RIGHT, p.TOP);
        p.fill(58, 215, 255, 210);
        p.textSize(14);
        p.text(`P₁ = ${(p1 * 100).toFixed(0)}%`, rightX - 18, centerY * 0.7 - 50);
        p.text(`P₂ = ${(p2 * 100).toFixed(0)}%`, rightX - 18, centerY * 1.3 - 50);

        p.textAlign(p.LEFT, p.TOP);
        p.text(`Δφ = ${(state.phase).toFixed(2)} rad`, 20, 20);
      }
    };
  });

  return {
    update(controlId, value) {
      if (controlId === 'phase') {
        state.phase = value;
      }
    },
    replay() {
      pulses.length = 0;
      lastPulse = performance.now();
    },
    destroy() {
      controller.destroy();
    }
  };
}
