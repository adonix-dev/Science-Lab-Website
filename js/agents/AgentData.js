export default class AgentData {
  constructor(bus) {
    this.bus = bus;
    this.data = null;
    this.storageKey = 'lab:phenomenes';
  }

  init() {
    this.setupListeners();
    const cached = this.readCache();
    if (cached) {
      this.data = cached;
      this.bus.emit('data:ready', this.data);
      this.fetchRemote(true);
    } else {
      this.fetchRemote(false);
    }
  }

  dispose() {
    this.bus = null;
    this.data = null;
  }

  setupListeners() {
    this.bus.on('data:requestAll', () => {
      if (!this.data) return;
      this.bus.emit('data:all', this.data);
    });

    this.bus.on('data:requestById', (id) => {
      if (!this.data) return;
      const phenomenon = this.data.phenomenes.find((item) => item.id === id);
      this.bus.emit('data:one', { id, phenomenon });
    });
  }

  readCache() {
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.warn('[AgentData] Impossible de lire le cache local', error);
      return null;
    }
  }

  writeCache(data) {
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[AgentData] Impossible d\'écrire le cache local', error);
    }
  }

  fetchRemote(fromCache) {
    const page = document.body?.dataset.page || 'index';
    const url = page === 'experiment' ? '../data/phenomenes.json' : './data/phenomenes.json';

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Chargement impossible (${response.status})`);
        }
        return response.json();
      })
      .then((json) => {
        this.data = json;
        this.writeCache(json);
        if (!fromCache) {
          this.bus.emit('data:ready', json);
        } else {
          this.bus.emit('data:refreshed', json);
        }
      })
      .catch((error) => {
        console.error('[AgentData] Erreur de chargement', error);
        this.bus.emit('data:error', error);
      });
  }
}
