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
  main_meanings?: string[];
};

// const token = localStorage.getItem("token");
// await fetch("http://localhost:8000/api/some-protected-route", {
//   headers: {
//     "Authorization": `Bearer ${token}`,
//   },
// });


export function PartLinkBoard({ currentUser }: { currentUser: any }) {
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [mainKanji, setMainKanji] = useState<KanjiData | null>(null);
  const [totalCorrectParts, setTotalCorrectParts] = useState(0);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showModal, setShowModal] = useState<null | "win" | "lose">(null);
  const [loading, setLoading] = useState(false);

    const handleSave = async () => {
    if (!currentUser) {
      alert("You must log in to save progress.");
      return;
    }
    if (!mainKanji) return;

    const payload = {
      user_id: currentUser.id,
      kanji: mainKanji.kanji,
      meaning: mainKanji.main_meanings?.[0] ?? mainKanji.meaning,
      parts: mainKanji.radical?.parts ?? [],
    };

    try {
      const res = await fetch("http://localhost:8000/save_kanji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("✅ Saved!");
      } else {
        alert("❌ Save failed.");
      }
    } catch (e) {
      console.error("Save error", e);
      alert("❌ Save error.");
    }
  };
  // 🎲 fetch one random kanji as main
  const loadMainKanji = async () => {
    setLoading(true); // start loading
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

    try {
      const kinfo = await fetchKanji(choice);
      const kinfo1 = await fetchKanji(choice1);
      const kinfo2 = await fetchKanji(choice2);

      const parts1 = kinfo1?.kanji?.radical?.parts ?? [];
      const parts2 = kinfo2?.kanji?.radical?.parts ?? [];
      const kanjiData = kinfo?.kanji || { kanji: choice, meaning: "?" };
      setMainKanji(kanjiData);

      const mainNode = {
        id: "main",
        data: {
          label: `${kanjiData.kanji} (${kanjiData.main_meanings?.[0] ?? ""})`,
          kanji: kanjiData.kanji,
          type: "main",
        },
        position: { x: 400, y: 250 },
        className: "kanji-node",
        style: { border: "2px solid green", padding: "8px" },
      };

      const correctParts = kanjiData.radical?.parts ?? [];
      setTotalCorrectParts(correctParts.length);

      let parts = [...correctParts, ...parts1, ...parts2];
      parts.slice(0, 10);
      let shuffled = parts.sort(() => 0.5 - Math.random());
      if (shuffled.length < 10) {
        shuffled = [...shuffled, "火", "水", "人", "口", "心"];
      }
      shuffled = shuffled.sort(() => 0.5 - Math.random());

      const partInfos = await Promise.all(
        shuffled.map(async (p) => {
          try {
            const info = await fetchKanji(p);
            const meaning = Array.isArray(info.kanji?.main_meanings)
              ? info.kanji.main_meanings[0]
              : info.kanji?.main_meaning || "?";
            return { kanji: p, meaning };
          } catch {
            return { kanji: p, meaning: "?" };
          }
        })
      );

      const partNodes = partInfos.map((p, i) => ({
        id: `part-${i}`,
        data: { label: `${p.kanji} (${p.meaning})`, kanji: p.kanji, type: "part" },
        position: { x: 100 + i * 70, y: 50 + (i % 2) * 100 },
        className: "part-node",
        style: { border: "1px solid gray", padding: "6px" },
      }));

      setNodes([mainNode, ...partNodes]);
    } finally {
      setLoading(false); // stop loading regardless of success/fail
    }
  };

  useEffect(() => {
    loadMainKanji();
  }, []);

  // 🎯 check if connection is correct
  const onConnect = useCallback(
    (params: Connection) => {
      const source = nodes.find((n) => n.id === params.source);
      const target = nodes.find((n) => n.id === params.target);

      // ✅ only allow part → main
      if (target?.id !== "main" || source?.id === "main") {
        return; // block any other connections
      }

      if (target?.id === "main" && source?.data.kanji) {
        const isCorrect = mainKanji?.radical?.parts?.includes(source.data.kanji);

        if (isCorrect) {
          setCorrectCount((c) => {
            const newCorrect = c + 1;
            if (newCorrect === totalCorrectParts) {
              setShowModal("win");
            }
            return newCorrect;
          });

          // ✅ Only add edge if correct
          setEdges((eds) => addEdge(params, eds));
        } else {
          setIncorrectCount((c) => {
            const newIncorrect = c + 1;
            if (newIncorrect > 3) {
              setShowModal("lose");
            }
            return newIncorrect;
          });

          // ❌ Do not add edge if incorrect
        }
      }
    },
    [nodes, mainKanji, totalCorrectParts]
  );


  return (
    <div style={{ height: "500px", width: "100%", position: "relative" }}>
      {/* Counters + Reset */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "20px" }}>
        <span>✅ Correct: {correctCount}</span>
        <span>❌ Incorrect: {incorrectCount}</span>
        <button onClick={loadMainKanji}>Reset</button>
      </div>

      {loading ? (
        <div id="loading-overlay">
          <div id="loading-kanji">漢</div>
          <p id="loading-text">Loading kanji...</p>
        </div>
      ) : (
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

      {/* 🎉 Win/Lose Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>{showModal === "win" ? "🎉 You Win!" : "❌ You Lose!"}</h2>
            <button onClick={loadMainKanji} className="reset-btn">
              Reset Game
            </button>
            <button onClick={handleSave} className="save-btn">
              Save Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
}