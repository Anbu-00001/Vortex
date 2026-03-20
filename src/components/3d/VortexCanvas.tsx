"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function VortexCanvas() {
  return (
    <Canvas style={{ width: '100vw', height: '100vh' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </Canvas>
  );
}