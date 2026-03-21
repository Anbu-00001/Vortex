"use client";

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NormalizedContribution } from '../../lib/graphql/queries';

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

// Fragment Shader - monochromatic deep-space theme with soft particles
const fragmentShader = `
  varying float vIntensity;
  
  void main() {
    // Calculate distance from center of point
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Discard pixels outside the circle (0.5 radius)
    if (dist > 0.5) {
      discard;
    }
    
    // Blend between dark gray (low intensity) and pure white (high intensity)
    vec3 darkGray = vec3(0.1, 0.1, 0.1);
    vec3 brightWhite = vec3(1.0, 1.0, 1.0);
    vec3 color = mix(darkGray, brightWhite, vIntensity);
    
    // Soft edge with smooth falloff from center to edge
    float alpha = 1.0 - (dist * 2.0);  // Smooth gradient from 1.0 at center to 0.0 at edge
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function SpiralVortex({ contributions }: SpiralVortexProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Updated constants for better spiral expansion
  const a = 2.0;  // Base radius multiplier
  const k = 0.5;  // Intensity scaling factor
  const w = 0.15; // Angular frequency
  const h = 0.05; // Height per day

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
  }, [contributions]);

  // Animation frame loop - pulsing only, no auto-rotation
  useFrame((state) => {
    if (shaderMaterialRef.current) {
      // Update shader time uniform for pulsing effect only
      shaderMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

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
          attach="attributes-intensity"
          count={intensities.length}
          array={intensities}
          itemSize={1}
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