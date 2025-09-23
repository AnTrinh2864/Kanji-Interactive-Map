import { useState } from "react";
import { SearchBar } from "./components/KanjiBoard/SearchBar";
import { KanjiBoard } from "./components/KanjiBoard/KanjiBoard";

function App() {
  const [selectedKanji, setSelectedKanji] = useState<any>(null);
  const demonKanji = {
    kanji: "森",
    meaning: "forest",
    meanings: ["forest"],
    main_readings: {
      "kun": [
        "もり"
      ],
      "on": [
        "シン"
      ]
    },
    radical: {
      "alt_forms": null,
      "meaning": "tree",
      "parts": [
        "木"
      ],
      "basis": "木",
      "kangxi_order": 75,
      "variants": null
    },
  }
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <SearchBar onSelect={setSelectedKanji} />
      </div>
      <div className="flex-1 h-full">
        <KanjiBoard selectedKanji={selectedKanji} />
      </div>
    </div>
  );
}

export default App;
