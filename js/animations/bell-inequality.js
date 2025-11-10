import { createResponsiveSketch } from './helpers.js';

export function createBellInequalitySketch({ container, physics, config = {}, initialValues = {} }) {
  const state = {
    angleA: initialValues.angleA ?? 0,
    angleAprime: initialValues.angleAprime ?? 90,
    angleB: initialValues.angleB ?? 45,
    angleBprime: initialValues.angleBprime ?? 135,
    sampleSize: config.sampleSize ?? 400
  };

  const controller = createResponsiveSketch(container, (p, getSize) => {
    return {
      draw: () => {
        const { width, height } = getSize();
        p.background(8, 10, 18, 245);

        const sValue = physics.bellCHSH(state);
        const correlations = [
          { label: 'E(a, b)', value: -Math.cos(((state.angleA - state.angleB) * Math.PI) / 180) },
          { label: "E(a, b')", value: -Math.cos(((state.angleA - state.angleBprime) * Math.PI) / 180) },
          { label: "E(a', b)", value: -Math.cos(((state.angleAprime - state.angleB) * Math.PI) / 180) },
          { label: "E(a', b')", value: -Math.cos(((state.angleAprime - state.angleBprime) * Math.PI) / 180) }
        ];

        p.noStroke();
        p.fill(58, 215, 255, 180);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(14);
        p.text(`S = ${sValue.toFixed(2)}`, 20, 20);
        p.text('Limite classique |S| ≤ 2', 20, 40);

        const gaugeWidth = width * 0.6;
        const gaugeX = width * 0.2;
        const gaugeY = height * 0.2;
        const gaugeHeight = 12;

        p.fill(25, 36, 58, 200);
        p.rect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, 10);
        const normalized = Math.min(Math.abs(sValue) / (2 * Math.sqrt(2)), 1);
        p.fill(58, 215, 255, 220);
        p.rect(gaugeX, gaugeY, gaugeWidth * normalized, gaugeHeight, 10);

        p.textAlign(p.CENTER, p.TOP);
        p.text('|S|/2√2', gaugeX + gaugeWidth / 2, gaugeY + 16);

        const baseX = width * 0.18;
        const baseY = height * 0.75;
        const barWidth = width * 0.16;
        const scale = height * 0.25;

        correlations.forEach((corr, index) => {
          const x = baseX + index * (barWidth + 12);
          const barHeight = corr.value * scale;
          p.fill(25, 36, 58, 200);
          p.rect(x, baseY - scale, barWidth, scale * 2, 12);
          p.fill(58, 215, 255, 200);
          p.rect(x, baseY, barWidth, -barHeight, 12);
          p.textAlign(p.CENTER, p.TOP);
          p.text(`${corr.label} = ${corr.value.toFixed(2)}`, x + barWidth / 2, baseY + 16);
        });

        p.stroke(255, 100, 120, 180);
        p.strokeWeight(2);
        const classicalX = gaugeX + (Math.min(Math.abs(2) / (2 * Math.sqrt(2)), 1) * gaugeWidth);
        p.line(classicalX, gaugeY - 6, classicalX, gaugeY + gaugeHeight + 6);
      }
    };
  });

  return {
    update(controlId, value) {
      state[controlId] = value;
    },
    replay() {},
    destroy() {
      controller.destroy();
    }
  };
}
