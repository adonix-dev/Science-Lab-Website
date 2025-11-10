export class InterfaceAgent {
  constructor(bus) {
    this.bus = bus;
    this.unsubscribe = [];
    this.experiments = [];
    this.currentId = null;
    this.detail = null;

    this.homeView = document.querySelector('[data-view="home"]');
    this.detailView = document.querySelector('[data-view="detail"]');
    this.gridEl = document.querySelector('[data-grid]');
    this.statusEl = document.querySelector('[data-status]');
    this.searchInput = document.querySelector('[data-search]');
    this.returnButton = document.querySelector('[data-return]');
    this.titleEl = document.querySelector('[data-experiment-title]');
    this.tagsEl = document.querySelector('[data-experiment-tags]');
    this.introEl = document.querySelector('[data-introduction]');
    this.detailsContainer = document.querySelector('[data-details]');
    this.toggleButton = document.querySelector('[data-toggle-details]');
    this.animationDescriptionEl = document.querySelector('[data-animation-description]');
    this.canvasEl = document.querySelector('[data-canvas]');
    this.controlsEl = document.querySelector('[data-controls]');
    this.animationStatusEl = document.querySelector('[data-animation-status]');
    this.replayButton = document.querySelector('[data-replay]');

    this.searchHandler = null;
    this.hashListener = null;
    this.pendingRoute = window.location.hash.replace('#', '').trim();
  }

  init() {
    this.unsubscribe.push(this.bus.on('data:ready', ({ experiments }) => this.onDataReady(experiments)));
    this.unsubscribe.push(this.bus.on('data:error', () => this.onDataError()));
    this.unsubscribe.push(this.bus.on('data:detail', (payload) => this.onExperimentData(payload)));
    this.unsubscribe.push(this.bus.on('animation:status', (payload) => this.onAnimationStatus(payload)));

    this.setupSearch();
    this.setupDetailInteractions();

    this.hashListener = () => this.applyRoute();
    window.addEventListener('hashchange', this.hashListener);

    this.applyRoute();
  }

  dispose() {
    this.unsubscribe.forEach((off) => off());
    this.unsubscribe = [];
    if (this.searchInput && this.searchHandler) {
      this.searchInput.removeEventListener('input', this.searchHandler);
    }
    if (this.hashListener) {
      window.removeEventListener('hashchange', this.hashListener);
    }
  }

  setupSearch() {
    if (!this.searchInput) return;
    this.searchHandler = (event) => {
      const term = event.target.value.trim().toLowerCase();
      this.bus.emit('interface:filter', { term });
    };
    this.searchInput.addEventListener('input', this.searchHandler);
  }

  setupDetailInteractions() {
    if (this.returnButton) {
      this.returnButton.addEventListener('click', () => {
        window.location.hash = '';
      });
    }
    if (this.toggleButton && this.detailsContainer) {
      this.toggleButton.addEventListener('click', () => {
        const isHidden = this.detailsContainer.hasAttribute('hidden');
        if (isHidden) {
          this.detailsContainer.removeAttribute('hidden');
          this.toggleButton.setAttribute('aria-expanded', 'true');
          const icon = this.toggleButton.querySelector('span');
          if (icon) icon.textContent = '▴';
        } else {
          this.detailsContainer.setAttribute('hidden', '');
          this.toggleButton.setAttribute('aria-expanded', 'false');
          const icon = this.toggleButton.querySelector('span');
          if (icon) icon.textContent = '▾';
        }
      });
    }
    if (this.replayButton) {
      this.replayButton.addEventListener('click', () => {
        this.bus.emit('animation:replay');
      });
    }
  }

  onDataReady(experiments = []) {
    this.experiments = experiments;
    this.renderHome(experiments);
    if (this.pendingRoute) {
      this.navigateTo(this.pendingRoute);
      this.pendingRoute = '';
    } else {
      this.applyRoute();
    }
  }

  onDataError() {
    if (this.statusEl) {
      this.statusEl.textContent = "Impossible de charger les expériences. Utilisez le fallback intégré.";
      this.statusEl.classList.add('is-visible');
    }
    if (this.detailView && !this.detailView.hasAttribute('hidden')) {
      this.showExperimentError("Phénomène introuvable. Vérifiez l'identifiant.");
    }
  }

  onExperimentData(payload) {
    if (!payload) return;
    if (!this.currentId || payload.id !== this.currentId) {
      return;
    }
    this.detail = payload.data;
    if (!this.detail) {
      this.showExperimentError("Phénomène introuvable. Vérifiez l'identifiant.");
      return;
    }

    if (this.titleEl) {
      this.titleEl.textContent = `${this.detail.icon || '🧪'} ${this.detail.title}`;
      document.title = `Lab – ${this.detail.title}`;
    }
    if (this.tagsEl) {
      this.tagsEl.textContent = (this.detail.tags || []).join(' · ');
    }
    if (this.introEl) {
      this.introEl.textContent = this.detail.introduction || this.detail.summary || '';
    }
    if (this.detailsContainer) {
      const more = this.detail.further || [];
      if (more.length) {
        this.detailsContainer.innerHTML = more
          .map(
            (entry) => `
              <h3>${entry.label}</h3>
              <p>${entry.content}</p>
            `
          )
          .join('');
      } else {
        this.detailsContainer.innerHTML = '<p>Aucune note supplémentaire.</p>';
      }
      this.detailsContainer.setAttribute('hidden', '');
      if (this.toggleButton) {
        this.toggleButton.setAttribute('aria-expanded', 'false');
        const icon = this.toggleButton.querySelector('span');
        if (icon) icon.textContent = '▾';
      }
    }
    if (this.animationDescriptionEl) {
      this.animationDescriptionEl.textContent = this.detail.animation?.description || '';
    }

    this.bus.emit('ui:controls-register', {
      id: this.detail.id,
      controls: this.detail.animation?.controls || [],
      container: this.controlsEl
    });

    this.bus.emit('experiment:mount-animation', {
      id: this.detail.id,
      config: this.detail.animation,
      canvas: this.canvasEl
    });
  }

  onAnimationStatus({ message, type }) {
    if (!this.animationStatusEl) return;
    if (type === 'hidden') {
      this.animationStatusEl.setAttribute('hidden', '');
    } else {
      this.animationStatusEl.textContent = message;
      this.animationStatusEl.removeAttribute('hidden');
    }
  }

  renderHome(experiments = []) {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';

    if (!experiments.length) {
      this.showStatus("Aucun phénomène n'a été trouvé.");
      return;
    }

    const fragment = document.createDocumentFragment();
    experiments.forEach((item) => {
      const card = this.createCard(item);
      fragment.appendChild(card);
    });
    this.gridEl.appendChild(fragment);

    const offFilter = this.bus.on('interface:filter', ({ term }) => {
      this.filterCards(term);
    });
    this.unsubscribe.push(offFilter);
  }

  createCard(item) {
    const article = document.createElement('article');
    article.className = 'card fade-in';
    article.innerHTML = `
      <div class="icon" aria-hidden="true">${item.icon || '🧪'}</div>
      <h2>${item.title}</h2>
      <p>${item.summary}</p>
      <div class="card-footer">
        <span>${(item.tags || []).slice(0, 2).join(' · ')}</span>
        <span aria-hidden="true">→</span>
      </div>
    `;
    const link = document.createElement('a');
    link.href = `#${encodeURIComponent(item.id)}`;
    link.setAttribute('data-id', item.id);
    link.appendChild(article);
    return link;
  }

  filterCards(term) {
    if (!this.gridEl) return;
    const cards = Array.from(this.gridEl.querySelectorAll('a'));
    let matches = 0;
    cards.forEach((anchor) => {
      const text = anchor.textContent.toLowerCase();
      const visible = !term || text.includes(term);
      anchor.style.display = visible ? '' : 'none';
      if (visible) matches += 1;
    });
    if (this.statusEl) {
      if (matches === 0) {
        this.showStatus('Aucune expérience ne correspond à votre recherche.');
      } else {
        this.hideStatus();
      }
    }
  }

  showStatus(message) {
    if (!this.statusEl) return;
    this.statusEl.textContent = message;
    this.statusEl.classList.add('is-visible');
  }

  hideStatus() {
    if (!this.statusEl) return;
    this.statusEl.textContent = '';
    this.statusEl.classList.remove('is-visible');
  }

  applyRoute() {
    const hash = window.location.hash.replace('#', '').trim();
    if (!hash) {
      this.showHome();
      return;
    }
    if (!this.experiments.length) {
      this.pendingRoute = hash;
    }
    this.navigateTo(hash);
  }

  navigateTo(id) {
    if (!id) {
      this.showHome();
      return;
    }

    this.currentId = id;
    this.setView('detail');
    this.prepareDetailShell();

    this.bus.emit('experiment:dispose-animation');
    this.bus.emit('ui:controls-register', { id: '__none__', controls: [], container: this.controlsEl });

    this.bus.emit('data:request-detail', { id });

    if (this.animationStatusEl) {
      this.animationStatusEl.removeAttribute('hidden');
      this.animationStatusEl.textContent = "Initialisation de l'expérience…";
    }
  }

  prepareDetailShell() {
    if (this.titleEl) {
      this.titleEl.textContent = 'Chargement…';
      document.title = 'Lab – Expérience quantique';
    }
    if (this.tagsEl) {
      this.tagsEl.textContent = '';
    }
    if (this.introEl) {
      this.introEl.textContent = 'Nous préparons l\'expérience…';
    }
    if (this.detailsContainer) {
      this.detailsContainer.innerHTML = '';
      this.detailsContainer.setAttribute('hidden', '');
    }
    if (this.animationDescriptionEl) {
      this.animationDescriptionEl.textContent = '';
    }
    if (this.canvasEl) {
      this.canvasEl.innerHTML = '';
    }
    if (this.controlsEl) {
      this.controlsEl.innerHTML = '';
    }
  }

  showHome() {
    this.setView('home');
    this.currentId = null;
    this.detail = null;
    document.title = 'Lab – Expérimentez les limites du réel';
    this.hideStatus();
    if (this.animationStatusEl) {
      this.animationStatusEl.setAttribute('hidden', '');
      this.animationStatusEl.textContent = '';
    }
    if (this.canvasEl) {
      this.canvasEl.innerHTML = '';
    }
    if (this.controlsEl) {
      this.controlsEl.innerHTML = '';
    }
    this.bus.emit('experiment:dispose-animation');
    this.bus.emit('ui:controls-register', { id: '__none__', controls: [], container: this.controlsEl });
  }

  setView(view) {
    if (view === 'detail') {
      document.body.dataset.route = 'detail';
      if (this.homeView) {
        this.homeView.setAttribute('hidden', '');
      }
      if (this.detailView) {
        this.detailView.removeAttribute('hidden');
      }
    } else {
      document.body.dataset.route = 'home';
      if (this.homeView) {
        this.homeView.removeAttribute('hidden');
      }
      if (this.detailView) {
        this.detailView.setAttribute('hidden', '');
      }
    }
  }

  showExperimentError(message) {
    this.prepareDetailShell();
    if (this.titleEl) {
      this.titleEl.textContent = 'Expérience indisponible';
    }
    if (this.introEl) {
      this.introEl.textContent = message;
    }
    if (this.animationStatusEl) {
      this.animationStatusEl.removeAttribute('hidden');
      this.animationStatusEl.textContent = message;
    }
  }
}
