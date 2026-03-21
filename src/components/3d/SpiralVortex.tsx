"use client";

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NormalizedContribution } from '../../lib/graphql/queries';

interface SpiralVortexProps {
  contributions: NormalizedContribution[];
}

// Vertex Shader - handles pulsing motion and intensity-based sizing
const vertexShader = `
  attribute float intensity;
  
  varying float vIntensity;
  
  uniform float uTime;
  
  void main() {
    vIntensity = intensity;
    
    // Apply pulsing motion based on uTime and position.z
    vec3 pos = position;
    pos.x += sin(uTime * 2.0 + position.z) * 0.5;
    pos.y += cos(uTime * 2.0 + position.z) * 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Set point size based on intensity - significantly increased
    gl_PointSize = 6.0 + (intensity * 8.0);
  }
`;

// Fragment Shader - intensity-based gradient coloring (blood-red theme)
const fragmentShader = `
  varying float vIntensity;
  
  void main() {
    // Blend between dark black-red (low intensity) and bright blood red (high intensity)
    vec3 darkRed = vec3(0.15, 0.0, 0.05);
    vec3 brightRed = vec3(0.9, 0.0, 0.0);
    vec3 color = mix(darkRed, brightRed, vIntensity);
    
    // Add some glow effect
    float alpha = 1.0 - length(gl_PointCoord - vec2(0.5)) * 2.0;
    
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