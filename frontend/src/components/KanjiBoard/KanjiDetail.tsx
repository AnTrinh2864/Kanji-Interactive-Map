import { useEffect, useState } from "react";
import { fetchKanji } from "@/api/kanjiApi";
import "./KanjiDetail.css";

export function KanjiDetail({ literal }: { literal: string }) {
  const [info, setInfo] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doc = await fetchKanji(literal);
        setInfo(doc);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [literal]);

  if (!info) {
    return <div id="loading">Loading kanji...</div>;
  }

  const k = info.kanji;
  const unicodeHex = k.kanji.codePointAt(0)?.toString(16);
  const strokeOrderPath = unicodeHex ? `/kanji/0${unicodeHex}.svg` : null;

  return (
    <div id="kanji-detail">
     
      {/* Info Section */}
      <div id="kanji-info">
        <h1>{k.kanji}</h1>
        <p id="strokes">{k.strokes} strokes</p>

        <h2>Meanings</h2>
        <p>{k.main_meanings?.join(", ") || "—"}</p>

        <h2>Readings</h2>
        <p>
          <strong>On:</strong> {k.main_readings?.on?.join(", ") || "—"}
        </p>
        <p>
          <strong>Kun:</strong> {k.main_readings?.kun?.join(", ") || "—"}
        </p>

        <h2>Radical</h2>
        <p>
          Main radical: {k.radical?.basis} ({k.radical?.meaning})
        </p>
        {k.radical?.parts && k.radical.parts.length > 0 && (
          <p>Parts: {k.radical.parts.join(", ")}</p>
        )}

        <h2>Reading Examples</h2>
        <div id="examples">
          <div>
            <h3>Kun</h3>
            <ul>
              {k.reading_examples?.kun?.map((ex: any, i: number) => (
                <li key={i}>
                  <span className="example-kanji">{ex.kanji}</span>{" "}
                  {ex.reading} — {ex.meanings.join(", ")}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>On</h3>
            <ul>
              {k.reading_examples?.on?.map((ex: any, i: number) => (
                <li key={i}>
                  <span className="example-kanji">{ex.kanji}</span>{" "}
                  {ex.reading} — {ex.meanings.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal for enlarged stroke order */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              ✕
            </button>
            <img
              src={strokeOrderPath!}
              alt={`Stroke order for ${k.kanji}`}
              className="modal-img"
            />
          </div>
        </div>
      )}
       {/* Big Kanji */}
      <div id = "right-col">
        <div id="big-kanji">
          {k?.kanji || k?.literal || "?"}
        </div>
      {/* Stroke order */}
        <div id="stroke">
          <h2 style={{alignItems:"center"}}>Stroke order</h2>
          {strokeOrderPath ? (
            <img
              width={"300px"}
              height={"300px"}
              src={strokeOrderPath}
              alt={`Stroke order for ${k.kanji}`}
              id="stroke-order"
              onClick={() => setIsModalOpen(true)} // open modal when clicked
              style={{ cursor: "pointer" }}
            />
          ) : (
            <p>—</p>
          )}
        </div>
      </div>
    </div>
  );
}
