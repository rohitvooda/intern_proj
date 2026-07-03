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
    <div className="w-full h-full relative bg-[#ffffff] border-2 border-black rounded-lg min-h-[400px]">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        <Center>
          <group>
            {/* Cell Membrane (Outer Spherical Capsule) */}
            <mesh 
              onClick={() => onSelectOrganelle('membrane')}
              scale={selectedKey === 'membrane' ? 1.05 : 1.0}
            >
              <sphereGeometry args={[2.5, 20, 20]} />
              <meshBasicMaterial 
                color={selectedKey === 'membrane' ? '#ef4444' : '#555555'} 
                wireframe
                transparent
                opacity={0.25}
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
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshBasicMaterial 
                color={selectedKey === 'nucleus' ? '#ef4444' : '#000000'} 
                wireframe
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
              <cylinderGeometry args={[0.22, 0.22, 0.7, 10]} />
              <meshBasicMaterial 
                color={selectedKey === 'mitochondria' ? '#ef4444' : '#000000'} 
                wireframe
              />
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
              <cylinderGeometry args={[0.2, 0.2, 0.6, 10]} />
              <meshBasicMaterial 
                color={selectedKey === 'mitochondria' ? '#ef4444' : '#000000'} 
                wireframe
              />
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
                <torusGeometry args={[0.4, 0.08, 6, 16, Math.PI]} />
                <meshBasicMaterial 
                  color={selectedKey === 'golgi' ? '#ef4444' : '#000000'} 
                  wireframe
                />
              </mesh>
              <mesh position={[0, 0.15, 0]} scale={[0.85, 0.85, 0.85]}>
                <torusGeometry args={[0.4, 0.08, 6, 16, Math.PI]} />
                <meshBasicMaterial 
                  color={selectedKey === 'golgi' ? '#ef4444' : '#000000'} 
                  wireframe
                />
              </mesh>
              <mesh position={[0, 0.3, 0]} scale={[0.7, 0.7, 0.7]}>
                <torusGeometry args={[0.4, 0.08, 6, 16, Math.PI]} />
                <meshBasicMaterial 
                  color={selectedKey === 'golgi' ? '#ef4444' : '#000000'} 
                  wireframe
                />
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
              <torusGeometry args={[1.1, 0.12, 6, 20]} />
              <meshBasicMaterial 
                color={selectedKey === 'er' ? '#ef4444' : '#000000'} 
                wireframe
              />
            </mesh>

            {/* Ribosomes (Tiny Dots) */}
            <group onClick={(e) => {
              e.stopPropagation();
              onSelectOrganelle('ribosomes');
            }}>
              {Array.from({ length: 15 }).map((_, i) => {
                const angle = (i / 15) * Math.PI * 2;
                const radius = 1.2 + Math.sin(i * 3) * 0.4;
                const y = Math.cos(i * 2) * 1.1;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                return (
                  <mesh key={i} position={[x, y, z]} scale={selectedKey === 'ribosomes' ? 1.5 : 1.0}>
                    <sphereGeometry args={[0.04, 4, 4]} />
                    <meshBasicMaterial 
                      color={selectedKey === 'ribosomes' ? '#ef4444' : '#000000'} 
                      wireframe
                    />
                  </mesh>
                );
              })}
            </group>
            
          </group>
        </Center>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          minDistance={2}
          maxDistance={8}
        />
      </Canvas>

      {/* Floating Organelle Label Indicator */}
      <div className="absolute top-4 left-4 bg-[#ffffff] px-3 py-1.5 rounded border-2 border-black text-xs flex items-center gap-2 pointer-events-none shadow-[2px_2px_0px_#000000]">
        <div className="w-2 h-2 rounded-full bg-red-500 border border-black animate-pulse" />
        <span className="font-space text-black font-semibold">Active Selection:</span>
        <span className="font-extrabold text-black uppercase tracking-wider">
          {selectedKey.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
}

// Fallback Interactive UI for browsers without WebGL
function InteractiveCellFallback({ selectedKey, onSelect }: { selectedKey: string; onSelect: (key: string) => void }) {
  return (
    <div className="w-full h-full relative bg-[#ffffff] flex flex-col items-center justify-center p-4 border-2 border-black rounded-lg min-h-[400px]">
      <h3 className="font-space font-bold text-sm text-black mb-6 uppercase tracking-widest text-center">
        Interactive Cell Map (2D Wireframe)
      </h3>
      
      <div className="w-[300px] h-[300px] relative flex items-center justify-center border-2 border-black bg-white rounded-full shadow-[4px_4px_0px_#000000]">
        {/* Membrane circle */}
        <div 
          onClick={() => onSelect('membrane')}
          className={`absolute w-[280px] h-[280px] rounded-full border-2 border-black flex items-center justify-center cursor-pointer transition-all hover:bg-black/5 ${selectedKey === 'membrane' ? 'border-red-500 border-3 scale-105 bg-red-500/5' : ''}`}
        >
          {/* ER Ring */}
          <div 
            onClick={(e) => { e.stopPropagation(); onSelect('er'); }}
            className={`absolute w-[180px] h-[180px] rounded-full border-2 border-dashed border-black flex items-center justify-center cursor-pointer transition-all hover:bg-black/5 ${selectedKey === 'er' ? 'border-red-500 border-3 scale-105' : ''}`}
          >
            {/* Nucleus Center */}
            <div 
              onClick={(e) => { e.stopPropagation(); onSelect('nucleus'); }}
              className={`w-[90px] h-[90px] rounded-full bg-white border border-black flex items-center justify-center cursor-pointer transition-all hover:bg-black/5 ${selectedKey === 'nucleus' ? 'scale-110 border-2 border-red-500 shadow-[3px_3px_0px_#000000]' : ''}`}
            >
              <span className="text-[10px] font-bold text-black text-center">NUCLEUS</span>
            </div>
          </div>
        </div>

        {/* Floating Mitochondria */}
        <div 
          onClick={() => onSelect('mitochondria')}
          className={`absolute top-6 right-12 px-3 py-1.5 rounded bg-white border border-black text-[10px] font-bold text-black cursor-pointer transition-all hover:bg-black/5 ${selectedKey === 'mitochondria' ? 'scale-110 border-2 border-red-500 shadow-[2px_2px_0px_#000000]' : ''}`}
        >
          Mitochondria
        </div>

        {/* Floating Golgi */}
        <div 
          onClick={() => onSelect('golgi')}
          className={`absolute bottom-10 left-6 px-3 py-1.5 rounded bg-white border border-black text-[10px] font-bold text-black cursor-pointer transition-all hover:bg-black/5 ${selectedKey === 'golgi' ? 'scale-110 border-2 border-red-500 shadow-[2px_2px_0px_#000000]' : ''}`}
        >
          Golgi Body
        </div>

        {/* Floating Ribosomes */}
        <div 
          onClick={() => onSelect('ribosomes')}
          className={`absolute bottom-6 right-10 px-3 py-1.5 rounded bg-white border border-black text-[10px] font-bold text-black cursor-pointer transition-all hover:bg-black/5 ${selectedKey === 'ribosomes' ? 'scale-110 border-2 border-red-500 shadow-[2px_2px_0px_#000000]' : ''}`}
        >
          Ribosomes
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-6 text-center">
        Tip: Select from the list below or click elements on the diagram.
      </p>
    </div>
  );
}
