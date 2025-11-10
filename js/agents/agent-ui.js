export class AgentUI {
  constructor(bus) {
    this.bus = bus;
    this.pageType = this.detectPageType();
    this.container = null;
    this.cleanups = [];
  }

  detectPageType() {
    return window.location.pathname.includes('/experiments/') ? 'experiment' : 'index';
  }

  init() {
    if (this.pageType !== 'experiment') return;
    this.container = document.querySelector('[data-controls]');
    if (!this.container) return;

    this.bus.on('animation:loaded', ({ controls, state }) => {
      this.renderControls(controls, state);
    });
  }

  renderControls(controls, state) {
    this.container.innerHTML = '';
    this.cleanups.forEach((dispose) => dispose());
    this.cleanups = [];

    if (!controls || controls.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Aucun paramètre ajustable pour cette expérience.';
      empty.style.color = 'var(--muted-color)';
      this.container.appendChild(empty);
      return;
    }

    controls.forEach((control) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'control';
      const label = document.createElement('label');
      label.setAttribute('for', `control-${control.key}`);
      label.textContent = control.label;
      wrapper.appendChild(label);

      if (control.type === 'range') {
        const input = document.createElement('input');
        input.type = 'range';
        input.id = `control-${control.key}`;
        input.min = control.min;
        input.max = control.max;
        input.step = control.step;
        input.value = state[control.key];
        const decimals = ((control.step || 1).toString().split('.')[1] || '').length;
        const formatValue = (value) =>
          `${(control.step % 1 === 0 ? Math.round(value) : value.toFixed(decimals))}${
            control.unit ? ` ${control.unit}` : ''
          }`;
        const valueLabel = document.createElement('span');
        valueLabel.style.color = 'var(--accent-color)';
        valueLabel.textContent = formatValue(state[control.key]);
        const handler = (event) => {
          const rawValue = parseFloat(event.target.value);
          const finalValue = control.step % 1 === 0 ? Math.round(rawValue) : rawValue;
          valueLabel.textContent = formatValue(finalValue);
          this.bus.emit('ui:change', { key: control.key, value: finalValue });
        };
        input.addEventListener('input', handler);
        wrapper.appendChild(input);
        wrapper.appendChild(valueLabel);
        this.cleanups.push(() => input.removeEventListener('input', handler));
      }

      this.container.appendChild(wrapper);
    });
  }

  dispose() {
    this.cleanups.forEach((dispose) => dispose());
    this.cleanups = [];
  }
}
