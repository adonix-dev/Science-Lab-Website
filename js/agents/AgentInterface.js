export default class AgentInterface {
  constructor(bus) {
    this.bus = bus;
    this.pageType = document.body?.dataset.page || 'index';
    this.grid = null;
    this.template = null;
    this.searchInput = null;
  }

  init() {
    if (this.pageType === 'index') {
      this.grid = document.getElementById('experimentsGrid');
      this.template = document.getElementById('cardTemplate');
      this.searchInput = document.getElementById('searchInput');
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (event) => {
          const value = event.target.value.trim().toLowerCase();
          this.bus.emit('interface:filter', value);
          this.filterCards(value);
        });
      }
      this.bus.on('data:ready', ({ phenomenes }) => this.renderCards(phenomenes));
      this.bus.on('data:refreshed', ({ phenomenes }) => this.updateCards(phenomenes));
    } else if (this.pageType === 'experiment') {
      this.title = document.getElementById('experimentTitle');
      this.resume = document.getElementById('experimentResume');
      this.text = document.getElementById('experimentUniversitaire');
      const experimentId = document.body.dataset.experimentId;
      this.bus.on('data:ready', ({ phenomenes }) => this.renderExperiment(phenomenes, experimentId));
      this.bus.on('data:refreshed', ({ phenomenes }) => this.renderExperiment(phenomenes, experimentId));
      this.bus.emit('data:requestById', experimentId);
      this.bus.on('data:one', ({ id, phenomenon }) => {
        if (id === experimentId && phenomenon) {
          this.renderExperiment([phenomenon], experimentId);
        }
      });
    }
  }

  dispose() {}

  renderCards(phenomenes) {
    if (!this.grid || !this.template) return;
    this.grid.innerHTML = '';
    phenomenes.forEach((item) => {
      const clone = this.template.content.cloneNode(true);
      const link = clone.querySelector('.card__link');
      const title = clone.querySelector('.card__title');
      const summary = clone.querySelector('.card__summary');
      link.href = `./experiments/${item.id}.html`;
      link.dataset.id = item.id;
      title.textContent = item.titre;
      summary.textContent = item.resume;
      link.addEventListener('click', () => {
        this.bus.emit('interface:navigate', { id: item.id });
      });
      const article = clone.querySelector('.card');
      article.classList.add('fade-in');
      this.grid.appendChild(clone);
    });
  }

  updateCards(phenomenes) {
    if (!this.grid) return;
    const cards = this.grid.querySelectorAll('.card__link');
    cards.forEach((link) => {
      const item = phenomenes.find((p) => `./experiments/${p.id}.html` === link.getAttribute('href'));
      if (item) {
        link.querySelector('.card__title').textContent = item.titre;
        link.querySelector('.card__summary').textContent = item.resume;
      }
    });
  }

  filterCards(query) {
    if (!this.grid) return;
    const cards = Array.from(this.grid.querySelectorAll('.card'));
    cards.forEach((card) => {
      const link = card.querySelector('.card__link');
      const text = `${link.querySelector('.card__title').textContent} ${link.querySelector('.card__summary').textContent}`.toLowerCase();
      const match = text.includes(query);
      card.style.display = match ? 'block' : 'none';
    });
  }

  renderExperiment(phenomenes, experimentId) {
    const phenomenon = Array.isArray(phenomenes)
      ? phenomenes.find((item) => item.id === experimentId)
      : null;
    if (!phenomenon || !this.title) return;
    this.title.textContent = phenomenon.titre;
    this.resume.textContent = phenomenon.resume;
    this.text.textContent = phenomenon.universitaire;
    this.title.classList.add('fade-in');
    this.resume.classList.add('fade-in');
    this.text.classList.add('fade-in');
    this.bus.emit('interface:experiment', { phenomenon });
  }
}
