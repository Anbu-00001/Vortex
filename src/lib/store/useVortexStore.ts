import { create } from 'zustand';

interface VortexState {
  particleDensity: number;
  verticalClimb: number;
  vortexSpeed: number;
  baseColor: string;
  setParticleDensity: (density: number) => void;
  setVerticalClimb: (climb: number) => void;
  setVortexSpeed: (speed: number) => void;
  setBaseColor: (color: string) => void;
}

const useVortexStore = create<VortexState>((set) => ({
  particleDensity: 2.0,
  verticalClimb: 0.05,
  vortexSpeed: 1.0,
  baseColor: '#ffffff',
  setParticleDensity: (density) => set({ particleDensity: density }),
  setVerticalClimb: (climb) => set({ verticalClimb: climb }),
  setVortexSpeed: (speed) => set({ vortexSpeed: speed }),
  setBaseColor: (color) => set({ baseColor: color }),
}));

export { useVortexStore };