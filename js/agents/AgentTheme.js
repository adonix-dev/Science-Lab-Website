export default class AgentTheme {
  constructor(bus) {
    this.bus = bus;
    this.root = document.documentElement;
  }

  init() {
    this.applyDark();
    this.bus.on('theme:set', (theme) => this.setTheme(theme));
    this.bus.on('theme:accent', (color) => this.applyAccent(color));
  }

  dispose() {}

  setTheme(theme) {
    if (theme === 'light') {
      this.root.style.setProperty('--background', '#f5f7fb');
      this.root.style.setProperty('--foreground', '#111826');
      this.root.style.setProperty('--card-bg', 'rgba(255,255,255,0.85)');
      this.root.style.setProperty('--muted', '#475569');
    } else {
      this.applyDark();
    }
  }

  applyDark() {
    this.root.style.setProperty('--background', '#0c1018');
    this.root.style.setProperty('--foreground', '#e5f1ff');
    this.root.style.setProperty('--card-bg', 'rgba(18, 24, 36, 0.85)');
    this.root.style.setProperty('--muted', '#94a3b8');
  }

  applyAccent(color) {
    this.root.style.setProperty('--accent', color || '#32d5ff');
  }
}
