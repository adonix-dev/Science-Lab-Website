export class ThemeAgent {
  constructor(bus) {
    this.bus = bus;
  }

  init() {
    document.documentElement.style.setProperty('--accent-color', '#3ad7ff');
  }

  dispose() {}
}
