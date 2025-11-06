export class AgentInterface {
  constructor(bus, dataAgent) {
    this.bus = bus;
    this.dataAgent = dataAgent;
    this.pageType = this.detectPageType();
    this.cleanupCallbacks = [];
  }

  detectPageType() {
    const path = window.location.pathname;
    if (path.includes('/experiments/')) {
      return 'experiment';
    }
    return 'index';
  }

  init() {
    const buildPage = () => {
      if (this.pageType === 'index') {
        this.buildIndexPage();
      } else {
        this.buildExperimentPage();
      }
    };

    if (this.dataAgent.ready) {
      buildPage();
    } else {
      const dispose = this.bus.once('data:ready', () => {
        buildPage();
      });
      this.cleanupCallbacks.push(dispose);
    }
  }

  buildIndexPage() {
    const searchInput = document.querySelector('[data-search]');
    const grid = document.querySelector('[data-grid]');
    if (!grid) return;

    const renderCards = (filter = '') => {
      const phenomenes = this.dataAgent
        .getPhenomenes()
        .filter((phenom) => {
          const query = filter.toLowerCase();
          if (!query) return true;
          return (
            phenom.titre.toLowerCase().includes(query) ||
            phenom.resume.toLowerCase().includes(query)
          );
        });

      grid.innerHTML = '';
      phenomenes.forEach((phenom, index) => {
        const card = document.createElement('a');
        card.href = `./experiments/${phenom.id}.html`;
        card.className = 'card fade-in';
        card.style.animationDelay = `${index * 80}ms`;
        card.innerHTML = `
          <div class="icon" aria-hidden="true">⚛️</div>
          <h2>${phenom.titre}</h2>
          <p>${phenom.resume}</p>
          <div class="card-footer">
            <span>Explorer</span>
            <span aria-hidden="true">→</span>
          </div>
        `;
        card.addEventListener('click', () => {
          this.bus.emit('interface:navigate', { target: phenom.id });
        });
        grid.appendChild(card);
      });
    };

    renderCards();

    if (searchInput) {
      const onInput = (event) => {
        const value = event.target.value;
        this.bus.emit('interface:filter', { query: value });
        renderCards(value);
      };
      searchInput.addEventListener('input', onInput);
      this.cleanupCallbacks.push(() => searchInput.removeEventListener('input', onInput));
    }
  }

  buildExperimentPage() {
    const container = document.querySelector('[data-experiment-container]');
    const detailsButton = document.querySelector('[data-toggle-details]');
    const detailsContent = document.querySelector('[data-details]');
    const replayButton = document.querySelector('[data-replay]');
    const returnButton = document.querySelector('[data-return]');

    const experimentId = document.body.dataset.experimentId;
    const phenomenon = this.dataAgent.getPhenomenonById(experimentId);

    if (!phenomenon) {
      container.innerHTML = '<p>Phénomène introuvable. Vérifiez l\'identifiant.</p>';
      return;
    }

    const title = container.querySelector('[data-title]');
    const summary = container.querySelector('[data-summary]');
    const academic = container.querySelector('[data-academic]');
    const animationNotes = container.querySelector('[data-animation-notes]');

    if (title) title.textContent = phenomenon.titre;
    if (summary) summary.textContent = phenomenon.resume;
    if (academic) academic.textContent = phenomenon.universitaire;
    if (animationNotes) animationNotes.textContent = phenomenon.animation;

    if (detailsButton && detailsContent) {
      const toggleDetails = () => {
        const isHidden = detailsContent.hasAttribute('hidden');
        if (isHidden) {
          detailsContent.removeAttribute('hidden');
          detailsButton.setAttribute('aria-expanded', 'true');
          detailsButton.innerHTML = 'Masquer “Pour aller plus loin”';
        } else {
          detailsContent.setAttribute('hidden', 'hidden');
          detailsButton.setAttribute('aria-expanded', 'false');
          detailsButton.innerHTML = 'Afficher “Pour aller plus loin”';
        }
      };
      detailsButton.addEventListener('click', toggleDetails);
      this.cleanupCallbacks.push(() => detailsButton.removeEventListener('click', toggleDetails));
    }

    if (replayButton) {
      const onReplay = () => {
        this.bus.emit('interface:replay', { id: experimentId });
      };
      replayButton.addEventListener('click', onReplay);
      this.cleanupCallbacks.push(() => replayButton.removeEventListener('click', onReplay));
    }

    if (returnButton) {
      returnButton.addEventListener('click', () => {
        window.location.href = '../index.html';
      });
    }
  }

  dispose() {
    this.cleanupCallbacks.forEach((dispose) => dispose());
    this.cleanupCallbacks = [];
  }
}
