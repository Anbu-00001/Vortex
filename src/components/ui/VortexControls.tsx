"use client";

import { useVortexStore } from '@/lib/store/useVortexStore';

export default function VortexControls() {
  // Consolidate all Zustand state and setters into a single hook call
  const { particleDensity, verticalClimb, setParticleDensity, setVerticalClimb } = useVortexStore((state) => ({
    particleDensity: state.particleDensity,
    verticalClimb: state.verticalClimb,
    setParticleDensity: state.setParticleDensity,
    setVerticalClimb: state.setVerticalClimb,
  }));

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg backdrop-blur-md shadow-lg border border-white/20 w-72">
      <h3 className="text-sm font-semibold mb-3">Chronovortex Controls</h3>

      <label className="block text-xs text-gray-300 mb-1" htmlFor="density-range">
        Density / Spread: {particleDensity.toFixed(1)}
      </label>
      <input
        id="density-range"
        type="range"
        min="0.5"
        max="12"
        step="0.1"
        value={particleDensity}
        onChange={(e) => setParticleDensity(Number(e.target.value))}
        className="w-full mb-4"
      />

      <label className="block text-xs text-gray-300 mb-1" htmlFor="climb-range">
        Vertical Climb: {verticalClimb.toFixed(3)}
      </label>
      <input
        id="climb-range"
        type="range"
        min="0.01"
        max="0.2"
        step="0.005"
        value={verticalClimb}
        onChange={(e) => setVerticalClimb(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
