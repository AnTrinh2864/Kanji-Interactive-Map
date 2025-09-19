import { useState } from "react";
import { fetchKanji } from "../../api/kanjiApi";

export default function KanjiSearch() {
  const [input, setInput] = useState("");
  const [kanjiData, setKanjiData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      setError(null);
      const data = await fetchKanji(input);
      setKanjiData(data);
    } catch (err: any) {
      setError(err.message);
      setKanjiData(null);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter a kanji"
      />
      <button onClick={handleSearch}>Search</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {kanjiData && kanjiData._id && (
        <div style={{ marginTop: "20px" }}>
          <h2>{kanjiData.kanji.character}</h2>
          <p>Meaning: {kanjiData.kanji.meaning.english}</p>
          <p>Onyomi: {kanjiData.kanji.onyomi.katakana}</p>
          <p>Romaji: {kanjiData.kanji.onyomi.romaji}</p>
          <p>Kunyomi: {kanjiData.kanji.kunyomi.hiragana}</p>
          <p>Romaji: {kanjiData.kanji.kunyomi.romaji}</p>
        </div>
      )}
    </div>
  );
}
