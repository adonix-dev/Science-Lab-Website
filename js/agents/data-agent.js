import { experimentsFallback } from '../../data/phenomenes-inline.js';

export class DataAgent {
  constructor(bus) {
    this.bus = bus;
    this.cache = new Map();
    this.paths = new Map();
    this.unsubscribe = [];
    this.list = [];
  }

  async init() {
    this.unsubscribe.push(this.bus.on('data:request-detail', (payload) => this.handleDetailRequest(payload)));

    try {
      const data = await this.fetchJSON('./data/phenomenes.json');
      if (data?.experiments?.length) {
        this.list = data.experiments;
        this.list.forEach((exp) => {
          if (exp.path) {
            this.paths.set(exp.id, exp.path);
          }
        });
      } else {
        throw new Error('Liste vide');
      }
    } catch (error) {
      console.warn('[DataAgent] Utilisation du fallback pour la liste des expériences', error);
      this.list = experimentsFallback.list.map((item) => ({ ...item, path: `experiments/${item.id}.json` }));
      this.list.forEach((exp) => this.paths.set(exp.id, exp.path));
      this.cache = new Map(Object.entries(experimentsFallback.details));
    }

    this.bus.emit('data:ready', { experiments: this.list });
  }

  dispose() {
    this.unsubscribe.forEach((off) => off());
    this.unsubscribe = [];
    this.cache.clear();
    this.paths.clear();
  }

  async handleDetailRequest(payload) {
    if (!payload || !payload.id) return;
    const { id } = payload;

    if (this.cache.has(id)) {
      this.bus.emit('data:detail', { id, data: this.cache.get(id), fromCache: true });
      return;
    }

    const path = this.paths.get(id) || `experiments/${id}.json`;
    try {
      const data = await this.fetchJSON(`./${path}`);
      this.cache.set(id, data);
      this.bus.emit('data:detail', { id, data, fromCache: false });
    } catch (error) {
      console.error(`[DataAgent] Impossible de charger ${id}`, error);
      if (experimentsFallback.details[id]) {
        const data = experimentsFallback.details[id];
        this.cache.set(id, data);
        this.bus.emit('data:detail', { id, data, fromCache: true, fallback: true });
      } else {
        this.bus.emit('data:error', { id, error });
      }
    }
  }

  async fetchJSON(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} pour ${path}`);
    }
    return response.json();
  }
}
