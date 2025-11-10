export class AgentLogger {
  constructor(bus) {
    this.bus = bus;
    this.subscriptions = [];
  }

  init() {
    const eventsToLog = [
      'data:ready',
      'interface:navigate',
      'interface:filter',
      'interface:replay',
      'animation:loaded',
      'animation:updated',
      'ui:change'
    ];
    eventsToLog.forEach((event) => {
      const off = this.bus.on(event, (payload) => {
        console.info(`[AgentLogger] ${event}`, payload || '');
      });
      this.subscriptions.push(off);
    });
  }

  dispose() {
    this.subscriptions.forEach((off) => off());
    this.subscriptions = [];
  }
}
