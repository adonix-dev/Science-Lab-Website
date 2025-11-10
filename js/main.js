import EventBus from './agents/EventBus.js';
import AgentData from './agents/AgentData.js';
import AgentInterface from './agents/AgentInterface.js';
import AgentAnimation from './agents/AgentAnimation.js';
import AgentPhysics from './agents/AgentPhysics.js';
import AgentUI from './agents/AgentUI.js';
import AgentTheme from './agents/AgentTheme.js';
import AgentLogger from './agents/AgentLogger.js';

const bus = new EventBus();

const agents = [];

const dataAgent = new AgentData(bus);
const physicsAgent = new AgentPhysics(bus);
const interfaceAgent = new AgentInterface(bus);
const animationAgent = new AgentAnimation(bus, physicsAgent);
const uiAgent = new AgentUI(bus);
const themeAgent = new AgentTheme(bus);
const loggerAgent = new AgentLogger(bus);

agents.push(dataAgent, physicsAgent, interfaceAgent, animationAgent, uiAgent, themeAgent, loggerAgent);

agents.forEach((agent) => {
  if (typeof agent.init === 'function') {
    agent.init();
  }
});

bus.emit('theme:accent', '#32d5ff');

window.addEventListener('beforeunload', () => {
  agents.forEach((agent) => {
    if (typeof agent.dispose === 'function') {
      agent.dispose();
    }
  });
});
