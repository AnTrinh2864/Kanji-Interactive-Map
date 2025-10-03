// App.tsx
import { useState } from "react";
import { SearchBar } from "./components/KanjiBoard/SearchBar";
import { KanjiBoard } from "./components/KanjiBoard/KanjiBoard";
import { KanjiDetail } from "./components/KanjiBoard/KanjiDetail";
import { PartLinkBoard } from "./components/KanjiBoard/PartLinkBoard";
import "./App.css";

function App() {
  const [selectedKanji, setSelectedKanji] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"explorer" | "details" | "partlink">("explorer");
  const [loading, setLoading] = useState(false);

  // 🔑 Authentication
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ username: "", password: "" });

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

        // save JWT
        localStorage.setItem("token", data.access_token);
        setCurrentUser({ username: form.username }); // store username locally
      } else {
        const err = await res.json();
        alert(err.detail || "Auth failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to server");
    }
  };


  if (!currentUser) {
    return (
      <div className="login-container">
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
        <button onClick={handleAuth}>{authMode === "login" ? "Login" : "Sign Up"}</button>
        <p onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
          {authMode === "login" ? "No account? Sign up" : "Have account? Login"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <nav id="navbar">
        <button onClick={() => setActiveTab("explorer")} className={activeTab === "explorer" ? "tab active" : "tab"}>
          Kanji Explorer
        </button>
        <button onClick={() => setActiveTab("details")} className={activeTab === "details" ? "tab active" : "tab"}>
          Kanji Details
        </button>
        <button onClick={() => setActiveTab("partlink")} className={activeTab === "partlink" ? "tab active" : "tab"}>
          Part Link
        </button>
        <div style={{ marginLeft: "auto" }}>👤 {currentUser.username}</div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "explorer" && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <SearchBar onSelect={setSelectedKanji} loading={loading} setLoading={setLoading} />
            </div>
            <div className="flex-1 h-full">
              <KanjiBoard selectedKanji={selectedKanji} loading={loading} />
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="p-6">
            <div className="p-4 border-b">
              <SearchBar onSelect={setSelectedKanji} loading={loading} setLoading={setLoading} />
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
            <PartLinkBoard currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
