export class AnimationAgent {
  constructor(bus, physicsAgent) {
    this.bus = bus;
    this.physicsAgent = physicsAgent;
    this.unsubscribe = [];
    this.current = null;
    this.parameters = {};
  }

  init() {
    this.unsubscribe.push(this.bus.on('experiment:mount-animation', (payload) => this.mount(payload)));
    this.unsubscribe.push(this.bus.on('experiment:dispose-animation', () => this.disposeCurrent()));
    this.unsubscribe.push(this.bus.on('ui:change', (payload) => this.onControlChange(payload)));
    this.unsubscribe.push(this.bus.on('animation:replay', () => this.replay()));
  }

  dispose() {
    this.unsubscribe.forEach((off) => off());
    this.unsubscribe = [];
    this.disposeCurrent();
  }

  mount({ id, config, canvas }) {
    if (!canvas) {
      this.emitStatus('Zone de rendu introuvable.', 'error');
      return;
    }
    if (typeof window === 'undefined' || !window.p5) {
      this.emitStatus("p5.js n'est pas encore chargé.", 'error');
      return;
    }
    if (!config?.sketch?.code) {
      this.emitStatus("Animation indisponible pour ce phénomène.", 'error');
      return;
    }

    this.disposeCurrent();

    try {
      const definition = this.compileSketch(config.sketch);
      this.parameters = {};
      (config.controls || []).forEach((control) => {
        if (control.type === 'toggle') {
          this.parameters[control.id] = Boolean(control.value);
        } else {
          const numeric = Number(control.value);
          this.parameters[control.id] = Number.isNaN(numeric) ? control.value : numeric;
        }
      });

      const scope = this.createScope(canvas, config, definition.__helpers);
      scope.state = { ...this.parameters };

      const current = {
        id,
        config,
        definition,
        canvas,
        scope,
        queue: [],
        instance: null
      };

      canvas.innerHTML = '';
      current.instance = this.createP5Instance(current);
      delete definition.__helpers;
      this.current = current;

      Object.entries(this.parameters).forEach(([key, value]) => {
        this.enqueueUpdate(current, key, value);
      });

      this.emitStatus('Animation prête.', 'hidden');
    } catch (error) {
      console.error('[AnimationAgent] Erreur lors du montage', error);
      this.emitStatus("Erreur lors du chargement de l'animation.", 'error');
    }
  }

  compileSketch(sketch) {
    if (sketch.library && sketch.library !== 'p5') {
      throw new Error(`Bibliothèque non supportée: ${sketch.library}`);
    }
    const helpers = this.createHelpers();
    try {
      const factory = new Function('helpers', `'use strict'; return ${sketch.code};`);
      const definition = factory(helpers);
      if (!definition || typeof definition !== 'object') {
        throw new Error('Le code doit retourner un objet représentant le sketch.');
      }
      Object.defineProperty(definition, '__helpers', {
        value: helpers,
        enumerable: false,
        configurable: true
      });
      return definition;
    } catch (error) {
      throw new Error(`Impossible de compiler l'animation: ${error.message}`);
    }
  }

  createScope(canvas, config, helpersOverride) {
    return {
      element: canvas,
      context: {
        element: canvas,
        getSize: () => this.getCanvasSize(canvas)
      },
      params: config?.parameters || {},
      helpers: helpersOverride || this.createHelpers(),
      state: {},
      ready: false,
      p: null
    };
  }

  createHelpers() {
    return {
      physics: this.physicsAgent,
      clamp: (value, min, max) => Math.min(Math.max(value, min), max),
      lerp: (a, b, t) => a + (b - a) * t,
      map: (value, inMin, inMax, outMin, outMax) => {
        if (inMax - inMin === 0) return outMin;
        return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
      },
      random: (min = 0, max = 1) => Math.random() * (max - min) + min,
      easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
    };
  }

  createP5Instance(current) {
    const agent = this;
    const { canvas, definition, scope, queue } = current;
    const instance = new window.p5((p) => {
      if (typeof definition.preload === 'function') {
        p.preload = () => {
          scope.p = p;
          agent.invoke(definition, scope, 'preload');
        };
      }

      p.setup = () => {
        scope.p = p;
        const size = scope.context.getSize();
        const created = p.createCanvas(size.width, size.height);
        created.parent(canvas);
        agent.invoke(definition, scope, 'setup', { size, canvas: created });
        scope.ready = true;
        while (queue.length) {
          const detail = queue.shift();
          agent.invoke(definition, scope, 'update', detail);
        }
      };

      p.draw = () => {
        scope.p = p;
        agent.invoke(definition, scope, 'draw', { frame: p.frameCount });
      };

      p.windowResized = () => {
        scope.p = p;
        const size = scope.context.getSize();
        p.resizeCanvas(size.width, size.height);
        agent.invoke(definition, scope, 'resize', { size });
      };
    }, canvas);
    return instance;
  }

  enqueueUpdate(current, key, value) {
    const { definition, scope, queue } = current;
    scope.state[key] = value;
    if (typeof definition.update !== 'function') {
      return;
    }
    const detail = { key, value };
    if (!scope.ready) {
      queue.push(detail);
      return;
    }
    this.invoke(definition, scope, 'update', detail);
  }

  invoke(definition, scope, method, extras = {}) {
    const fn = definition?.[method];
    if (typeof fn !== 'function') return;
    try {
      return fn({
        ...extras,
        p: scope.p,
        state: scope.state,
        params: scope.params,
        helpers: scope.helpers,
        context: scope.context,
        physics: this.physicsAgent
      });
    } catch (error) {
      console.error(`[AnimationAgent] Erreur lors de l'appel ${method}`, error);
    }
  }

  onControlChange({ experimentId, controlId, value }) {
    if (!this.current || this.current.id !== experimentId) return;
    this.enqueueUpdate(this.current, controlId, value);
  }

  replay() {
    if (!this.current) return;
    this.invoke(this.current.definition, this.current.scope, 'replay');
  }

  disposeCurrent() {
    if (!this.current) return;
    try {
      this.invoke(this.current.definition, this.current.scope, 'destroy');
    } catch (error) {
      console.warn('[AnimationAgent] Erreur lors du nettoyage', error);
    }
    if (this.current.instance) {
      this.current.instance.remove();
    }
    if (this.current.canvas) {
      this.current.canvas.innerHTML = '';
    }
    this.current = null;
    this.parameters = {};
  }

  emitStatus(message, type) {
    this.bus.emit('animation:status', { message, type });
  }

  getCanvasSize(element) {
    const width = element?.clientWidth || 640;
    const height = Math.max(320, width * 0.56);
    return { width, height };
  }
}
