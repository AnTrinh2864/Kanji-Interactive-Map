// src/App.tsx
import { useState } from "react";
import { SearchBar } from "./components/KanjiBoard/SearchBar";
import { KanjiBoard } from "./components/KanjiBoard/KanjiBoard";

function App() {
  const [selectedKanji, setSelectedKanji] = useState<any>(null);

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <SearchBar onSelect={setSelectedKanji} />
      </div>
      <div className="flex-1">
        <KanjiBoard />
      </div>
    </div>
  );
}

export default App;
