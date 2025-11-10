export default class AgentUI {
  constructor(bus) {
    this.bus = bus;
    this.container = null;
    this.controls = [];
  }

  init() {
    this.container = document.getElementById('controlsContainer');
    this.bus.on('animation:controls', (controls) => this.renderControls(controls));
  }

  dispose() {
    this.clear();
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.controls = [];
  }

  renderControls(controls) {
    this.clear();
    if (!this.container || !Array.isArray(controls)) return;
    controls.forEach((control) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'control fade-in';
      const label = document.createElement('div');
      label.className = 'control__label';
      const spanName = document.createElement('span');
      spanName.textContent = control.label;
      const spanValue = document.createElement('span');
      spanValue.textContent = control.format(control.value);
      label.append(spanName, spanValue);
      const input = document.createElement('input');
      input.type = 'range';
      input.min = control.min;
      input.max = control.max;
      input.step = control.step;
      input.value = control.value;
      input.addEventListener('input', () => {
        const newValue = Number(input.value);
        spanValue.textContent = control.format(newValue);
        this.bus.emit('ui:change', { id: control.id, value: newValue });
      });
      wrapper.append(label, input);
      this.container.append(wrapper);
    });
  }
}
