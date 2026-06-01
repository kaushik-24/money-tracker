"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";

function useSuppressClockWarning() {
  useEffect(() => {
    const warn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
      warn(...args);
    };
    return () => { console.warn = warn; };
  }, []);
}

function Model() {
  const { scene } = useGLTF("/models/cash-and-gold.glb");
  return <primitive object={scene} />;
}

function FallbackGlyph() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
      <circle cx="60" cy="60" r="46" fill="none" stroke="#00FF87" strokeWidth="1.4"
        className="motion-safe:animate-[li-orbit_8.5s_linear_infinite] motion-reduce:animate-none"
        style={{ strokeDasharray: "18 14" }} />
      <rect x="34" y="34" width="52" height="52" rx="14" fill="rgba(0,255,135,0.06)" stroke="#00FF87" strokeWidth="1.2"
        className="motion-safe:animate-[li-grid_5.4s_ease-in-out_infinite] motion-reduce:animate-none" />
      <circle cx="60" cy="60" r="7" fill="#00FF87" />
      <path d="M60 30v10M60 80v10M30 60h10M80 60h10" stroke="#00FF87" strokeWidth="1.4" strokeLinecap="round"
        className="motion-safe:animate-[li-pulse_6s_ease-in-out_infinite] motion-reduce:animate-none" />
    </svg>
  );
}

export function HeroModel() {
  useSuppressClockWarning();
  return (
    <div className="h-28 w-36 md:h-36 md:w-52">
      <Suspense fallback={<FallbackGlyph />}>
        <Canvas camera={{ position: [0, 0, 4], fov: 28 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 4, 3]} intensity={1.2} />
          <directionalLight position={[-2, -1, -2]} intensity={0.4} />
          <pointLight position={[0, 3, 1]} intensity={0.8} color="#00FF87" />
          <Model />
          <OrbitControls
            autoRotate
            autoRotateSpeed={1.5}
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
