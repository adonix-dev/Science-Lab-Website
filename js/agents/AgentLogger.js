export default class AgentLogger {
  constructor(bus) {
    this.bus = bus;
    this.handlers = [];
  }

  init() {
    this.observe('data:ready', () => this.log('Données chargées'));
    this.observe('interface:navigate', (payload) => this.log('Navigation', payload));
    this.observe('interface:experiment', (payload) => this.log('Expérience affichée', payload?.phenomenon?.id));
    this.observe('ui:change', (payload) => this.log('Paramètre modifié', payload));
    this.observe('animation:updated', (payload) => this.log('Animation mise à jour', payload));
    this.observe('data:error', (error) => console.error('[AgentLogger]', error));
  }

  dispose() {
    this.handlers.forEach((off) => off());
    this.handlers = [];
  }

  observe(event, handler) {
    const off = this.bus.on(event, handler);
    this.handlers.push(off);
  }

  log(message, payload) {
    const time = new Date().toISOString();
    console.info(`%c[Lab ${time}] ${message}`, 'color:#32d5ff', payload || '');
  }
}
