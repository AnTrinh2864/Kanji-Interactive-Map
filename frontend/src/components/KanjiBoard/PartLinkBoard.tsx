import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background, Controls, addEdge, useNodesState, useEdgesState, type Connection, MiniMap, BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { fetchKanji } from "@/api/kanjiApi";
import "./PartLinkBoard.css"; // modal + board styles
import sample from "./sample";
import { ModalMessage } from "./ModalMessage";
import { ProgressBar } from "./ProgressBar";
import { saveKanji } from "./utils/KanjiHandler";
import { type KanjiData } from "./utils/KanjiHandler";

export function PartLinkBoard({ currentUser }: { currentUser: any }) {
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [mainKanji, setMainKanji] = useState<KanjiData | null>(null);
  const [totalCorrectParts, setTotalCorrectParts] = useState(0);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showModal, setShowModal] = useState<null | "win" | "lose">(null);
  //const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [disabled, setDisabled] = useState(true);
  const [progress, setProgress] = useState(0);

  // Save progress to backend
  const handleSave = async () => {
    if (!currentUser || !mainKanji) return alert("You must log in to save progress.");

    const payload = {
      user_id: currentUser.id,
      kanji: {
        kanji: mainKanji.kanji,
        meaning: mainKanji.main_meanings?.[0] ?? "",
        reading: mainKanji.main_readings?.kun?.[0] ?? mainKanji.main_readings?.on?.[0] ?? "",
        parts: mainKanji.radical?.parts ?? [],
      },
    };
    saveKanji(payload, setModal)
  }
  // Load random main kanji and parts
 const loadMainKanji = async () => {
   // setLoading(true);
    setDisabled(true);
    setProgress(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setEdges([]);
    setNodes([]);
    setShowModal(null);

    const step = (amount: number) => setProgress((p) => Math.min(p + amount, 100));

    try {
      const choice = sample[Math.floor(Math.random() * sample.length)];
      let choice1 = sample[Math.floor(Math.random() * sample.length)];
      let choice2 = sample[Math.floor(Math.random() * sample.length)];

      while (choice1 === choice) choice1 = sample[Math.floor(Math.random() * sample.length)];
      while (choice2 === choice) choice2 = sample[Math.floor(Math.random() * sample.length)];

      step(10);
      const [kinfo, kinfo1, kinfo2] = await Promise.all([
        fetchKanji(choice),
        fetchKanji(choice1),
        fetchKanji(choice2),
      ]);
      step(20);

      const parts1 = kinfo1?.kanji?.radical?.parts ?? [];
      const parts2 = kinfo2?.kanji?.radical?.parts ?? [];
      const kanjiData = kinfo?.kanji || { kanji: choice, meaning: "?" };
      setMainKanji(kanjiData);

      const correctParts = kanjiData.radical?.parts ?? [];
      setTotalCorrectParts(correctParts.length);

      step(10);

      let parts = [...correctParts, ...parts1, ...parts2].slice(0, 10);
      if (parts.length < 10) parts = [...parts, "火", "水", "人", "口", "心"];
      parts = parts.sort(() => 0.5 - Math.random());

      step(15);

      const total = parts.length;
      const partInfos: any[] = [];
      for (let i = 0; i < total; i++) {
        try {
          const info = await fetchKanji(parts[i]);
          const meaning = Array.isArray(info.kanji?.main_meanings)
            ? info.kanji.main_meanings[0]
            : info.kanji?.main_meaning || "?";
          partInfos.push({ kanji: parts[i], meaning });
        } catch {
          partInfos.push({ kanji: parts[i], meaning: "?" });
        }
        step(3); // small progress increment per part
      }

      const mainNode = {
        id: "main",
        data: { label: `${kanjiData.kanji} (${kanjiData.main_meanings?.[0] ?? ""})`, kanji: kanjiData.kanji, type: "main" },
        position: { x: 400, y: 250 },
        className: "kanji-node",
        style: { border: "2px solid green", padding: "8px" },
      };

      const partNodes = partInfos.map((p, i) => ({
        id: `part-${i}`,
        data: { label: `${p.kanji} (${p.meaning})`, kanji: p.kanji, type: "part" },
        position: { x: 100 + i * 70, y: 50 + (i % 2) * 100 },
        className: "part-node",
        style: { border: "1px solid gray", padding: "6px" },
      }));

      setNodes([mainNode, ...partNodes]);
      step(30);
    } finally {
      // small delay for smoother completion
      setTimeout(() => {
        setProgress(100);
       // setLoading(false);
        setDisabled(false);
      }, 500);
    }
  };

  useEffect(() => {
    loadMainKanji();
  }, []);

  // Handle connection logic (part → main only)
  const onConnect = useCallback(
    (params: Connection) => {
      const source = nodes.find((n) => n.id === params.source);
      const target = nodes.find((n) => n.id === params.target);

      if (target?.id !== "main" || source?.id === "main") return;

      const isCorrect = mainKanji?.radical?.parts?.includes(source?.data.kanji);

      if (isCorrect) {
        setCorrectCount((c) => {
          const newCorrect = c + 1;
          if (newCorrect === totalCorrectParts) setShowModal("win");
          return newCorrect;
        });
        setEdges((eds) => addEdge(params, eds));
      } else {
        setIncorrectCount((c) => {
          const newIncorrect = c + 1;
          if (newIncorrect > 3) setShowModal("lose");
          return newIncorrect;
        });
      }
    },
    [nodes, mainKanji, totalCorrectParts]
  );

  return (
    <div id="partlink-board">
      {disabled && (
        <ProgressBar progress={progress}/>
      )}
      {/* Counters + Reset */}
      <div id="board-header">
        <span>✅ Correct: {correctCount}</span>
        <span>❌ Incorrect: {incorrectCount}</span>
      </div>
      {/* ReactFlow board */}
      {(
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
      )}

      {/* Win/Lose modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowModal(null)}>×</button>
            <h2>{showModal === "win" ? "🎉 You Win!" : "❌ You Lose!"}</h2>
            <button onClick={loadMainKanji} className="reset-btn">Reset Game</button>
            <button onClick={handleSave} className="save-btn">Save Progress</button>
          </div>
        </div>
      )}
       {/* Modal message */}
            {modal && (
              <ModalMessage
                message={modal.message}
                type={modal.type}
                onClose={() => setModal(null)}
              />
            )}
    </div>
  );
}
