import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Stars, OrbitControls } from "@react-three/drei";

function CoreSphere() {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={1.2}>
      <MeshDistortMaterial
        color="#0ea5e9"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        emissive="#0284c7"
        emissiveIntensity={0.5}
        wireframe={true}
      />
    </Sphere>
  );
}

function InnerCore() {
  return (
    <Sphere args={[0.8, 32, 32]}>
      <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={2} roughness={0.1} />
    </Sphere>
  );
}

export default function QuantumCore() {
  return (
    <div className="w-full h-full min-h-[300px] relative rounded-xl overflow-hidden border border-sky-500/30 shadow-[0_0_40px_rgba(14,165,233,0.15)] bg-gradient-to-b from-slate-900/80 to-black">
      <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-between">
         <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-sky-400 font-mono text-xs uppercase tracking-widest font-bold">Quantum Math Engine</span>
              <span className="text-white/60 text-[10px] font-mono mt-1">C1/C2 Pipeline Synchronized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_10px_#38bdf8]"></div>
              <span className="text-sky-400 font-mono text-[10px]">LIVE</span>
            </div>
         </div>
         <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/50 backdrop-blur-md border border-white/5 rounded p-2 text-center">
              <span className="block text-[9px] text-white/50 mb-1">STATE HASH</span>
              <span className="block text-xs font-mono text-white truncate">0x9f8...a21</span>
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-white/5 rounded p-2 text-center">
              <span className="block text-[9px] text-white/50 mb-1">INVARIANT LOCK</span>
              <span className="block text-xs font-mono text-sky-400">ACTIVE</span>
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-white/5 rounded p-2 text-center">
              <span className="block text-[9px] text-white/50 mb-1">SOLVER</span>
              <span className="block text-xs font-mono text-white">CPMM v2</span>
            </div>
         </div>
      </div>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <spotLight position={[-10, -10, -5]} intensity={1} color="#38bdf8" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <CoreSphere />
        <InnerCore />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
