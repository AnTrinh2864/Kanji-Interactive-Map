import { useState } from "react";
import ReactFlow, {
  type Node,
  type Edge,
  ReactFlowProvider,
  type NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import KanjiNode from "./KanjiNode";
import { fetchKanji } from "../../api/kanjiApi";

export default function KanjiBoard() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!input) return;
    try {
      setError(null);
      const data = await fetchKanji(input);

      const mainKanjiNode: Node = {
        id: "kanji-main",
        type: "default",
        position: { x: 300, y: 100 },
        data: {
          kanjiData: data,
          label: (
            <KanjiNode
              character={data.kanji.character}
              meaning={data.meaning}
            />
          ),
        },
      };

      setNodes([mainKanjiNode]);
      setEdges([]);
    } catch (err: any) {
      setError(err.message);
      setNodes([]);
      setEdges([]);
    }
  };

  // Toggle radicals on main kanji click
  const onNodeClick: NodeMouseHandler = (_event, node) => {
    if (node.id !== "kanji-main") return;

    const kanjiData = (node.data as any)?.kanjiData;
    if (!kanjiData) return;

    // Check if radicals already exist → toggle them off
    const hasRadicals = nodes.some(
      (n) => n.id.startsWith("radical-") || n.id === "radical-itself"
    );
    if (hasRadicals) {
      // remove radicals + edges
      setNodes((prev) => prev.filter((n) => n.id === "kanji-main"));
      setEdges([]);
      return;
    }

    const radicalObj = kanjiData.radical ?? null;
    const isSelfRadical =
      radicalObj && String(kanjiData.character) === String(radicalObj.character);

    const radicals = radicalObj && !isSelfRadical ? [radicalObj] : [];

    const mainPos = node.position as { x: number; y: number };

    const radicalNodes: Node[] =
      radicals.length > 0
        ? radicals.map((r: any, i: number) => ({
            id: `radical-${i}`,
            type: "default",
            position: {
              x:
                mainPos.x +
                150 * Math.cos((i / radicals.length) * 2 * Math.PI),
              y:
                mainPos.y +
                150 * Math.sin((i / radicals.length) * 2 * Math.PI),
            },
            data: {
              kanjiData: r,
              label: (
                <KanjiNode
                  character={r.character ?? "?"}
                  meaning={r.meaning.english}
                />
              ),
            },
          }))
        : isSelfRadical
        ? [
            {
              id: "radical-itself",
              type: "default",
              position: { x: mainPos.x + 160, y: mainPos.y },
              data: {
                label: (
                  <KanjiNode
                    character="•"
                    meaning="This kanji is a radical"
                  />
                ),
              },
            },
          ]
        : [];

    const newEdges: Edge[] = radicalNodes.map((rn) => ({
      id: `${rn.id}-to-main`,
      source: rn.id,
      target: "kanji-main",
      animated: true,
    }));

    // Add to nodes
    setNodes((prev) => [...prev, ...radicalNodes]);
    setEdges((prev) => [...prev, ...newEdges]);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Kanji"
          style={{ padding: 8, fontSize: 16 }}
        />
        <button onClick={handleSearch} style={{ marginLeft: 8, padding: 8 }}>
          Search
        </button>
        {error && <span style={{ color: "red", marginLeft: 12 }}>{error}</span>}
      </div>

      <div style={{ width: "100%", height: 600, border: "1px solid #ccc" }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            onNodeClick={onNodeClick} // ✅ use click
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
