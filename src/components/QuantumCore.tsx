import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";

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
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.8, 32, 32]}>
      <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={2} roughness={0.1} />
    </Sphere>
  );
}

export default function QuantumCore({ logs }: { logs?: any[] }) {
  // Extract state hash from latest SYS logs
  const latestSysLog = logs?.find(l => l.tag === "SYS" && l.message.includes("C1_STATE_HASH"));
  const hashMatch = latestSysLog?.message.match(/C1_STATE_HASH stored: (0x[a-f0-9]+)/i);
  const stateHash = hashMatch ? `${hashMatch[1].substring(0, 5)}...${hashMatch[1].substring(37)}` : "AWAITING C1";
  
  // Extract C2 decision
  const latestC2Log = logs?.find(l => l.tag === "C2");
  const isC2NoOp = latestC2Log?.message.includes("NO_OP");
  const isC2Mirror = latestC2Log?.message.includes("MIRROR");
  const isC2Reverse = latestC2Log?.message.includes("REVERSE");
  
  let c2StatusColor = "text-white/60";
  let c2StatusText = "AWAITING";
  if (isC2NoOp) { c2StatusText = "NO_OP"; c2StatusColor = "text-amber-500"; }
  if (isC2Mirror) { c2StatusText = "MIRROR"; c2StatusColor = "text-[#00f5a0]"; }
  if (isC2Reverse) { c2StatusText = "REVERSE"; c2StatusColor = "text-fuchsia-400"; }

  return (
    <div className="w-full h-full min-h-[300px] relative rounded-xl overflow-hidden border border-sky-500/30 shadow-[0_0_40px_rgba(14,165,233,0.15)] bg-gradient-to-b from-slate-900/80 to-black pointer-events-none">
      <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between">
         <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-sky-400 font-mono text-xs uppercase tracking-widest font-bold drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">Quantum Math Engine</span>
              <span className="text-white/60 text-[10px] font-mono mt-1 tracking-widest">C1/C2 PIPELINE SYNCED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_10px_#38bdf8]"></div>
              <span className="text-sky-400 font-mono text-[10px] uppercase font-bold">LIVE</span>
            </div>
         </div>
         <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/60 backdrop-blur-md border border-sky-500/20 rounded-lg p-2 text-center shadow-[inset_0_0_10px_rgba(14,165,233,0.1)]">
              <span className="block text-[9px] text-sky-400/70 uppercase tracking-widest font-bold mb-1">C1_STATE_HASH</span>
              <span className="block text-xs font-mono text-white truncate drop-shadow-md">{stateHash}</span>
            </div>
            <div className="bg-black/60 backdrop-blur-md border border-sky-500/20 rounded-lg p-2 text-center shadow-[inset_0_0_10px_rgba(14,165,233,0.1)]">
              <span className="block text-[9px] text-sky-400/70 uppercase tracking-widest font-bold mb-1">INVARIANT LOCK</span>
              <span className="block text-xs font-mono text-sky-400 drop-shadow-[0_0_5px_#38bdf8] font-bold">ACTIVE</span>
            </div>
            <div className="bg-black/60 backdrop-blur-md border border-sky-500/20 rounded-lg p-2 text-center shadow-[inset_0_0_10px_rgba(14,165,233,0.1)]">
              <span className="block text-[9px] text-sky-400/70 uppercase tracking-widest font-bold mb-1">C2 DECISION</span>
              <span className={`block text-xs font-mono font-bold drop-shadow-md ${c2StatusColor}`}>{c2StatusText}</span>
            </div>
         </div>
      </div>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="pointer-events-none">
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#38bdf8" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#d946ef" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1.5} />
        <CoreSphere />
        <InnerCore />
      </Canvas>
    </div>
  );
}
