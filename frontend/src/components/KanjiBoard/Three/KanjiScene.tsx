// src/components/KanjiScene.tsx
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

interface KanjiNode {
  id: string;
  data: {
    label: string;
    meaning?: string;
    meanings?: string[];
    radical?: { parts?: string[] };
    readings?: any;
    type: string;
  };
  position: { x: number; y: number };
}

interface KanjiEdge {
  id: string;
  source: string;
  target: string;
}

export function KanjiScene({
  nodes,
  edges,
}: {
  nodes: KanjiNode[];
  edges: KanjiEdge[];
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Slow rotation for aesthetics
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  // Convert edges into <primitive> Line objects
  const lines = useMemo(() => {
    return edges
      .map((edge) => {
        const src = nodes.find((n) => n.id === edge.source);
        const dst = nodes.find((n) => n.id === edge.target);
        if (!src || !dst) return null;

        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(src.position.x, src.position.y, 0),
          new THREE.Vector3(dst.position.x, dst.position.y, 0),
        ]);
        const material = new THREE.LineBasicMaterial({ color: 0x888888 });

        return (
          <primitive
            key={edge.id}
            object={new THREE.Line(geometry, material)}
          />
        );
      })
      .filter(Boolean);
  }, [edges, nodes]);

  return (
    <group ref={groupRef}>
      {lines}

      {nodes.map((node) => (
        <mesh
          key={node.id}
          position={[node.position.x, node.position.y, 0]}
        >
          <sphereGeometry args={[10, 32, 32]} />
          <meshStandardMaterial
            color={node.data.type === "part" ? "#f39c12" : "#3498db"}
          />
          <Html center>
            <div
              style={{
                color: "white",
                fontWeight: "bold",
                textShadow: "0 0 5px black",
                fontSize: "14px",
                pointerEvents: "none",
              }}
            >
              {node.data.label.split("-")[0]}
            </div>
          </Html>
        </mesh>
      ))}
    </group>
  );
}
