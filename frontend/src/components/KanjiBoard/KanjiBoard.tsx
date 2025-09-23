import { useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { useSpring, animated } from "@react-spring/web"
import "./KanjiBoard.css"
import { fetchParts } from "@/api/kanjiApi";

export function KanjiBoard({ selectedKanji }: { selectedKanji: any }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Animated entry
  const springs = useSpring({ opacity: 1, from: { opacity: 0 } });

  const addKanji = (kanji: {
    kanji: string;
    meaning?: string;
    meanings?: string[];
    readings?: any;
    radical?: any;
    strokes?: number;
  }) => {
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
          reading: kanji.readings,
          type: "kanji",
        },
        position: { x: Math.random() * 400, y: Math.random() * 400 },
      },
    ]);
  };

  // whenever selectedKanji changes, add it
  useEffect(() => {
    if (selectedKanji) {
      addKanji(selectedKanji);
      console.log("added: " + selectedKanji.kanji)
    }
  }, [selectedKanji]);
  useEffect(() => {
    if (selectedKanji) {
      addKanji(selectedKanji);
      console.log("added: " + selectedKanji.kanji)
    }
  }, []);

  const addParts = (kanjiId: string, parts: string[]) => {
    const baseX = Math.random() * 400;
    const baseY = Math.random() * 400;

    parts.forEach((p, i) => {
      const partId = `${kanjiId}-${p}-${i}`;
      if (nodes.find((n) => n.id === partId)) return;

      setNodes((nds) => [
        ...nds,
        {
          id: partId,
          data: { label: p, type: "part" },
          position: { x: baseX + i * 80, y: baseY + i * 40 },
        },
      ]);

      setEdges((eds) => [
        ...eds,
        { id: `${kanjiId}-${partId}`, source: kanjiId, target: partId },
      ]);
    });
  };

  const addRelated = (partId: string, kanjis: string[], page: number) => {
    const baseX = Math.random() * 400;
    const baseY = Math.random() * 400;

    kanjis.forEach((k, i) => {
      const kid = `${partId}-rel-${page}-${i}`;
      if (nodes.find((n) => n.id === kid)) return;

      setNodes((nds) => [
        ...nds,
        {
          id: kid,
          data: { label: k, type: "kanji" },
          position: { x: baseX + i * 50, y: baseY + i * 50 },
        },
      ]);
      setEdges((eds) => [...eds, { id: `${partId}-${kid}`, source: partId, target: kid }]);
    });

    // "More..." node
    setNodes((nds) => [
      ...nds,
      {
        id: `${partId}-more-${page}`,
        data: { label: "...", type: "more" },
        position: { x: baseX, y: baseY + 200 },
      },
    ]);
  };

  const handleNodeClick = (node: Node) => {
    if (node.data.type === "kanji") {
      addParts(node.id, node.data.radical.parts)
    } else if (node.data.type === "part") {
      // fetch related kanji
      fetch(`/api/part/${node.data.label}?page=0`)
        .then((res) => res.json())
        .then((data) => addRelated(node.id, data.related.slice(0, 10), 0));
    } else if (node.data.type === "more") {
      const [partId, , page] = node.id.split("-");
      const nextPage = parseInt(page) + 1;
      fetch(`/api/part/${partId}?page=${nextPage}`)
        .then((res) => res.json())
        .then((data) => addRelated(partId, data.related.slice(0, 10), nextPage));
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
       <Background variant={"dots" as BackgroundVariant} gap={16} size={1} />
      </ReactFlow>
    </animated.div>
  );
}