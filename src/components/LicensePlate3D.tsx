import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface LicensePlate3DProps {
  plate: string;
  color: string;
}

function Plate({ plate, color }: { plate: string; color: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
      mesh.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={mesh} castShadow receiveShadow>
        {/* Main Board */}
        <boxGeometry args={[3.2, 1.2, 0.05]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.8} />
        
        {/* Border */}
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[3.3, 1.3, 0.04]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
        </mesh>

        {/* Plate Content */}
        <group position={[0, 0, 0.035]}>
          <Text
            position={[0, 0.2, 0]}
            fontSize={0.1}
            color="#64748b"
            font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe82o9769p968T/4m66/4q/9/i_X3_Wiqw5H.woff2"
          >
            NEXUS ENGINE • REGISTRY V2.4
          </Text>
          
          <Text
            position={[0, -0.1, 0]}
            fontSize={0.5}
            color="#0f172a"
            letterSpacing={0.1}
            font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tMe82o9769p968T/4m66/4q/9/i_X3_Wiqw5H.woff2"
          >
            {plate || "NEW-P"}
          </Text>

          {/* Regional Tag */}
          <mesh position={[-1.3, 0.4, 0]}>
            <planeGeometry args={[0.3, 0.2]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <Text
             position={[-1.3, 0.4, 0.01]}
             fontSize={0.06}
             color="white"
          >
            NX
          </Text>
        </group>

        {/* Back detail */}
        <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[3.2, 1.2, 0.01]} />
            <meshStandardMaterial color="#1e293b" />
        </mesh>
      </mesh>

      {/* Holographic glowing edges */}
      <mesh position={[0, 0, 0]} scale={[1.05, 1.05, 1.05]}>
        <boxGeometry args={[3.2, 1.2, 0.05]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export default function LicensePlate3D({ plate, color }: LicensePlate3DProps) {
  return (
    <div className="w-full h-full bg-[#0B1120] rounded-[2rem] overflow-hidden relative border border-white/5">
      {/* HUD Elements removed per user request */}
      
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4], fov: 40 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 3]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Suspense fallback={null}>
                <Plate plate={plate} color={color} />
            </Suspense>
        </Float>

        <Environment preset="city" />
        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={10} />
      </Canvas>
      
      {/* HUD Elements */}
      <div className="absolute bottom-6 right-8 text-right pointer-events-none">
        <div className="text-[24px] font-black text-white tracking-widest leading-none">{plate}</div>
      </div>
    </div>
  );
}
