// src/components/KanjiBoard.tsx
import { useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  type Node,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { useSpring, animated } from "@react-spring/web";
import "./KanjiBoard.css";
import { fetchKanji, fetchRelated } from "@/api/kanjiApi";

type KanjiData = {
  kanji: string;
  meaning?: string;
  meanings?: string[];
  readings?: any;
  radical?: { parts?: string[] };
  strokes?: number;
};

export function KanjiBoard({ selectedKanji }: { selectedKanji: KanjiData | null }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Animated entry
  const springs = useSpring({ opacity: 1, from: { opacity: 0 } });

  const addKanji = (kanji: KanjiData) => {
    if (!kanji?.kanji) return;

    const id = kanji.kanji;
    if (nodes.find((n) => n.id === id)) return;

    setNodes((nds) => [
      ...nds,
      {
        id,
        data: {
          label: id,
          meaning: kanji.meaning,
          meanings: kanji.meanings,
          radical: kanji.radical,
          readings: kanji.readings,
          type: "kanji",
        },
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        className: "kanji-node",
      },
    ]);
  };

  // whenever selectedKanji changes, add it
  useEffect(() => {
    if (selectedKanji) {
      addKanji(selectedKanji);
      console.log("added:", selectedKanji.kanji);
    }
  }, [selectedKanji]);

  const addParts = (kanjiId: string, parts: string[]) => {
    const baseX = Math.random() * 400;
    const baseY = Math.random() * 400;

    parts.forEach((p, i) => {
      const partId = `${p}`;
      if (nodes.find((n) => n.id === partId)) return;

      setNodes((nds) => [
        ...nds,
        {
          id: partId,
          data: { label: p, type: "part" },
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

 const addRelated = (partId: string, kanjis: (KanjiData | string)[], page: number) => {
  const baseX = Math.random() * 400;
  const baseY = Math.random() * 400;

  setNodes((nds) => nds.filter((n) => n.id !== `${partId}-more-${page}`));

  kanjis.forEach(async (k, i) => {
    const label = typeof k === "string" ? k : k.kanji;
    if (!label) return;

    const kid = `${partId}-rel-${page}-${label}`;
    if (nodes.find((n) => n.id === kid)) return;

    // 🔍 fetch full kanji info
    const kanjiInfo = await fetchKanji(label);
    setNodes((nds) => [
      ...nds,
      {
        id: kid,
        data: {
          label,
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
  setEdges((eds) => [...eds, { id: `${partId}->${partId}-more-${page+1}`, source: partId, target: `${partId}-more-${page+1}` }]);
};


 const handleNodeClick = (node: Node) => {
  if (node.data.type === "kanji") {
    console.log("type: " + node.data.type)
    console.log("label: " + node.data.label)
    const parts = node.data.radical?.parts ?? [];
    if (parts.length) addParts(node.id, parts);
  } else if (node.data.type === "part") {
    console.log("type: " + node.data.type)
    console.log("label: " + node.data.label)
    fetchRelated(node.data.label).then((data) => {
      const pageSize = 9;
      const page = 0;
      const nextBatch = (data?.kanji_list ?? []).slice(page * pageSize, (page + 1) * pageSize);
      addRelated(node.id, nextBatch, page);
    });
  } else if (node.data.type === "more") {
    console.log("type: " + node.data.type)
    console.log("label: " + node.data.label)
    const match = node.id.match(/(.+)-more-(\d+)/);
    if (!match) return;
    const [, partId, pageStr] = match;
    const page = parseInt(pageStr, 10);

    fetchRelated(partId).then((data) => {
      const pageSize = 9;
      const nextBatch = (data?.kanji_list ?? []).slice(page * pageSize, (page + 1) * pageSize);
      addRelated(partId, nextBatch, page);
    });
  }
};


  const handleNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
  };

  return (
    <animated.div style={springs} className="Board">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => handleNodeClick(node)}
        onNodeContextMenu={handleNodeContextMenu}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
    </animated.div>
  );
}
