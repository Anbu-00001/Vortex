"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SpiralVortex from './SpiralVortex';
import { NormalizedContribution } from '../../lib/graphql/queries';

interface VortexCanvasProps {
  contributions?: NormalizedContribution[];
}

export default function VortexCanvas({ contributions }: VortexCanvasProps) {
  return (
    <Canvas style={{ width: '100vw', height: '100vh' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />
      {contributions && contributions.length > 0 && (
        <SpiralVortex contributions={contributions} />
      )}
      {!contributions && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      )}
    </Canvas>
  );
}