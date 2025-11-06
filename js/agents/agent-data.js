import { phenomenesFallback } from '../../data/phenomenes-inline.js';

function resolveDataPath() {
  const path = window.location.pathname;
  if (path.includes('/experiments/')) {
    return '../data/phenomenes.json';
  }
  return './data/phenomenes.json';
}

export class AgentData {
  constructor(bus) {
    this.bus = bus;
    this.data = { phenomenes: [] };
    this.ready = false;
  }

  async init() {
    await this.loadData();
    this.ready = true;
    this.bus.emit('data:ready', this.data);
  }

  async loadData() {
    const dataPath = resolveDataPath();
    try {
      const response = await fetch(dataPath, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.data = await response.json();
    } catch (error) {
      console.warn('[AgentData] Impossible de charger phenomenes.json, utilisation du fallback.', error);
      this.data = phenomenesFallback;
    }
    try {
      localStorage.setItem('lab:phenomenes', JSON.stringify(this.data));
    } catch (storageError) {
      console.warn('[AgentData] Impossible de mettre en cache les données', storageError);
    }
  }

  getPhenomenes() {
    return this.data.phenomenes || [];
  }

  getPhenomenesMap() {
    return this.getPhenomenes().reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }

  getPhenomenonById(id) {
    return this.getPhenomenes().find((item) => item.id === id);
  }

  dispose() {
    /* nothing to dispose */
  }
}
