import { EventBus } from './utils/event-bus.js';
import { DataAgent } from './agents/data-agent.js';
import { InterfaceAgent } from './agents/interface-agent.js';
import { AnimationAgent } from './agents/animation-agent.js';
import { PhysicsAgent } from './agents/physics-agent.js';
import { UIAgent } from './agents/ui-agent.js';
import { ThemeAgent } from './agents/theme-agent.js';
import { LoggerAgent } from './agents/logger-agent.js';

const bus = new EventBus();

const dataAgent = new DataAgent(bus);
const physicsAgent = new PhysicsAgent(bus);
const interfaceAgent = new InterfaceAgent(bus);
const animationAgent = new AnimationAgent(bus, physicsAgent);
const uiAgent = new UIAgent(bus);
const themeAgent = new ThemeAgent(bus);
const loggerAgent = new LoggerAgent(bus);

(async () => {
  themeAgent.init();
  loggerAgent.init();
  physicsAgent.init();
  interfaceAgent.init();
  animationAgent.init();
  uiAgent.init();
  await dataAgent.init();
})();

window.__LAB_APP__ = {
  dispose() {
    uiAgent.dispose();
    animationAgent.dispose();
    interfaceAgent.dispose();
    dataAgent.dispose();
    themeAgent.dispose?.();
    loggerAgent.dispose?.();
  }
};
