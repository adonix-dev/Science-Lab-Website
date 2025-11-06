export class AgentTheme {
  constructor(bus) {
    this.bus = bus;
    this.theme = 'dark';
    this.accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
  }

  init() {
    this.applyTheme(this.theme);
  }

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.dataset.theme = theme;
  }

  applyAccent(color) {
    this.accent = color;
    document.documentElement.style.setProperty('--accent-color', color);
  }

  dispose() {}
}
