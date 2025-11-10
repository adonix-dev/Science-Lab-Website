import { animationFactories } from '../animations/index.js';

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
      this.bus.emit('animation:status', { message: 'Zone de rendu introuvable.', type: 'error' });
      return;
    }
    if (typeof window === 'undefined' || !window.p5) {
      this.bus.emit('animation:status', { message: 'p5.js n\'est pas encore chargé.', type: 'error' });
      return;
    }

    this.disposeCurrent();
    const factoryKey = config?.type || id;
    const factory = animationFactories[factoryKey];
    if (!factory) {
      this.bus.emit('animation:status', { message: "Animation non disponible pour ce phénomène.", type: 'error' });
      return;
    }

    this.parameters = {};
    (config?.controls || []).forEach((control) => {
      this.parameters[control.id] = control.value;
    });

    try {
      const api = factory({
        container: canvas,
        physics: this.physicsAgent,
        config: config?.parameters || {},
        initialValues: this.parameters
      });
      this.current = { id, api };
      if (api.update) {
        Object.entries(this.parameters).forEach(([key, value]) => api.update(key, value, this.parameters));
      }
      this.bus.emit('animation:status', { message: 'Animation prête.', type: 'hidden' });
    } catch (error) {
      console.error('[AnimationAgent] Erreur de montage', error);
      this.bus.emit('animation:status', { message: 'Erreur lors du chargement de l\'animation.', type: 'error' });
    }
  }

  onControlChange({ experimentId, controlId, value }) {
    if (!this.current || this.current.id !== experimentId) return;
    this.parameters[controlId] = value;
    if (this.current.api?.update) {
      this.current.api.update(controlId, value, this.parameters);
    }
  }

  replay() {
    if (this.current?.api?.replay) {
      this.current.api.replay();
    }
  }

  disposeCurrent() {
    if (this.current?.api?.destroy) {
      this.current.api.destroy();
    }
    this.current = null;
  }
}
