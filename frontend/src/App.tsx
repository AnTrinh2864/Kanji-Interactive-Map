import { useState } from "react";
import { SearchBar } from "./components/KanjiBoard/SearchBar";
import { KanjiBoard } from "./components/KanjiBoard/KanjiBoard";
import { KanjiDetail } from "./components/KanjiBoard/KanjiDetail";
import { PartLinkBoard } from "./components/KanjiBoard/PartLinkBoard";
import "./App.css";

function App() {
  const [selectedKanji, setSelectedKanji] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"explorer" | "details" | "partlink">("explorer");

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <nav id="navbar">
        <button
          onClick={() => setActiveTab("explorer")}
          className={activeTab === "explorer" ? "tab active" : "tab"}
        >
          Kanji Explorer
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={activeTab === "details" ? "tab active" : "tab"}
        >
          Kanji Details
        </button>
        <button
          onClick={() => setActiveTab("partlink")}
          className={activeTab === "partlink" ? "tab active" : "tab"}
        >
          Part Link
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

        {activeTab === "partlink" && (
          <div className="h-full p-4">
            <PartLinkBoard />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
