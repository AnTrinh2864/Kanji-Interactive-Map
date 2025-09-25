import { useEffect, useState } from "react";
import { fetchKanji } from "@/api/kanjiApi";


export function KanjiDetail({ literal }: { literal: string}) {
  const [info, setInfo] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async() => {
        try {
        console.log(literal)
        const doc = await fetchKanji(literal);
        setInfo(doc)
        } catch (err) {
        console.error(err);
        }
    }
    fetchData()
  }, [literal]);

  if (!info) {
    return <div className="p-6 text-center">Loading kanji...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Big Kanji */}
      <div className="text-center">
        <div className="text-9xl font-bold">{info.kanji.kanji}</div> {/*This is not working atm */}
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Meanings</h2>
          {info.kanji.main_meanings &&
          <p>{info.kanji.main_meanings.join(", ")}</p>
          }
          <h2 className="text-xl font-semibold">On Readings</h2>
          <p>{info.kanji.main_readings.on.join(", ") || "—"}</p>

          <h2 className="text-xl font-semibold">Kun Readings</h2>
          <p>{info.kanji.main_readings.on.join(", ") || "—"}</p>
        </div>

        {/* Stroke Order SVG */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Stroke Order</h2>
          {/* <img
            src={""}
            alt={`Stroke order for ${info.kanji.kanji}`}
            className="w-full max-w-lg border rounded-lg shadow"
          /> */}
        </div>
      </div>
    </div>
  );
}
