// src/components/SearchBar.tsx
import { useEffect, useState } from "react";
import { fetchKanji } from "@/api/kanjiApi";

export function SearchBar({ onSelect }: { onSelect: (k: any) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(true)
  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 1) return;

    try {
      setLoading(true);
      const data = await fetchKanji(value);
      setSuggestions(data.kanji_list || [data.kanji]);
    } catch {
      setSuggestions([]);
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
    <div  id="searchbar-container">
      <div  id="searchbar-input-row">
        <input
          id="searchbar-input"
          placeholder="Search in English or Japanese..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
        />
        <button
          id="searchbar-button"
          onClick={() => { 
            handleSearch(query) 
            setShow(true)}}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {show && <div id="searchbar-suggestions">
        {suggestions.map((k, i) => {
          const normalized = {
            kanji: k.kanji,
            meaning: k.main_meanings?.[0] ?? "",
            meanings: k.main_meanings ?? [],
            readings: k.main_readings ?? {}, //kun or on
            radical: k.radical ?? null, //parts is in this
          };
          if (k && typeof k === "object" && "kanji" in k) {
            return (
              <button
                key={i}
                id={`searchbar-suggestion-${i}`}
                onClick={() => {
                  setShow(false)
                  onSelect(normalized)
                }}
              >
                {normalized.kanji} - {normalized.meaning}
              </button>
            );
          }
          return (
            <button
              key={i}
              id={`searchbar-suggestion-${i}`}
              onClick={() => {
                setShow(false)
                onSelect(normalized)}}
            >
              {normalized.kanji}
            </button>
          );
        })}
      </div>
        }
    </div>
  );
}
