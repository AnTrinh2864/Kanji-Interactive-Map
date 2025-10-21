// src/components/KanjiBoard.tsx
import React, { useEffect, useState } from "react";
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

export function KanjiBoard({ setSelectedKanji, selectedKanji, loading }: { 
  setSelectedKanji: React.Dispatch<React.SetStateAction<string>>, 
  selectedKanji: KanjiData | null, loading:boolean }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const handleNodeMouseEnter = (_: React.MouseEvent, node: Node) => {
    const { readings } = node.data;
    const readingText =
      readings?.join?.(", ") || null ;
    const readingOn = readings?.on?.join(", ") || null
    const readingKun = readings?.kun?.join(", ") || null
    const content = `
      <strong>${node.data.label}</strong><br/>
     ${readingText ? `<span>Readings: ${readingText}</span><br/>` : ""}
     ${readingOn ? `<span>On Readings: ${readingOn}</span><br/>` : ""}
     ${readingKun ? `<span>Kun Readings: ${readingKun}</span><br/>` : ""}
    `;

    setTooltip({ x: _.clientX + 10, y: _.clientY + 10, content });
  };

  const handleNodeMouseLeave = () => {
    setTooltip(null);
  };

  // Animated entry
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
          kanji: `${id}`,
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

  const handleListResult = (p: string, kanji_list: any[]) => {
    if (kanji_list) {
        for (let i = 0; i < kanji_list.length; i ++) {
          if (p === kanji_list[i].kanji) {
              const kanji = kanji_list[i]
              const result = {
                kanji: kanji.kanji,
                readings: kanji.main_readings,
                meanings: kanji.main_meanings,
              }
              return result;
          }
        }
      }
      return
  }
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

    parts.forEach(async (p, i) => {
      const partId = `${p}`;
      console.log(p)
      const data = await fetchKanji(p);
      if (hasKanjiNode(p)) return;
      if (nodes.find((n) => n.id === partId)) return;
      const result = handleListResult(p, data.kanji_list)
      setNodes((nds) => [
        ...nds,
        {
          id: partId,
          data: { label: `${p}-${data.kanji?.main_meanings?.[0] ?? "?"}`,
             type: "part",
             kanji: `${p}`,
             meanings: result?.meanings ?? data.kanji?.main_meanings ?? "?",
             readings: result?.readings ?? data.kanji?.main_readings ?? "?"},
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

 const addRelated = (partId: string, kanjis: (KanjiData | string)[], page: number, meaning: string) => {
  const baseX = Math.random() * 400;
  const baseY = Math.random() * 400;

  setNodes((nds) => nds.filter((n) => n.id !== `${partId}-more-${page}`));

  kanjis.forEach(async (k, i) => {
    const label = typeof k === "string" ? k : k.kanji;
    if (!label) return;

    const kid = `${partId}-rel-${page}-${label}`;
    if (nodes.find((n) => n.id === kid)) return;
    if (hasKanjiNode(label)) return;
    // 🔍 fetch full kanji info
    const kanjiInfo = await fetchKanji(label);
    const name = `${label}-${kanjiInfo.kanji.main_meanings[0]}`
    console.log(kanjiInfo.kanji.readings)
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
          meanings: kanjiInfo?.kanji.main_meanings,
          readings: kanjiInfo?.kanji.main_readings,
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
  setSelectedKanji(node.data)
  if (node.data.type === "kanji") {
    console.log("type: " + node.data.type)
    console.log("label: " + node.data.label)
    const parts = node.data.radical?.parts ?? [];
    if (parts.length) addParts(node.id, parts);
  } else if (node.data.type === "part") {
    console.log("type: " + node.data.type)
    console.log("label: " + node.data.label)
    fetchRelated(node.data.label.split('-')[0]).then((data) => {
      const pageSize = 9;
      const page = 0;
      const nextBatch = (data?.kanji_list ?? []).slice(page * pageSize, (page + 1) * pageSize);
      const meaning = data?.meaning ?? ""
      addRelated(node.id, nextBatch, page,meaning );
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
      const meaning = data?.meaning ?? ""
      addRelated(partId, nextBatch, page, meaning);
    });
  }
};


  const handleNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
  };

  // inside KanjiBoard component

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
  };

const handleOrganize = () => {
  if (nodes.length === 0) return;

  const centerX = 600;
  const centerY = 300;

  // Count edges per node
  const degreeMap: Record<string, number> = {};
  edges.forEach((e) => {
    degreeMap[e.source] = (degreeMap[e.source] || 0) + 1;
    degreeMap[e.target] = (degreeMap[e.target] || 0) + 1;
  });

  // Group nodes by degree
  const degreeGroups: Record<number, typeof nodes> = {};
  nodes.forEach((node) => {
    const degree = degreeMap[node.id] || 0;
    if (!degreeGroups[degree]) degreeGroups[degree] = [];
    degreeGroups[degree].push(node);
  });

  // Sort degrees descending
  const sortedDegrees = Object.keys(degreeGroups)
    .map(Number)
    .sort((a, b) => b - a);

  const arrangedNodes: typeof nodes = [];
  const baseRadius = 200;  // radius of first ring
  const ringSpacing = 100; // distance between rings
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
    ):(<div/>)}
    <div className="board-controls">
      <button onClick={handleReset}>Reset</button>
      <button onClick={handleOrganize}>Organize</button>
    </div>
    <animated.div style={springs} className="Board">
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_, node) => handleNodeClick(node)}
      onNodeContextMenu={handleNodeContextMenu}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      fitView
      >
        <MiniMap 
          className="kanji-minimap"
          nodeColor={(node) => {
            if (node.className?.includes("kanji-node")) return "#10b981";
            if (node.className?.includes("part-node")) return "#3b82f6";
            if (node.className?.includes("more-node")) return "#f59e0b";
            return "#999";
          }}
          zoomable
          pannable
          
          />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
      {tooltip && (
      <div
        className="kanji-tooltip"
        style={{
          position: "fixed",
          top: tooltip.y,
          left: tooltip.x,
          background: "rgba(30, 41, 59, 0.9)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "0.9rem",
          pointerEvents: "none",
          zIndex: 1000,
          maxWidth: "200px",
          lineHeight: "1.3",
        }}
        dangerouslySetInnerHTML={{ __html: tooltip.content }}
      />
    )}

    </animated.div>
    </div>
  );
}
