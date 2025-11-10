export class LoggerAgent {
  constructor(bus) {
    this.bus = bus;
    this.unsubscribe = [];
  }

  init() {
    this.unsubscribe.push(this.bus.on('experiment:mount-animation', ({ id }) => {
      console.info(`[Logger] Montage de l'expérience ${id}`);
    }));
    this.unsubscribe.push(this.bus.on('ui:change', ({ experimentId, controlId, value }) => {
      console.info(`[Logger] ${experimentId} – ${controlId} = ${value}`);
    }));
    this.unsubscribe.push(this.bus.on('data:error', ({ id, error }) => {
      console.error(`[Logger] Erreur de données pour ${id}`, error);
    }));
  }

  dispose() {
    this.unsubscribe.forEach((off) => off());
    this.unsubscribe = [];
  }
}
