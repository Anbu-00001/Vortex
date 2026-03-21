"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import SpiralVortex from './SpiralVortex';
import { NormalizedContribution } from '../../lib/graphql/queries';

interface VortexCanvasProps {
  contributions?: NormalizedContribution[];
}

export default function VortexCanvas({ contributions }: VortexCanvasProps) {
  return (
    <Canvas style={{ width: '100vw', height: '100vh' }} camera={{ position: [0, 0, 60], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />
      
      <EffectComposer>
        <SpiralVortex contributions={contributions || []} />
        <Bloom intensity={1.5} luminanceThreshold={0.2} mipmapBlur={true} />
      </EffectComposer>
      
      {!contributions && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      )}
    </Canvas>
  );
}