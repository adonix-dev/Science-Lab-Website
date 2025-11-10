import { createTunnelSketch } from './tunnel.js';
import { createDoubleSlitSketch } from './double-slit.js';
import { createMachZehnderSketch } from './mach-zehnder.js';
import { createPhotoelectricSketch } from './photoelectric.js';
import { createSternGerlachSketch } from './stern-gerlach.js';
import { createEntanglementSketch } from './entanglement.js';
import { createBellInequalitySketch } from './bell-inequality.js';

export const animationFactories = {
  tunnel: createTunnelSketch,
  doubleSlit: createDoubleSlitSketch,
  machZehnder: createMachZehnderSketch,
  photoelectric: createPhotoelectricSketch,
  sternGerlach: createSternGerlachSketch,
  entanglement: createEntanglementSketch,
  bellInequality: createBellInequalitySketch
};
