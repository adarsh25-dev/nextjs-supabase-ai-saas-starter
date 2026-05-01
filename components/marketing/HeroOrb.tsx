"use client"

import { Canvas } from "@react-three/fiber"
import { ContactShadows, MeshDistortMaterial, OrbitControls } from "@react-three/drei"
import { Suspense } from "react"

export function HeroOrb() {
  return (
    <div className="h-[360px] w-[360px]">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 3.4], fov: 45 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.32} />
          <directionalLight position={[2.5, 2, 2]} intensity={0.75} color="#c9a16e" />
          <directionalLight position={[-2, -2, -2]} intensity={0.2} />
          <mesh rotation={[0.4, 0, 0]}>
            <sphereGeometry args={[1.1, 128, 128]} />
            <MeshDistortMaterial
              color="hsl(16 35% 25%)"
              roughness={0.82}
              metalness={0.2}
              distort={0.35}
              speed={0.4}
            />
          </mesh>
          <ContactShadows position={[0, -1.6, 0]} scale={4} opacity={0.24} blur={2.5} far={2.8} />
          <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.38} />
        </Canvas>
      </Suspense>
    </div>
  )
}
