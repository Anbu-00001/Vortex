import { create } from 'zustand';

interface VortexState {
  particleDensity: number;
  vortexSpeed: number;
  baseColor: string;
  setParticleDensity: (density: number) => void;
  setVortexSpeed: (speed: number) => void;
  setBaseColor: (color: string) => void;
}

const useVortexStore = create<VortexState>((set) => ({
  particleDensity: 100,
  vortexSpeed: 1.0,
  baseColor: '#ffffff',
  setParticleDensity: (density) => set({ particleDensity: density }),
  setVortexSpeed: (speed) => set({ vortexSpeed: speed }),
  setBaseColor: (color) => set({ baseColor: color }),
}));

export { useVortexStore };