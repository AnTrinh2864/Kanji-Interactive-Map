// src/components/SearchBar.tsx
import { useEffect, useState } from "react";
import { fetchKanji } from "@/api/kanjiApi";
import "./SearchBar.css"; // add styles for modal here

export function SearchBar({ onSelect }: { onSelect: (k: any) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 1) return;

    try {
      setLoading(true);
      const data = await fetchKanji(value);
      setSuggestions(data.kanji_list || [data.kanji]);
      setShowModal(true); // open modal after fetching
    } catch {
      setSuggestions([]);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
  };

  useEffect(() => {
    console.log("suggestions updated:", suggestions);
  }, [suggestions]);

  return (
    <div id="searchbar-container">
      <div id="searchbar-input-row">
        <input
          id="searchbar-input"
          placeholder="Search in English or Japanese..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
        />
        <button
          id="searchbar-button"
          onClick={() => handleSearch(query)}
          disabled = {loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <h3>Suggestions</h3>
            <div className="modal-suggestions">
              {suggestions.map((k, i) => {
                const normalized = {
                  kanji: k.kanji,
                  meaning: k.main_meanings?.[0] ?? "",
                  meanings: k.main_meanings ?? [],
                  readings: k.main_readings ?? {}, //kun or on
                  radical: k.radical ?? null,
                };
                return (
                  <button
                    key={i}
                    className="modal-suggestion"
                    onClick={() => {
                      setShowModal(false);
                      onSelect(normalized);
                    }}
                  >
                    {normalized.kanji} {normalized.meaning && `- ${normalized.meaning}`}
                  </button>
                );
              })}
            </div>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
