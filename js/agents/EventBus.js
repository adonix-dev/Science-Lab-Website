export default class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    const off = this.on(event, (...args) => {
      off();
      handler(...args);
    });
    return off;
  }

  off(event, handler) {
    if (this.events.has(event)) {
      this.events.get(event).delete(handler);
      if (this.events.get(event).size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit(event, payload) {
    if (!this.events.has(event)) {
      return;
    }
    for (const handler of this.events.get(event)) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] handler error for ${event}`, error);
      }
    }
  }
}
