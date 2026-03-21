"use client";

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { NormalizedContribution } from '../../lib/graphql/queries';

interface SpiralVortexProps {
  contributions: NormalizedContribution[];
  // Default constants for the logarithmic spiral
  a?: number; // Base radius multiplier
  k?: number; // Intensity scaling factor
  w?: number; // Angular frequency (radians per day)
  h?: number; // Height per day
  pointSize?: number;
  pointColor?: string;
}

export default function SpiralVortex({
  contributions,
  a = 0.5,
  k = 2.0,
  w = 0.1,
  h = 0.05,
  pointSize = 0.02,
  pointColor = '#00ff88'
}: SpiralVortexProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(contributions.length * 3);
    const colors = new Float32Array(contributions.length * 3);

    contributions.forEach((contribution, index) => {
      const { dayIndex, normalizedIntensity } = contribution;

      // Calculate spiral position using logarithmic equations
      const radius = a * Math.log(1 + dayIndex) + (k * normalizedIntensity);
      const theta = w * dayIndex;
      const height = h * dayIndex;

      // Convert to Cartesian coordinates
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      const z = height;

      // Set position
      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;

      // Set color based on intensity (brighter for higher intensity)
      const intensity = Math.max(0.2, normalizedIntensity); // Minimum brightness
      colors[index * 3] = intensity; // R
      colors[index * 3 + 1] = 1.0; // G
      colors[index * 3 + 2] = intensity * 0.5; // B
    });

    return { positions, colors };
  }, [contributions, a, k, w, h]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={pointSize}
        vertexColors
        transparent
        alphaTest={0.001}
        sizeAttenuation={false}
      />
    </points>
  );
}