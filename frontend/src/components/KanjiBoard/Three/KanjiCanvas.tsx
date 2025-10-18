import { useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./KanjiBoard.css";
import { KanjiScene } from "./KanjiScene"
import { fetchKanji, fetchRelated } from "@/api/kanjiApi";
import React from "react";

type KanjiData = {
  kanji: string;
  meaning?: string;
  meanings?: string[];
  readings?: any;
  radical?: { parts?: string[] };
  strokes?: number;
};

export function KanjiCanvas({
  selectedKanji,
  loading,
}: {
  selectedKanji: KanjiData | null;
  loading: boolean;
}) {
  const [nodes, setNodes] = React.useState<any[]>([]);
  const [edges, setEdges] = React.useState<any[]>([]);

  const springs = useSpring({ opacity: 1, from: { opacity: 0 } });

  const hasKanjiNode = (kanjiChar: string) =>
    nodes.some((n) => {
      const nodeKanji = n.data?.label?.split("-")[0];
      return nodeKanji === kanjiChar;
    });

  const addKanji = (kanji: KanjiData) => {
    if (!kanji?.kanji) return;
    const id = kanji.kanji;
    if (nodes.find((n) => n.id === id)) return;
    if (hasKanjiNode(id)) return;

    setNodes((nds) => [
      ...nds,
      {
        id,
        data: {
          label: `${id}-${kanji.meaning}`,
          meaning: kanji.meaning,
          meanings: kanji.meanings,
          radical: kanji.radical,
          readings: kanji.readings,
          type: "kanji",
        },
        position: { x: Math.random() * 400 - 200, y: Math.random() * 400 - 200 },
        className: "kanji-node",
      },
    ]);
  };

  useEffect(() => {
    if (selectedKanji) {
      addKanji(selectedKanji);
      console.log("added:", selectedKanji.kanji);
    }
  }, [selectedKanji]);

  const addParts = (kanjiId: string, parts: string[]) => {
    const baseX = Math.random() * 400 - 200;
    const baseY = Math.random() * 400 - 200;

    parts.forEach(async (p, i) => {
      const partId = `${p}`;
      const data = await fetchKanji(p);
      if (hasKanjiNode(p)) return;
      if (nodes.find((n) => n.id === partId)) return;
      setNodes((nds) => [
        ...nds,
        {
          id: partId,
          data: { label: `${p}-${data.kanji?.main_meanings?.[0] ?? "?"}`, type: "part" },
          position: { x: baseX + i * 80, y: baseY + i * 40 },
          className: "part-node",
        },
      ]);

      setEdges((eds) => [
        ...eds,
        { id: `${kanjiId}->${partId}`, source: kanjiId, target: partId },
      ]);
    });
  };

  const addRelated = (
    partId: string,
    kanjis: (KanjiData | string)[],
    page: number,
    meaning: string
  ) => {
    const baseX = Math.random() * 400 - 200;
    const baseY = Math.random() * 400 - 200;

    setNodes((nds) => nds.filter((n) => n.id !== `${partId}-more-${page}`));

    kanjis.forEach(async (k, i) => {
      const label = typeof k === "string" ? k : k.kanji;
      if (!label) return;
      const kid = `${partId}-rel-${page}-${label}`;
      if (nodes.find((n) => n.id === kid)) return;
      if (hasKanjiNode(label)) return;

      const kanjiInfo = await fetchKanji(label);
      const name = `${label}-${kanjiInfo.kanji.main_meanings[0]}`;

      setNodes((nds) => [
        ...nds,
        {
          id: kid,
          data: {
            label: name,
            type: "kanji",
            kanji: label,
            radical: kanjiInfo?.kanji.radical,
            meaning: kanjiInfo?.kanji.meaning,
            meanings: kanjiInfo?.kanji.meanings,
            readings: kanjiInfo?.kanji.readings,
          },
          position: { x: baseX + i * 50, y: baseY + i * 50 },
          className: "kanji-node",
        },
      ]);

      setEdges((eds) => [...eds, { id: `${partId}->${kid}`, source: partId, target: kid }]);
    });

    setNodes((nds) => [
      ...nds,
      {
        id: `${partId}-more-${page + 1}`,
        data: { label: "...", type: "more" },
        position: { x: baseX, y: baseY + 200 },
        className: "more-node",
      },
    ]);
    setEdges((eds) => [
      ...eds,
      {
        id: `${partId}->${partId}-more-${page + 1}`,
        source: partId,
        target: `${partId}-more-${page + 1}`,
      },
    ]);
  };

  const handleNodeClick = (node: any) => {
    if (node.data.type === "kanji") {
      const parts = node.data.radical?.parts ?? [];
      if (parts.length) addParts(node.id, parts);
    } else if (node.data.type === "part") {
      fetchRelated(node.data.label.split("-")[0]).then((data) => {
        const pageSize = 9;
        const page = 0;
        const nextBatch = (data?.kanji_list ?? []).slice(
          page * pageSize,
          (page + 1) * pageSize
        );
        const meaning = data?.meaning ?? "";
        addRelated(node.id, nextBatch, page, meaning);
      });
    } else if (node.data.type === "more") {
      const match = node.id.match(/(.+)-more-(\d+)/);
      if (!match) return;
      const [, partId, pageStr] = match;
      const page = parseInt(pageStr, 10);

      fetchRelated(partId).then((data) => {
        const pageSize = 9;
        const nextBatch = (data?.kanji_list ?? []).slice(
          page * pageSize,
          (page + 1) * pageSize
        );
        const meaning = data?.meaning ?? "";
        addRelated(partId, nextBatch, page, meaning);
      });
    }
  };

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
  };

  const handleOrganize = () => {
    if (nodes.length === 0) return;
    const centerX = 0;
    const centerY = 0;
    const degreeMap: Record<string, number> = {};
    edges.forEach((e) => {
      degreeMap[e.source] = (degreeMap[e.source] || 0) + 1;
      degreeMap[e.target] = (degreeMap[e.target] || 0) + 1;
    });

    const degreeGroups: Record<number, typeof nodes> = {};
    nodes.forEach((node) => {
      const degree = degreeMap[node.id] || 0;
      if (!degreeGroups[degree]) degreeGroups[degree] = [];
      degreeGroups[degree].push(node);
    });

    const sortedDegrees = Object.keys(degreeGroups)
      .map(Number)
      .sort((a, b) => b - a);

    const arrangedNodes: typeof nodes = [];
    const baseRadius = 200;
    const ringSpacing = 100;
    let ringIndex = 0;

    sortedDegrees.forEach((deg) => {
      const group = degreeGroups[deg];
      const radius = ringIndex === 0 ? 0 : baseRadius + (ringIndex - 1) * ringSpacing;

      group.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / group.length;
        arrangedNodes.push({
          ...node,
          position: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          },
        });
      });

      ringIndex++;
    });

    setNodes(arrangedNodes);
  };

  return (
    <div>
      {loading ? (
        <div id="loading-overlay">
          <div id="loading-spinner">{selectedKanji?.kanji ?? "漢"}</div>
          <p id="loading-text">Loading kanji...</p>
        </div>
      ) : null}

      <div className="board-controls">
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleOrganize}>Organize</button>
      </div>

      <animated.div style={springs} className="Board" id="kanji-three-canvas">
        <Canvas camera={{ position: [0, 0, 800], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enablePan enableZoom enableRotate />
          <KanjiScene nodes={nodes} edges={edges} />
        </Canvas>
      </animated.div>
    </div>
  );
}
