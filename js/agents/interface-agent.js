export class InterfaceAgent {
  constructor(bus) {
    this.bus = bus;
    this.unsubscribe = [];
    this.page = document.body?.dataset?.page || 'home';
    this.statusEl = document.querySelector('[data-status]');
    this.searchInput = document.querySelector('[data-search]');
    this.gridEl = document.querySelector('[data-grid]');
    this.detail = null;
    this.experimentId = null;
    this.toggleButton = null;
    this.detailsContainer = null;
    this.returnButton = document.querySelector('[data-return]');
    this.introEl = document.querySelector('[data-introduction]');
    this.titleEl = document.querySelector('[data-experiment-title]');
    this.tagsEl = document.querySelector('[data-experiment-tags]');
    this.animationDescriptionEl = document.querySelector('[data-animation-description]');
    this.canvasEl = document.querySelector('[data-canvas]');
    this.controlsEl = document.querySelector('[data-controls]');
    this.animationStatusEl = document.querySelector('[data-animation-status]');
    this.replayButton = document.querySelector('[data-replay]');
    this.searchHandler = null;
  }

  init() {
    this.unsubscribe.push(this.bus.on('data:ready', ({ experiments }) => this.onDataReady(experiments)));
    this.unsubscribe.push(this.bus.on('data:error', (payload) => this.onDataError(payload)));
    this.unsubscribe.push(this.bus.on('animation:status', (payload) => this.onAnimationStatus(payload)));

    if (this.page === 'home') {
      this.setupSearch();
    } else if (this.page === 'experiment') {
      this.prepareExperiment();
    }
  }

  dispose() {
    this.unsubscribe.forEach((off) => off());
    this.unsubscribe = [];
    if (this.searchInput && this.searchHandler) {
      this.searchInput.removeEventListener('input', this.searchHandler);
    }
  }

  onDataReady(experiments) {
    if (this.page === 'home') {
      this.renderHome(experiments);
    } else if (this.page === 'experiment') {
      this.requestExperimentDetail();
    }
  }

  onDataError() {
    if (this.page === 'home' && this.statusEl) {
      this.statusEl.textContent = "Impossible de charger les expériences. Utilisez le fallback intégré.";
      this.statusEl.classList.add('is-visible');
    }
    if (this.page === 'experiment') {
      this.showExperimentError("Phénomène introuvable. Vérifiez l'identifiant.");
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
    link.href = `./experiment.html?id=${encodeURIComponent(item.id)}`;
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

  prepareExperiment() {
    const params = new URLSearchParams(window.location.search);
    this.experimentId = params.get('id') || window.location.hash.replace('#', '');
    if (!this.experimentId) {
      this.showExperimentError("Phénomène introuvable. Vérifiez l'identifiant.");
      return;
    }
    if (this.returnButton) {
      this.returnButton.addEventListener('click', () => {
        window.location.href = './index.html';
      });
    }
    this.toggleButton = document.querySelector('[data-toggle-details]');
    this.detailsContainer = document.querySelector('[data-details]');
    if (this.toggleButton && this.detailsContainer) {
      this.toggleButton.addEventListener('click', () => {
        const isHidden = this.detailsContainer.hasAttribute('hidden');
        if (isHidden) {
          this.detailsContainer.removeAttribute('hidden');
          this.toggleButton.setAttribute('aria-expanded', 'true');
          this.toggleButton.querySelector('span').textContent = '▴';
        } else {
          this.detailsContainer.setAttribute('hidden', '');
          this.toggleButton.setAttribute('aria-expanded', 'false');
          this.toggleButton.querySelector('span').textContent = '▾';
        }
      });
    }
    if (this.replayButton) {
      this.replayButton.addEventListener('click', () => {
        this.bus.emit('animation:replay');
      });
    }
  }

  requestExperimentDetail() {
    if (!this.experimentId) return;
    this.bus.emit('data:request-detail', { id: this.experimentId });
    if (this.animationStatusEl) {
      this.animationStatusEl.removeAttribute('hidden');
      this.animationStatusEl.textContent = "Initialisation de l'expérience…";
    }
    this.unsubscribe.push(this.bus.on('data:detail', (payload) => this.onExperimentData(payload)));
  }

  onExperimentData(payload) {
    if (!payload || payload.id !== this.experimentId) return;
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

  showExperimentError(message) {
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
    if (this.controlsEl) {
      this.controlsEl.innerHTML = '';
    }
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
}
