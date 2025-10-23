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
import { fetchRelated } from "@/api/kanjiApi";
import { Tooltip } from "./hooks/ToolTip";
import { handleNodeMouseEnter, handleNodeMouseLeave } from "./utils/MouseHandler";
import { addKanji, addParts, addRelated } from "./utils/KanjiHandler";
import { handleNodeContextMenu, handleOrganize, handleReset } from "./utils/DegreeHandler";
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

  const springs = useSpring({ opacity: 1, from: { opacity: 0 } });
  useEffect(() => {
    if (selectedKanji) {
      addKanji(selectedKanji, nodes, setNodes);
      console.log("added:", selectedKanji.kanji);
    }
  }, [selectedKanji]);
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const isSelected = node.data?.kanji === selectedKanji?.kanji;
        return {
          ...node,
          className: isSelected
            ? `selected-node`
            : (node.data.type == 'kanji')? "kanji-node"
            : (node.data.type == 'part')? "part-node"
            : "more-node",
        };
      })
    );
  }, [selectedKanji]);

 const handleNodeClick = (node: Node) => {
  setSelectedKanji(node.data)
  if (node.data.type === "kanji") {
    console.log("type: " + node.data.type)
    console.log("label: " + node.data.label)
    console.log(node.data)
    const parts = node.data.radical?.parts ?? node.data.parts ?? [];
    if (parts.length) {
      console.log("called add Parts")
      addParts(node.id, parts, nodes, setNodes, setEdges);
    }
  } else if (node.data.type === "part") {
    console.log("type: " + node.data.type)
    console.log("label: " + node.data.label)
    fetchRelated(node.data.label.split('-')[0]).then((data) => {
      const pageSize = 9;
      const page = 0;
      const nextBatch = (data?.kanji_list ?? []).slice(page * pageSize, (page + 1) * pageSize);
      addRelated(node.id, nextBatch, page, nodes, setNodes, setEdges );
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
      addRelated(partId, nextBatch, page, nodes, setNodes, setEdges);
    });
  }
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
      <button onClick={() => {handleReset(setNodes, setEdges)}}>Reset</button>
      <button onClick={() => {handleOrganize(nodes, edges, setNodes)}}>Organize</button>
    </div>
    <animated.div style={springs} className="Board">
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_, node) => handleNodeClick(node)}
      onNodeContextMenu={(event, node) => {handleNodeContextMenu(event, node, setNodes, setEdges )}}
      onNodeMouseEnter={(event, node) => handleNodeMouseEnter(event, node, setTooltip)}
      onNodeMouseLeave={(_event, _node) => handleNodeMouseLeave(setTooltip)}
      fitView
      >
        <MiniMap 
          className="kanji-minimap"
          nodeColor={(node) => {
            if (node.className?.includes("kanji-node")) return "#10b981";
            if (node.className?.includes("part-node")) return "#3b82f6";
            if (node.className?.includes("more-node")) return "#555";
            if (node.className?.includes("selected")) return "#f59e0b";
            return "#999";
          }}
          zoomable
          pannable
          
          />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
      {tooltip && (
        <Tooltip tooltip={tooltip}/>
      )}
    </animated.div>
    </div>
  );
}
