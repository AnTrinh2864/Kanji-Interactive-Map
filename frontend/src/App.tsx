// src/App.tsx
import { useEffect, useState } from "react";
import { SearchBar } from "./components/KanjiBoard/SearchBar";
import { KanjiBoard } from "./components/KanjiBoard/KanjiBoard";
import { KanjiDetail } from "./components/KanjiBoard/KanjiDetail";
import { SavedKanjisTab } from "./components/KanjiBoard/SavedKanjiList";
import { AuthForm } from "./components/KanjiBoard/AuthForm";
import { fetchSavedKanjis } from "./api/kanjiApi";
import "./App.css";
import QuizSection from "./components/KanjiBoard/quiz/QuizSection";

function App() {
  const [selectedKanji, setSelectedKanji] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "explorer" | "details" | "saved" | "quiz-partlink" | "quiz-mc" | "quiz-fill"
  >("explorer");
  const [loading, setLoading] = useState(false);
  const [showQuizMenu, setShowQuizMenu] = useState(false);
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
            className={activeTab === "saved" ? "tab active" : "tab"}
            onClick={() => setActiveTab("saved")}
          >
            Saved Kanjis
          </button>
          {/* Quiz Dropdown */}
          <div
            className="dropdown"
            onMouseEnter={() => setShowQuizMenu(true)}
            onMouseLeave={() => setShowQuizMenu(false)}
          >
            <button className = {activeTab.includes("quiz") ? "tab active" : "tab"}>Quiz ▾</button>
            {showQuizMenu && (
              <div className="dropdown-menu">
                <button onClick={() => setActiveTab("quiz-partlink")}>
                  Part Link
                </button>
                <button onClick={() => setActiveTab("quiz-mc")}>
                  Multiple Choice
                </button>
                <button onClick={() => setActiveTab("quiz-fill")}>
                  Fill in the Blank
                </button>
              </div>
            )}
          </div>
        </div>

        <div id="user-info">
           <img
            src="/bunny.svg"
            alt="User Icon"
            className="user-icon"
          />
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
              <KanjiBoard setSelectedKanji = {setSelectedKanji} selectedKanji={selectedKanji} loading={loading} />
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

        {activeTab === "saved" && (
          <SavedKanjisTab
            currentUser={currentUser}
            onSelectKanji={setSelectedKanji}
            setActiveTab={setActiveTab}
          />
        )}

         {/* Quiz Sections */}
        {activeTab === "quiz-partlink" && (
          <QuizSection currentUser={currentUser} defaultQuiz="Part Link" />
        )}
        {activeTab === "quiz-mc" && (
          <QuizSection currentUser={currentUser} defaultQuiz="Multiple Choice" />
        )}
        {activeTab === "quiz-fill" && (
          <QuizSection currentUser={currentUser} defaultQuiz="Fill in the blank" />
        )}
      </div>
    </div>
  );
}

export default App;
