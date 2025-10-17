// src/App.tsx
import { useEffect, useState } from "react";
import { SearchBar } from "./components/KanjiBoard/SearchBar";
import { KanjiBoard } from "./components/KanjiBoard/KanjiBoard";
import { KanjiDetail } from "./components/KanjiBoard/KanjiDetail";
import { PartLinkBoard } from "./components/KanjiBoard/PartLinkBoard";
import { SavedKanjisTab } from "./components/KanjiBoard/SavedKanjiList";
import { AuthForm } from "./components/KanjiBoard/AuthForm";
import { fetchSavedKanjis } from "./api/kanjiApi";
import "./App.css";

function App() {
  const [selectedKanji, setSelectedKanji] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "explorer" | "details" | "partlink" | "saved"
  >("explorer");
  const [loading, setLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load saved kanjis when user logs in
  useEffect(() => {
    if (currentUser) loadSavedKanjis();
  }, [currentUser]);

  const loadSavedKanjis = async () => {
    if (!currentUser?.id) return;
    await fetchSavedKanjis(currentUser.id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setSelectedKanji(null);
    setActiveTab("explorer");
  };

  if (!currentUser) {
    return <AuthForm onAuthSuccess={setCurrentUser} />;
  }

  return (
    <div id="app-root">
      {/* Navbar */}
      <nav id="navbar">
        <div className="tab-group">
          <button
            className={activeTab === "explorer" ? "tab active" : "tab"}
            onClick={() => setActiveTab("explorer")}
          >
            Kanji Explorer
          </button>
          <button
            className={activeTab === "details" ? "tab active" : "tab"}
            onClick={() => setActiveTab("details")}
          >
            Kanji Details
          </button>
          <button
            className={activeTab === "partlink" ? "tab active" : "tab"}
            onClick={() => setActiveTab("partlink")}
          >
            Part Link
          </button>
          <button
            className={activeTab === "saved" ? "tab active" : "tab"}
            onClick={() => setActiveTab("saved")}
          >
            Saved Kanjis
          </button>
        </div>

        <div id="user-info">
          <span id="current-user">{currentUser.username}</span>
          <button id="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div id="main-content">
        {activeTab === "explorer" && (
          <div id="explorer-tab">
            <div id="search-container">
              <SearchBar
                onSelect={setSelectedKanji}
                loading={loading}
                setLoading={setLoading}
              />
            </div>
            <div id="kanji-board-container">
              <KanjiBoard selectedKanji={selectedKanji} loading={loading} />
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div id="details-tab">
            <div id="search-container">
              <SearchBar
                onSelect={setSelectedKanji}
                loading={loading}
                setLoading={setLoading}
              />
            </div>
            {selectedKanji ? (
              <KanjiDetail
                literal={selectedKanji.kanji}
                currentUser={currentUser}
              />
            ) : (
              <div id="select-kanji-msg">
                Select a kanji first to see details.
              </div>
            )}
          </div>
        )}

        {activeTab === "partlink" && (
          <div id="partlink-tab">
            <PartLinkBoard currentUser={currentUser} />
          </div>
        )}

        {activeTab === "saved" && (
          <SavedKanjisTab
            currentUser={currentUser}
            onSelectKanji={setSelectedKanji}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </div>
  );
}

export default App;
