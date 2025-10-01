import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  MiniMap,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { fetchKanji } from "@/api/kanjiApi";
import "./PartLinkBoard.css"; // we'll put modal css here
import sample from "./sample";
type KanjiData = {
  kanji: string;
  meaning?: string;
  meanings?: string[];
  radical?: { parts?: string[] };
};

export function PartLinkBoard() {
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [mainKanji, setMainKanji] = useState<KanjiData | null>(null);
  const [totalCorrectParts, setTotalCorrectParts] = useState(0);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showModal, setShowModal] = useState<null | "win" | "lose">(null);

  // 🎲 fetch one random kanji as main
  const loadMainKanji = async () => {
    setCorrectCount(0);
    setIncorrectCount(0);
    setEdges([]);
    setNodes([]);
    setShowModal(null);

    const choice = sample[Math.floor(Math.random() * sample.length)];
    let choice1 = sample[Math.floor(Math.random() * sample.length)];
    let choice2 = sample[Math.floor(Math.random() * sample.length)];
    while (choice1 === choice) {
       choice1 = sample[Math.floor(Math.random() * sample.length)];
    }
    while (choice2 === choice) {
       choice2 = sample[Math.floor(Math.random() * sample.length)];
    }
    const kinfo = await fetchKanji(choice);
    const kinfo1 = await fetchKanji(choice1);
    const kinfo2 = await fetchKanji(choice2);
    const parts1 = kinfo1?.kanji?.radical?.parts ?? [];
    const parts2 = kinfo2?.kanji?.radical?.parts ?? [];
    const kanjiData = kinfo?.kanji || { kanji: choice, meaning: "?" };
    setMainKanji(kanjiData);

    const mainNode = {
      id: "main",
      data: { label: `${kanjiData.kanji} (${kanjiData.main_meanings[0] ?? ""})`, type: "main" },
      position: { x: 400, y: 250 },
      className: "kanji-node",
      style: { border: "2px solid green", padding: "8px" },
    };

    const correctParts = kanjiData.radical?.parts ?? [];
    setTotalCorrectParts(correctParts.length);

    // parts: actual parts + distractors
    let parts = [...correctParts, ...parts1, ...parts2];
    let shuffled = parts.sort(() => 0.5 - Math.random()).slice(0, 10);
    if (shuffled.length < 10) {
        shuffled = [...shuffled, "火", "水", "人", "口", "心"]
    }
    const partNodes = shuffled.map((p: any, i: number) => ({
      id: `part-${i}`,
      data: { label: p, type: "part" },
      position: { x: 100 + i * 70, y: 50 + (i % 2) * 100 },
      className: "part-node",
      style: { border: "1px solid gray", padding: "6px" },
    }));

    setNodes([mainNode, ...partNodes]);
  };

  useEffect(() => {
    loadMainKanji();
  }, []);

  // 🎯 check if connection is correct
  const onConnect = useCallback(
    (params: Connection) => {
      const source = nodes.find((n) => n.id === params.source);
      const target = nodes.find((n) => n.id === params.target);

      if (target?.id === "main" && source?.data.label) {
        const isCorrect = mainKanji?.radical?.parts?.includes(source.data.label);

        if (isCorrect) {
          setCorrectCount((c) => {
            const newCorrect = c + 1;
            if (newCorrect === totalCorrectParts) {
              setShowModal("win");
            }
            return newCorrect;
          });
        } else {
          setIncorrectCount((c) => {
            const newIncorrect = c + 1;
            if (newIncorrect > 3) {
              setShowModal("lose");
            }
            return newIncorrect;
          });
        }
      }
      setEdges((eds) => addEdge(params, eds));
    },
    [nodes, mainKanji, totalCorrectParts]
  );

  return (
    <div style={{ height: "600px", width: "100%", position: "relative" }}>
      {/* Counters + Reset */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "20px" }}>
        <span>✅ Correct: {correctCount}</span>
        <span>❌ Incorrect: {incorrectCount}</span>
        <button onClick={loadMainKanji}>Reset</button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap
          nodeColor={(node) => {
            if (node.className?.includes("kanji-node")) return "#10b981";
            if (node.className?.includes("part-node")) return "#3b82f6";
            return "#999";
          }}
          zoomable
          pannable
        />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>

      {/* 🎉 Win/Lose Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>{showModal === "win" ? "🎉 You Win!" : "❌ You Lose!"}</h2>
            <button
              onClick={loadMainKanji}
              className="reset-btn"
            >
              Reset Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
