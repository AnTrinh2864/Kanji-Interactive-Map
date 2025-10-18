import { useState } from "react";
import { SearchBar } from "../SearchBar";
import { KanjiCanvas } from "./KanjiCanvas";

export function NewApp() {
    const [selectedKanji, setSelectedKanji] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    return (
         <div id="explorer-tab">
                    <div id="search-container">
                      <SearchBar
                        onSelect={setSelectedKanji}
                        loading={loading}
                        setLoading={setLoading}
                      />
                    </div>
                    <div id="kanji-board-container">
                      <KanjiCanvas selectedKanji={selectedKanji} loading={loading} />
                    </div>
                  </div>
    )
}