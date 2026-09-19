import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  FINISHES,
  useAeroframe,
  type AirframePart,
} from "@/lib/aeroframe/engine";

function useFinish() {
  const id = useAeroframe((s) => s.finish);
  return FINISHES.find((f) => f.id === id) ?? FINISHES[2];
}

function PartMaterial({
  part,
  transparent,
  opacity,
  colorOverride,
}: {
  part: AirframePart;
  transparent?: boolean;
  opacity?: number;
  colorOverride?: string;
}) {
  const selected = useAeroframe((s) => s.selectedPart);
  const finish = useFinish();
  const active = selected === part;
  return (
    <meshStandardMaterial
      color={colorOverride ?? finish.hex}
      roughness={finish.roughness}
      metalness={finish.metalness}
      emissive={active ? "#7aa3ad" : "#000000"}
      emissiveIntensity={active ? 0.35 : 0}
      transparent={transparent}
      opacity={opacity ?? 1}
      side={transparent ? THREE.DoubleSide : THREE.FrontSide}
    />
  );
}

function useSelect(part: AirframePart) {
  const selectPart = useAeroframe((s) => s.selectPart);
  const setView = useAeroframe((s) => s.setView);
  return {
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      selectPart(part);
      setView("MATERIALS");
    },
    onPointerOver: () => {
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "";
    },
  };
}

function Propeller({ spinning }: { spinning: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  useFrame((_, delta) => {
    if (!ref.current) return;
    const d = Math.min(delta, 0.1);
    if (spinning && !reduced) ref.current.rotation.z += d * 28;
  });
  const events = useSelect("prop");
  return (
    <group position={[0, 0.02, 2.72]} {...events}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 16]} />
        <PartMaterial part="prop" />
      </mesh>
      <group ref={ref}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 1.55, 0.12]} />
          <PartMaterial part="prop" colorOverride="#2c3138" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <boxGeometry args={[0.08, 1.55, 0.12]} />
          <PartMaterial part="prop" colorOverride="#2c3138" />
        </mesh>
      </group>
      {spinning ? (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.82, 32]} />
          <meshBasicMaterial
            color="#c5ccd4"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function Wing({ side }: { side: 1 | -1 }) {
  const events = useSelect("wing");
  const dihedral = side * 0.07;
  return (
    <group position={[side * 0.45, -0.06, 0.28]} rotation={[0, 0, dihedral]}>
      <mesh position={[side * 1.7, 0, 0]} castShadow receiveShadow {...events}>
        <boxGeometry args={[3.4, 0.07, 0.95]} />
        <PartMaterial part="wing" />
      </mesh>
      <mesh
        position={[side * 1.55, -0.01, -0.42]}
        castShadow
        {...events}
      >
        <boxGeometry args={[2.9, 0.04, 0.22]} />
        <PartMaterial part="wing" />
      </mesh>
      <mesh
        position={[side * 3.28, 0.12, 0.08]}
        rotation={[0, 0, side * 0.15]}
        castShadow
        {...events}
      >
        <boxGeometry args={[0.08, 0.28, 0.42]} />
        <PartMaterial part="wing" />
      </mesh>
    </group>
  );
}

