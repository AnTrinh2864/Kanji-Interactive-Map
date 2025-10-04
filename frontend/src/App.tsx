// App.tsx
import { useEffect, useState } from "react";
import { SearchBar } from "./components/KanjiBoard/SearchBar";
import { KanjiBoard } from "./components/KanjiBoard/KanjiBoard";
import { KanjiDetail } from "./components/KanjiBoard/KanjiDetail";
import { PartLinkBoard } from "./components/KanjiBoard/PartLinkBoard";
import "./App.css";
import { fetchSavedKanjis, type SavedKanji } from "./api/kanjiApi";

function App() {
  const [selectedKanji, setSelectedKanji] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
  "explorer" | "details" | "partlink" | "saved"
>("explorer");
  const [loading, setLoading] = useState(false);

  // Authentication
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ username: "", password: "" });

  const [savedKanjis, setSavedKanjis] = useState<SavedKanji[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadSavedKanjis();
    }
  }, [currentUser, setActiveTab]);

  const loadSavedKanjis = async () => {
    if (!currentUser?.id) return;
    setLoadingSaved(true);
    const data = await fetchSavedKanjis(currentUser.id);
    setSavedKanjis(data);
    setLoadingSaved(false);
  };
  const handleAuth = async () => {
    const endpoint = authMode === "login" ? "login" : "signup";
    try {
      const res = await fetch(`http://localhost:8000/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        setCurrentUser(data);
      } else {
        const err = await res.json();
        alert(err.detail || "Authentication failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to server");
    }
  };

  if (!currentUser) {
    return (
      <div id="auth-container">
        <h2>{authMode === "login" ? "Login" : "Sign Up"}</h2>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button onClick={handleAuth}>
          {authMode === "login" ? "Login" : "Sign Up"}
        </button>
        <p onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
          {authMode === "login" ? "No account? Sign up" : "Have an account? Login"}
        </p>
      </div>
    );
  }

  return (
    <div id="app-root">
      {/* Navbar */}
      <nav id="navbar">
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
        <button onClick={() => setActiveTab("saved")} className={activeTab === "saved" ? "tab active" : "tab"}>
          Saved Kanjis
        </button>
        <div id="current-user"> {currentUser.username}</div>
      </nav>

      {/* Main Content */}
      <div id="main-content">
        {activeTab === "explorer" && (
          <div id="explorer-tab">
            <div id="search-container">
              <SearchBar onSelect={setSelectedKanji} loading={loading} setLoading={setLoading} />
            </div>
            <div id="kanji-board-container">
              <KanjiBoard selectedKanji={selectedKanji} loading={loading} />
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div id="details-tab">
            <div id="search-container">
              <SearchBar onSelect={setSelectedKanji} loading={loading} setLoading={setLoading} />
            </div>
            {selectedKanji ? (
              <KanjiDetail literal={selectedKanji.kanji} />
            ) : (
              <div id="select-kanji-msg">Select a kanji first to see details.</div>
            )}
          </div>
        )}

        {activeTab === "partlink" && (
          <div id="partlink-tab">
            <PartLinkBoard currentUser={currentUser} />
          </div>
        )}

        {activeTab === "saved" && (
        <div id="saved-kanjis-tab" className="p-6">
          <h2>Saved Kanjis</h2>
          {loadingSaved ? (
            <p>Loading saved kanjis...</p>
          ) : savedKanjis.length === 0 ? (
            <p>No saved kanjis yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {savedKanjis.map((k) => (
                <div
                  key={k.id}
                  className="saved-kanji-card p-4 border rounded shadow-sm cursor-pointer hover:shadow-lg transition"
                  onClick={() => {
                    setSelectedKanji(k); // Set selected kanji
                    setActiveTab("details"); // Switch to details tab
                  }}
                >
                  <div className="text-4xl text-center">Kanji: {k.kanji}</div>
                  <div className="mt-2 text-center text-gray-600">Meaning: {k.meaning}</div>
                  <div className="mt-1 text-center text-gray-500">
                    Reading: {k.reading === "" ? "No reading found" : k.reading}
                  </div>
                  <div className="mt-1 text-center text-sm text-gray-400">
                    Parts: {k.parts?.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      </div>
    </div>
  );
}

export default App;
