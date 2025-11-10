export class UIAgent {
  constructor(bus) {
    this.bus = bus;
    this.unsubscribe = [];
    this.currentId = null;
    this.inputs = new Map();
  }

  init() {
    this.unsubscribe.push(this.bus.on('ui:controls-register', (payload) => this.renderControls(payload)));
    this.unsubscribe.push(this.bus.on('animation:reset-controls', (payload) => this.resetControls(payload)));
  }

  dispose() {
    this.unsubscribe.forEach((off) => off());
    this.unsubscribe = [];
    this.inputs.forEach((input, key) => {
      input.removeEventListener('input', input.__handler);
      if (input.type === 'checkbox') {
        input.removeEventListener('change', input.__handler);
      }
    });
    this.inputs.clear();
  }

  renderControls({ id, controls, container }) {
    if (!container) return;
    container.innerHTML = '';
    this.currentId = id;
    this.inputs.forEach((input, key) => {
      input.removeEventListener('input', input.__handler);
      if (input.type === 'checkbox') {
        input.removeEventListener('change', input.__handler);
      }
    });
    this.inputs.clear();

    controls.forEach((control) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'control';
      const label = document.createElement('label');
      label.textContent = control.label;
      label.setAttribute('for', `${id}-${control.id}`);
      wrapper.appendChild(label);

      if (control.type === 'range') {
        const input = document.createElement('input');
        input.type = 'range';
        input.min = control.min;
        input.max = control.max;
        input.step = control.step;
        input.value = control.value;
        input.id = `${id}-${control.id}`;
        input.dataset.controlId = control.id;
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'control-value';
        valueDisplay.textContent = `${Number(control.value).toFixed(2)} ${control.unit || ''}`.trim();
        wrapper.appendChild(input);
        wrapper.appendChild(valueDisplay);

        const handler = (event) => {
          const val = parseFloat(event.target.value);
          valueDisplay.textContent = `${val.toFixed(2)} ${control.unit || ''}`.trim();
          this.bus.emit('ui:change', {
            experimentId: this.currentId,
            controlId: control.id,
            value: val
          });
        };
        input.__handler = handler;
        input.addEventListener('input', handler);
        this.inputs.set(control.id, input);
      } else if (control.type === 'toggle') {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${id}-${control.id}`;
        checkbox.checked = Boolean(control.value);
        checkbox.dataset.controlId = control.id;
        const toggleLabel = document.createElement('span');
        toggleLabel.className = 'control-toggle';
        toggleLabel.textContent = checkbox.checked ? 'Activé' : 'Désactivé';
        wrapper.appendChild(checkbox);
        wrapper.appendChild(toggleLabel);

        const handler = (event) => {
          const val = event.target.checked;
          toggleLabel.textContent = val ? 'Activé' : 'Désactivé';
          this.bus.emit('ui:change', {
            experimentId: this.currentId,
            controlId: control.id,
            value: val
          });
        };
        checkbox.__handler = handler;
        checkbox.addEventListener('change', handler);
        this.inputs.set(control.id, checkbox);
      }

      if (control.description) {
        const small = document.createElement('small');
        small.textContent = control.description;
        small.className = 'control-hint';
        wrapper.appendChild(small);
      }

      container.appendChild(wrapper);
    });
  }

  resetControls(payload) {
    if (!payload) return;
    Object.entries(payload).forEach(([id, value]) => {
      const input = this.inputs.get(id);
      if (!input) return;
      if (input.type === 'range') {
        input.value = value;
        input.dispatchEvent(new Event('input'));
      } else if (input.type === 'checkbox') {
        input.checked = Boolean(value);
        input.dispatchEvent(new Event('change'));
      }
    });
  }
}
