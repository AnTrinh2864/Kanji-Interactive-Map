import { useState } from "react";
import { SearchBar } from "./components/KanjiBoard/SearchBar";
import { KanjiBoard } from "./components/KanjiBoard/KanjiBoard";
import { KanjiDetail } from "./components/KanjiBoard/KanjiDetail";

function App() {
  const [selectedKanji, setSelectedKanji] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"explorer" | "details">("explorer");

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white p-4 flex space-x-6">
        <button
          onClick={() => setActiveTab("explorer")}
          className={`${
            activeTab === "explorer" ? "font-bold border-b-2 border-white" : ""
          }`}
        >
          Kanji Explorer
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`${
            activeTab === "details" ? "font-bold border-b-2 border-white" : ""
          }`}
        >
          Kanji Details
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "explorer" && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <SearchBar onSelect={setSelectedKanji} />
            </div>
            <div className="flex-1 h-full">
              <KanjiBoard selectedKanji={selectedKanji} />
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="p-6">
            <div className="p-4 border-b">
              <SearchBar onSelect={setSelectedKanji} />
            </div>
            {selectedKanji ? (
              <KanjiDetail literal={selectedKanji.kanji} />
            ) : (
              <div className="text-center text-gray-500 mt-20">
                Select a kanji first to see details.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
