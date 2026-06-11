'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';

interface Cell3DCanvasProps {
  selectedKey: string;
  organelles: any[];
  onSelectOrganelle: (key: string) => void;
}

export default function Cell3DCanvas({ selectedKey, organelles, onSelectOrganelle }: Cell3DCanvasProps) {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Detect WebGL support
    try {
      const canvas = document.createElement('canvas');
      const supportsWebGL = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setHasWebGL(supportsWebGL);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <InteractiveCellFallback selectedKey={selectedKey} onSelect={onSelectOrganelle} />;
  }

  return (
    <div className="w-full h-full relative bg-[#02020a]">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Center>
          <group>
            {/* Cell Membrane (Outer Spherical Capsule) */}
            <mesh 
              onClick={() => onSelectOrganelle('membrane')}
              scale={selectedKey === 'membrane' ? 1.05 : 1.0}
            >
              <sphereGeometry args={[2.5, 32, 32]} />
              <meshPhysicalMaterial 
                color="#fbbf24" 
                transparent 
                opacity={0.15} 
                roughness={0.2}
                metalness={0.1}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                depthWrite={false}
              />
            </mesh>

            {/* Nucleus (Central Brain) */}
            <mesh 
              onClick={(e) => {
                e.stopPropagation();
                onSelectOrganelle('nucleus');
              }}
              scale={selectedKey === 'nucleus' ? 1.1 : 1.0}
              position={[0, 0, 0]}
            >
              <sphereGeometry args={[0.8, 32, 32]} />
              <meshStandardMaterial 
                color="#8b5cf6" 
                roughness={0.4} 
                metalness={0.2} 
                emissive="#4c1d95"
                emissiveIntensity={0.2}
              />
            </mesh>

            {/* Mitochondria 1 (Capsule Shape) */}
            <mesh 
              onClick={(e) => {
                e.stopPropagation();
                onSelectOrganelle('mitochondria');
              }}
              scale={selectedKey === 'mitochondria' ? 1.15 : 1.0}
              position={[1.4, 0.6, 0.4]}
              rotation={[0.5, 0.5, 0.8]}
            >
              <cylinderGeometry args={[0.22, 0.22, 0.7, 16]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Mitochondria 2 */}
            <mesh 
              onClick={(e) => {
                e.stopPropagation();
                onSelectOrganelle('mitochondria');
              }}
              scale={selectedKey === 'mitochondria' ? 1.15 : 1.0}
              position={[-0.8, -1.2, -0.6]}
              rotation={[-0.4, 0.9, 0.2]}
            >
              <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Golgi Apparatus (Flattened Plates) */}
            <group 
              onClick={(e) => {
                e.stopPropagation();
                onSelectOrganelle('golgi');
              }}
              scale={selectedKey === 'golgi' ? 1.1 : 1.0}
              position={[-1.2, 0.8, 0.2]}
              rotation={[0.3, -0.5, 0.2]}
            >
              <mesh position={[0, 0, 0]}>
                <torusGeometry args={[0.4, 0.08, 8, 24, Math.PI]} />
                <meshStandardMaterial color="#ec4899" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.15, 0]} scale={[0.85, 0.85, 0.85]}>
                <torusGeometry args={[0.4, 0.08, 8, 24, Math.PI]} />
                <meshStandardMaterial color="#ec4899" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.3, 0]} scale={[0.7, 0.7, 0.7]}>
                <torusGeometry args={[0.4, 0.08, 8, 24, Math.PI]} />
                <meshStandardMaterial color="#ec4899" roughness={0.4} />
              </mesh>
            </group>

            {/* Endoplasmic Reticulum (Tubular Network surrounding Nucleus) */}
            <mesh 
              onClick={(e) => {
                e.stopPropagation();
                onSelectOrganelle('er');
              }}
              scale={selectedKey === 'er' ? 1.1 : 1.0}
              position={[0.4, -0.6, 0.5]}
              rotation={[1.2, 0.3, 0.5]}
            >
              <torusGeometry args={[1.1, 0.12, 12, 32]} />
              <meshStandardMaterial color="#f43f5e" roughness={0.5} transparent opacity={0.8} />
            </mesh>

            {/* Ribosomes (Tiny Dots) */}
            <group onClick={(e) => {
              e.stopPropagation();
              onSelectOrganelle('ribosomes');
            }}>
              {/* Scattered particles */}
              {Array.from({ length: 15 }).map((_, i) => {
                const angle = (i / 15) * Math.PI * 2;
                const radius = 1.2 + Math.sin(i * 3) * 0.4;
                const y = Math.cos(i * 2) * 1.1;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                return (
                  <mesh key={i} position={[x, y, z]} scale={selectedKey === 'ribosomes' ? 1.5 : 1.0}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                );
              })}
            </group>
            
          </group>
        </Center>
        
        {/* Mouse controls */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          minDistance={2}
          maxDistance={8}
        />
      </Canvas>

      {/* Floating Organelle Label Indicator */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full animate-ping bg-violet-400" />
        <span className="font-space text-gray-300">Active Selection:</span>
        <span className="font-bold text-white uppercase tracking-wider">
          {selectedKey.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
}

// Fallback Interactive UI for browsers without WebGL
function InteractiveCellFallback({ selectedKey, onSelect }: { selectedKey: string; onSelect: (key: string) => void }) {
  return (
    <div className="w-full h-full relative bg-[#02020a] flex flex-col items-center justify-center p-4">
      <h3 className="font-space font-bold text-sm text-cyan-400 mb-6 uppercase tracking-widest text-center">
        Interactive Cell Map (2D Vector Mode)
      </h3>
      
      <div className="w-[300px] h-[300px] relative flex items-center justify-center border border-white/5 bg-white/2 rounded-full animate-pulse-slow shadow-inner">
        {/* Membrane circle */}
        <div 
          onClick={() => onSelect('membrane')}
          className={`absolute w-[280px] h-[280px] rounded-full border-2 border-amber-400/30 flex items-center justify-center cursor-pointer transition-all hover:bg-amber-400/5 ${selectedKey === 'membrane' ? 'border-amber-400 scale-105 bg-amber-400/5 shadow-2xl' : ''}`}
        >
          {/* ER Ring */}
          <div 
            onClick={(e) => { e.stopPropagation(); onSelect('er'); }}
            className={`absolute w-[180px] h-[180px] rounded-full border-2 border-dashed border-rose-500/20 flex items-center justify-center cursor-pointer transition-all hover:bg-rose-500/5 ${selectedKey === 'er' ? 'border-rose-500 scale-105' : ''}`}
          >
            {/* Nucleus Center */}
            <div 
              onClick={(e) => { e.stopPropagation(); onSelect('nucleus'); }}
              className={`w-[90px] h-[90px] rounded-full bg-violet-600/40 border border-violet-400 flex items-center justify-center cursor-pointer transition-all hover:bg-violet-600/60 ${selectedKey === 'nucleus' ? 'scale-110 bg-violet-600/70 border-2 border-violet-300 glow-purple' : ''}`}
            >
              <span className="text-[10px] font-bold text-white text-center">NUCLEUS</span>
            </div>
          </div>
        </div>

        {/* Floating Mitochondria */}
        <div 
          onClick={() => onSelect('mitochondria')}
          className={`absolute top-6 right-12 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500 text-[10px] font-bold text-white cursor-pointer transition-all hover:bg-red-600/40 ${selectedKey === 'mitochondria' ? 'scale-110 border-2 glow-cyan' : ''}`}
        >
          ⚡ Mitochondria
        </div>

        {/* Floating Golgi */}
        <div 
          onClick={() => onSelect('golgi')}
          className={`absolute bottom-10 left-6 px-3 py-1.5 rounded-full bg-pink-600/20 border border-pink-500 text-[10px] font-bold text-white cursor-pointer transition-all hover:bg-pink-600/40 ${selectedKey === 'golgi' ? 'scale-110 border-2' : ''}`}
        >
          📦 Golgi Body
        </div>

        {/* Floating Ribosomes */}
        <div 
          onClick={() => onSelect('ribosomes')}
          className={`absolute bottom-6 right-10 px-3 py-1.5 rounded-full bg-cyan-600/20 border border-cyan-500 text-[10px] font-bold text-white cursor-pointer transition-all hover:bg-cyan-600/40 ${selectedKey === 'ribosomes' ? 'scale-110 border-2' : ''}`}
        >
          🏗️ Ribosomes
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-6 text-center">
        Tip: Select from the list below or click elements on the diagram.
      </p>
    </div>
  );
}
