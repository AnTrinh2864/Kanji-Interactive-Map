import { fetchKanji } from "@/api/kanjiApi";
import type React from "react";
import {type Edge, type Node} from "reactflow"

export type KanjiData = {
  kanji: string;
  meaning?: string;
  meanings?: string[];
  readings?: any;
  reading?: string;
  radical?: { parts?: string[] };
  strokes?: number;
  parts?: string[];
  main_meanings?: string[];
  main_readings?: {
    kun?: string[];
    on?: string[];
  };
};

export const hasKanjiNode = (kanjiChar: string, nodes: Node[]) =>
  nodes.some((n) => {
    const nodeKanji = n.data?.label?.split("-")[0];
    return nodeKanji === kanjiChar;
  });

export const handleListResult = (p: string, kanji_list: any[]) => {
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
export const addKanji = (kanji: KanjiData, nodes: Node[], setNodes: React.Dispatch<React.SetStateAction<Node[]>>) => {
    if (!kanji?.kanji) return;

    const id = kanji.kanji;
    if (nodes.find((n) => n.id === id)) return;
    if (hasKanjiNode(id, nodes)) return;
    setNodes((nds) => [
      ...nds,
      {
        id,
        data: {
          label: `${id}-${kanji.meaning??  kanji.meanings?.[0] ?? ""}`,
          kanji: `${id}`,
          meaning: kanji.meaning,
          meanings: kanji.meanings,
          radical: kanji.radical ?? {parts: kanji.parts},
          readings: kanji.readings ?? kanji.reading,
          type: "kanji",
        },
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        className: "kanji-node",
      },
    ]);
  };

export const addParts = (kanjiId: string, parts: string[], nodes: Node[], 
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  ) => {
      const baseX = Math.random() * 400;
      const baseY = Math.random() * 400;
  
      parts.forEach(async (p, i) => {
        const partId = `${p}`;
        console.log(p)
        const data = await fetchKanji(p);
        if (hasKanjiNode(p, nodes)) return;
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
export const addRelated = (partId: string, kanjis: (KanjiData | string)[], page: number,
    nodes: Node[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  const baseX = Math.random() * 400;
  const baseY = Math.random() * 400;

  setNodes((nds) => nds.filter((n) => n.id !== `${partId}-more-${page}`));

  kanjis.forEach(async (k, i) => {
    const label = typeof k === "string" ? k : k.kanji;
    if (!label) return;

    const kid = `${partId}-rel-${page}-${label}`;
    if (nodes.find((n) => n.id === kid)) return;
    if (hasKanjiNode(label, nodes)) return;
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
export const saveKanji = async (
  payload: {},
  setModal: React.Dispatch<React.SetStateAction<{ message: string; type: "success" | "error" } | null>>
) => {
   try {
      const res = await fetch("http://localhost:8000/api/save_kanji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setModal({ message: "Kanji saved successfully", type: "success" });
      } else {
        setModal({ message: "Kanji was not saved successfully", type: "error" });
      }
    } catch (e) {
      console.error("Save error", e);
      setModal({ message: "Kanji was not saved successfully", type: "error" });
    }
  }