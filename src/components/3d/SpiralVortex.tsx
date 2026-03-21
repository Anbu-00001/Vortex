"use client";

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NormalizedContribution } from '../../lib/graphql/queries';
import { useVortexStore } from '@/lib/store/useVortexStore';

interface SpiralVortexProps {
  contributions: NormalizedContribution[];
}

// Vertex Shader - handles pulsing motion, intensity boosting, and sizing
const vertexShader = `
  attribute float intensity;
  
  varying float vIntensity;
  
  uniform float uTime;
  
  void main() {
    // Boost intensity so more values reach bright white threshold
    float boostedIntensity = smoothstep(0.1, 0.6, intensity);
    vIntensity = boostedIntensity;
    
    // Apply pulsing motion based on uTime and position.z
    vec3 pos = position;
    pos.x += sin(uTime * 2.0 + position.z) * 0.5;
    pos.y += cos(uTime * 2.0 + position.z) * 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Set point size based on boosted intensity
    gl_PointSize = 6.0 + (boostedIntensity * 8.0);
  }
`;

// Fragment Shader - monochromatic deep-space theme with soft particles + Dark Star highlights
const fragmentShader = `
  varying float vIntensity;
  
  void main() {
    // Calculate distance from center of point
    float dist = distance(gl_PointCoord, vec2(0.5));

    // Discard pixels outside the point radius
    if (dist > 0.5) {
      discard;
    }

    // Soft corona alpha base
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

    // Base color for low/medium intensity
    vec3 baseGray = vec3(0.2, 0.2, 0.2);
    vec3 baseWhite = vec3(0.8, 0.8, 0.8);
    vec3 color = mix(baseGray, baseWhite, vIntensity);

    // Dark Star effect for very high intensity points (hotspots)
    // Threshold around 0.9 (adjust this if your normalized intensity mapping differs).
    float darkStarThreshold = 0.9;
    if (vIntensity > darkStarThreshold) {
      if (dist < 0.15) {
        // Carve out center as black core
        color = vec3(0.0);
      } else {
        // Bright overblown white ring for heavy bloom catch
        color = vec3(2.0);
      }
    }

    // Apply fragment alpha
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function SpiralVortex({ contributions }: SpiralVortexProps) {
  // All hooks must be called at the top level, in the same order every render
  const pointsRef = useRef<THREE.Points>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Consolidate all Zustand state into a single hook call to ensure consistent hook order
  const { particleDensity, verticalClimb, vortexSpeed } = useVortexStore((state) => ({
    particleDensity: state.particleDensity,
    verticalClimb: state.verticalClimb,
    vortexSpeed: state.vortexSpeed,
  }));

  // Constants derived from store state (not hooks, just variables)
  const a = particleDensity; // Density/spread (log radius base multiplier)
  const h = verticalClimb;   // Vertical climb per day
  const k = 0.5;             // Intensity scaling factor (static for now)
  const w = 0.15;            // Angular frequency (static for now)

  const { positions, intensities } = useMemo(() => {
    const positions = new Float32Array(contributions.length * 3);
    const intensities = new Float32Array(contributions.length);

    contributions.forEach((contribution, index) => {
      const { dayIndex, normalizedIntensity } = contribution;

      // Calculate spiral position using logarithmic equations
      const radius = a * Math.log(1 + dayIndex) + (k * normalizedIntensity);
      const theta = w * dayIndex;
      const z = h * dayIndex;

      // Convert to Cartesian coordinates
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);

      // Set position
      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;

      // Store intensity for shader
      intensities[index] = normalizedIntensity;
    });

    return { positions, intensities };
  }, [contributions, a, h]); // Include a and h in dependencies since they affect calculation

  // Animation frame loop - pulsing through time, speed adjustable with store
  useFrame((state) => {
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * vortexSpeed;
    }
  });

  // No early returns or conditions before this point - all hooks are above
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-intensity"
          count={intensities.length}
          array={intensities}
          itemSize={1}
          args={[intensities, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderMaterialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0.0 }
        }}
        transparent
        side={THREE.DoubleSide}
      />
    </points>
  );
}