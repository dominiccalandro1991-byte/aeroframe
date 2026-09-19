import { Canvas } from "@react-three/fiber";
import { ContactShadows, Grid, OrbitControls } from "@react-three/drei";
import { AirframeMesh } from "./airframe-mesh";

export function HangarScene() {
  return (
    <Canvas
      camera={{ position: [6.4, 2.8, 6.8], fov: 42, near: 0.1, far: 80 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      shadows
      style={{ width: "100%", height: "100%", background: "#07090c" }}
    >
      <color attach="background" args={["#07090c"]} />
      <hemisphereLight args={["#c5d0d8", "#12161c", 0.55]} />
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.25} color="#7aa3ad" />

      <group position={[0, 0.15, 0]}>
        <AirframeMesh />
      </group>

      <Grid
        position={[0, -0.95, 0]}
        args={[24, 24]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#1c242c"
        sectionSize={2}
        sectionThickness={1.1}
        sectionColor="#2a3540"
        fadeDistance={22}
        fadeStrength={1.4}
        infiniteGrid
      />
      <ContactShadows
        position={[0, -0.94, 0]}
        opacity={0.45}
        scale={14}
        blur={2.2}
        far={4}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={16}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2 - 0.08}
        target={[0, 0.15, 0]}
      />
    </Canvas>
  );
}
