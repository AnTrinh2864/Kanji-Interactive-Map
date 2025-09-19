// src/components/SearchBar.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { fetchKanji } from "@/api/kanjiApi";

export function SearchBar({ onSelect }: { onSelect: (k: any) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleSearch = async (value: string) => {
    setQuery(value);
    console.log(value)
    if (value.trim().length < 1) return;

    try {
      const data = await fetchKanji(value);
      console.log("this is data: " + data)
      setSuggestions(data.kanji_list || [data.kanji]);
    } catch {
      setSuggestions([]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <Input
        placeholder="Search in English or Japanese..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <div className="flex gap-2 flex-wrap">
        {suggestions.map((k, i) => (
          <button
            key={i}
            className="px-2 py-1 border rounded hover:bg-accent"
            onClick={() => onSelect(k)}
          >
            {k.literal}
          </button>
        ))}
      </div>
    </div>
  );
}
