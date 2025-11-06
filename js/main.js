import { EventBus } from './utils/event-bus.js';
import { AgentData } from './agents/agent-data.js';
import { AgentInterface } from './agents/agent-interface.js';
import { AgentAnimation } from './agents/agent-animation.js';
import { AgentPhysics } from './agents/agent-physics.js';
import { AgentUI } from './agents/agent-ui.js';
import { AgentTheme } from './agents/agent-theme.js';
import { AgentLogger } from './agents/agent-logger.js';

const bus = new EventBus();

const dataAgent = new AgentData(bus);
const physicsAgent = new AgentPhysics(bus);
const interfaceAgent = new AgentInterface(bus, dataAgent);
const animationAgent = new AgentAnimation(bus, physicsAgent);
const uiAgent = new AgentUI(bus);
const themeAgent = new AgentTheme(bus);
const loggerAgent = new AgentLogger(bus);

(async () => {
  loggerAgent.init();
  themeAgent.init();
  physicsAgent.init();
  interfaceAgent.init();
  animationAgent.init();
  uiAgent.init();
  await dataAgent.init();
})();

window.__LAB_APP__ = {
  bus,
  dispose() {
    uiAgent.dispose();
    animationAgent.dispose();
    interfaceAgent.dispose();
    dataAgent.dispose();
    themeAgent.dispose();
    loggerAgent.dispose();
  }
};
