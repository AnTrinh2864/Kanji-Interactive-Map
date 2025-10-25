import { useEffect, useState } from "react";
import {
  fetchSavedKanjis,
  deleteSavedKanji,
  type SavedKanji,
} from "@/api/kanjiApi";
import './SavedKanjiList.css';
interface SavedKanjisTabProps {
  currentUser: any;
  onSelectKanji: (kanji: any) => void;
  setActiveTab: (tab: "explorer" | "details" | "saved") => void;
}
import { ModalMessage } from "./ModalMessage";

export function SavedKanjisTab({
  currentUser,
  onSelectKanji,
  setActiveTab,
}: SavedKanjisTabProps) {
  const [savedKanjis, setSavedKanjis] = useState<SavedKanji[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [modal, setModal] = useState<{ message: string; type: "success" | "error" } | null>(null);
  useEffect(() => {
    if (currentUser) loadSavedKanjis();
  }, [currentUser]);

  const loadSavedKanjis = async () => {
    if (!currentUser?.id) return;
    setLoadingSaved(true);
    try {
      const data = await fetchSavedKanjis(currentUser.id);
      setSavedKanjis(data);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleDelete = async (kanjiId: number) => {
    if (!currentUser?.id) return;
    setDeletingId(kanjiId);
    try {
      await deleteSavedKanji(currentUser.id, kanjiId);
      setSavedKanjis((prev) => prev.filter((k) => k.id !== kanjiId));
      setModal({ message: "Kanji removed successfully", type: "success" });
    } catch (err) {
      setModal({ message: "Failed to delete kanji", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div id="saved-kanjis-tab" className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Saved Kanjis</h2>

      {loadingSaved ? (
        <p>Loading saved kanjis...</p>
      ) : savedKanjis.length === 0 ? (
        <p>No saved kanjis yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {savedKanjis.map((k) => (
            <div
              key={k.id}
              className="saved-kanji-card relative p-4 border rounded shadow-sm hover:shadow-lg transition"
            >
              {/* Delete (X) Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent switching tab when clicking X
                  handleDelete(k.id);
                }}
                disabled={deletingId === k.id}
              >
                {deletingId === k.id ? "…" : "✕"}
              </button>

              {/* Kanji Info */}
              <div
                onClick={() => {
                  onSelectKanji(k);
                  setActiveTab("details");
                }}
                className="cursor-pointer"
              >
                <div className="text-4xl text-center font-bold">{k.kanji}</div>
                <div className="mt-2 text-center text-gray-600">
                  Meaning: {k.meaning}
                </div>
                <div className="mt-1 text-center text-gray-500">
                  Reading: {k.reading === "" ? "No reading found" : k.reading}
                </div>
                <div className="mt-1 text-center text-sm text-gray-400">
                  Parts: {k.parts?.join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
       {/* Modal message */}
      {modal && (
        <ModalMessage
          message={modal.message}
          type={modal.type}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