export function AirframeMesh() {
  const sim = useAeroframe((s) => s.simRunning);
  const view = useAeroframe((s) => s.view);
  const group = useRef<THREE.Group>(null);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    const d = Math.min(delta, 0.1);
    if (view === "SIMULATION" && sim && !reduced) {
      const t = state.clock.elapsedTime;
      group.current.rotation.z = Math.sin(t * 0.55) * 0.18;
      group.current.rotation.x = Math.sin(t * 0.4) * 0.08;
      group.current.position.y = Math.sin(t * 0.7) * 0.12;
    } else {
      group.current.rotation.z = THREE.MathUtils.damp(
        group.current.rotation.z,
        0,
        4,
        d,
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        0,
        4,
        d,
      );
      group.current.position.y = THREE.MathUtils.damp(
        group.current.position.y,
        0,
        4,
        d,
      );
    }
  });

  const fuse = useSelect("fuselage");
  const canopy = useSelect("canopy");
  const tail = useSelect("empennage");
  const gear = useSelect("gear");

  return (
    <group
      ref={group}
      onPointerMissed={() => useAeroframe.getState().selectPart(null)}
    >
      {/* Nose / spinner fairing */}
      <mesh
        position={[0, 0.02, 2.42]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        {...fuse}
      >
        <coneGeometry args={[0.34, 0.55, 24]} />
        <PartMaterial part="fuselage" />
      </mesh>
      <mesh
        position={[0, 0.02, 1.78]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        {...fuse}
      >
        <cylinderGeometry args={[0.4, 0.34, 0.8, 24]} />
        <PartMaterial part="fuselage" />
      </mesh>
      {/* Cabin */}
      <mesh
        position={[0, 0.04, 0.45]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        {...fuse}
      >
        <cylinderGeometry args={[0.46, 0.4, 1.85, 28]} />
        <PartMaterial part="fuselage" />
      </mesh>
      {/* Aft taper */}
      <mesh
        position={[0, 0.02, -1.22]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        {...fuse}
      >
        <cylinderGeometry args={[0.2, 0.46, 1.55, 24]} />
        <PartMaterial part="fuselage" />
      </mesh>
      <mesh
        position={[0, 0.04, -2.18]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        {...fuse}
      >
        <cylinderGeometry args={[0.1, 0.2, 0.45, 16]} />
        <PartMaterial part="fuselage" />
      </mesh>

      {/* Canopy */}
      <mesh position={[0, 0.42, 0.72]} scale={[0.72, 0.55, 1.15]} {...canopy}>
        <sphereGeometry args={[0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <PartMaterial
          part="canopy"
          colorOverride="#87b8c9"
          transparent
          opacity={0.42}
        />
      </mesh>

      <Wing side={1} />
      <Wing side={-1} />

      {/* Vertical stabilizer */}
      <mesh position={[0, 0.52, -2.15]} castShadow {...tail}>
        <boxGeometry args={[0.07, 0.95, 0.55]} />
        <PartMaterial part="empennage" />
      </mesh>
      {/* Horizontal stabilizer */}
      <mesh position={[0, 0.12, -2.18]} castShadow {...tail}>
        <boxGeometry args={[1.85, 0.05, 0.42]} />
        <PartMaterial part="empennage" />
      </mesh>

      {/* Main gear */}
      <mesh position={[0.78, -0.52, 0.15]} rotation={[0, 0, 0.18]} {...gear}>
        <cylinderGeometry args={[0.03, 0.03, 0.85, 8]} />
        <PartMaterial part="gear" colorOverride="#9aa3ac" />
      </mesh>
      <mesh position={[-0.78, -0.52, 0.15]} rotation={[0, 0, -0.18]} {...gear}>
        <cylinderGeometry args={[0.03, 0.03, 0.85, 8]} />
        <PartMaterial part="gear" colorOverride="#9aa3ac" />
      </mesh>
      <mesh position={[0.92, -0.92, 0.15]} rotation={[0, 0, Math.PI / 2]} {...gear}>
        <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
        <PartMaterial part="gear" colorOverride="#1a1d21" />
      </mesh>
      <mesh
        position={[-0.92, -0.92, 0.15]}
        rotation={[0, 0, Math.PI / 2]}
        {...gear}
      >
        <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
        <PartMaterial part="gear" colorOverride="#1a1d21" />
      </mesh>
      {/* Nose gear */}
      <mesh position={[0, -0.48, 1.55]} {...gear}>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
        <PartMaterial part="gear" colorOverride="#9aa3ac" />
      </mesh>
      <mesh position={[0, -0.86, 1.55]} rotation={[0, 0, Math.PI / 2]} {...gear}>
        <cylinderGeometry args={[0.12, 0.12, 0.07, 16]} />
        <PartMaterial part="gear" colorOverride="#1a1d21" />
      </mesh>

      <Propeller spinning={sim || view === "SIMULATION"} />
    </group>
  );
}
