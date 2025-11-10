export function createResponsiveSketch(container, sketchFactory) {
  if (!container) {
    throw new Error('Container manquant pour le sketch.');
  }
  container.innerHTML = '';
  const sketch = (p) => {
    let canvas;
    const getSize = () => {
      const width = container.clientWidth || 600;
      const height = Math.max(320, width * 0.55);
      return { width, height };
    };

    const api = sketchFactory(p, getSize);

    p.setup = () => {
      const { width, height } = getSize();
      canvas = p.createCanvas(width, height);
      canvas.parent(container);
      if (api.setup) {
        api.setup();
      }
    };

    p.windowResized = () => {
      const { width, height } = getSize();
      p.resizeCanvas(width, height);
      if (api.onResize) {
        api.onResize(width, height);
      }
    };

    p.draw = () => {
      if (api.draw) {
        api.draw();
      }
    };
  };

  const instance = new window.p5(sketch, container);
  return {
    instance,
    destroy() {
      instance.remove();
    }
  };
}
