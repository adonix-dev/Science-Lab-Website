import { createResponsiveSketch } from './helpers.js';

export function createEntanglementSketch({ container, physics, config = {}, initialValues = {} }) {
  const state = {
    angleA: initialValues.angleA ?? 0,
    angleB: initialValues.angleB ?? 45,
    sampleSize: config.sampleSize ?? 200
  };

  let measurements = [];

  const regenerate = () => {
    measurements = [];
    const correlation = physics.entanglementCorrelation(state.angleA, state.angleB);
    const sameProb = (correlation + 1) / 2;
    for (let i = 0; i < state.sampleSize; i += 1) {
      const same = Math.random() < sameProb;
      let resultA = Math.random() > 0.5 ? 1 : -1;
      let resultB = same ? resultA : -resultA;
      measurements.push({
        a: resultA,
        b: resultB,
        same
      });
    }
  };

  regenerate();

  const controller = createResponsiveSketch(container, (p, getSize) => {
    return {
      draw: () => {
        const { width, height } = getSize();
        p.background(8, 10, 18, 245);

        p.noStroke();
        p.fill(58, 215, 255, 180);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(14);
        p.text(`Polariseur A: ${state.angleA.toFixed(0)}°`, 20, 20);
        p.text(`Polariseur B: ${state.angleB.toFixed(0)}°`, 20, 40);

        const correlation = physics.entanglementCorrelation(state.angleA, state.angleB);
        const sameCount = measurements.filter((m) => m.same).length;
        const diffCount = measurements.length - sameCount;

        p.text(`Corrélation ⟨A·B⟩ = ${correlation.toFixed(2)}`, 20, 60);

        // draw polarizers
        const centerLeft = { x: width * 0.3, y: height * 0.55 };
        const centerRight = { x: width * 0.7, y: height * 0.55 };
        drawPolarizer(p, centerLeft, state.angleA, correlation);
        drawPolarizer(p, centerRight, state.angleB, correlation);

        // draw connecting curve
        p.stroke(58, 215, 255, 120 + Math.abs(correlation) * 80);
        p.noFill();
        p.strokeWeight(3);
        p.bezier(
          centerLeft.x + 40,
          centerLeft.y,
          width * 0.45,
          height * 0.2,
          width * 0.55,
          height * 0.9,
          centerRight.x - 40,
          centerRight.y
        );

        // scatter results
        const radius = Math.min(width, height) * 0.18;
        measurements.slice(0, 120).forEach((m, index) => {
          const angle = (index / 120) * Math.PI * 2;
          const r = radius * (0.6 + 0.4 * (m.same ? 1 : 0.6));
          const x = width * 0.5 + Math.cos(angle) * r;
          const y = height * 0.55 + Math.sin(angle) * r;
          const alpha = m.same ? 220 : 120;
          p.noStroke();
          p.fill(58, 215, 255, alpha);
          p.circle(x, y, m.same ? 6 : 4);
        });

        // histograms
        p.noStroke();
        p.fill(58, 215, 255, 180);
        const barWidth = width * 0.18;
        const baseY = height * 0.85;
        const scale = height * 0.25 / state.sampleSize;
        p.rect(width * 0.25, baseY - sameCount * scale, barWidth, sameCount * scale, 10);
        p.rect(width * 0.57, baseY - diffCount * scale, barWidth, diffCount * scale, 10);
        p.textAlign(p.CENTER, p.TOP);
        p.text(`Résultats identiques (${sameCount})`, width * 0.25 + barWidth / 2, baseY + 8);
        p.text(`Résultats opposés (${diffCount})`, width * 0.57 + barWidth / 2, baseY + 8);
      }
    };
  });

  return {
    update(controlId, value) {
      state[controlId] = value;
      regenerate();
    },
    replay() {
      regenerate();
    },
    destroy() {
      controller.destroy();
    }
  };
}

function drawPolarizer(p, center, angle, correlation) {
  p.push();
  p.translate(center.x, center.y);
  p.rotate((angle * Math.PI) / 180);
  p.fill(25, 36, 58, 200);
  p.stroke(58, 215, 255, 160);
  p.strokeWeight(2);
  p.rect(-14, -60, 28, 120, 12);
  p.pop();

  p.noStroke();
  p.fill(58, 215, 255, 200);
  p.circle(center.x, center.y, 18);
  p.fill(8, 10, 18, 200);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(12);
  p.text(correlation > 0 ? '+' : '−', center.x, center.y);
}
