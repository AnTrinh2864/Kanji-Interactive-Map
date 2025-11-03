import { useEffect, useState } from "react";
import "./Matching.css";
import { fetchMulQuiz } from "@/api/kanjiApi";
import { ModalMessage } from "../ModalMessage";

type KanjiData = {
  kanji: string;
  meanings: string[];
  radical: { meaning: string };
  readings: { kun: string[] | null; on: string[] };
  romaji_readings: { kun: string[]; on: string[] };
};

type MatchType = "meaning" | "reading";

export default function Matching({ currentUser }: { currentUser: any }) {
  const [quizItems, setQuizItems] = useState<KanjiData[]>([]);
  const [matchType, setMatchType] = useState<MatchType>("meaning");
  const [pairs, setPairs] = useState<{ left: string; right: string }[]>([]);
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [modal, setModal] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [disabledRights, setDisabledRights] = useState<Set<string>>(new Set());
  const [disabledRLefts, setDisabledLefts] = useState<Set<string>>(new Set());
  const [correctLefts, setCorrectLefts] = useState<Set<string>>(new Set());
  async function loadQuiz() {
    try {
      const response = await fetchMulQuiz();
      if (response.quiz_items.length === 4) setupQuiz(response.quiz_items);
    } catch (error) {
      console.error("Error loading quiz:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuiz();
  }, []);

  const setupQuiz = (items: KanjiData[]) => {
    setQuizItems(items);
    setConnections({});
    setSelectedLeft(null);
    setCorrectCount(0);
    setIncorrectCount(0);
    setDisabledRights(new Set());
    setDisabledLefts(new Set());

    const chosen: MatchType = Math.random() > 0.5 ? "meaning" : "reading";
    setMatchType(chosen);

    const rightColumn =
      chosen === "meaning"
        ? shuffle(items.map((i) => i.meanings[0]))
        : shuffle(
            items.map(
              (i) =>
                i.romaji_readings.on[0] ||
                i.romaji_readings.kun[0] ||
                i.readings.on[0] ||
                i.readings.kun?.[0] ||
                "?"
            )
          );

    const newPairs = items.map((i, idx) => ({
      left: i.kanji,
      right: rightColumn[idx],
    }));
    setPairs(newPairs);
  };

  const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

  const handleLeftClick = (kanji: string) => {
    setSelectedLeft(kanji === selectedLeft ? null : kanji);
  };

  const handleRightClick = (text: string) => {
    if (!selectedLeft || disabledRights.has(text)) return;

    const leftKanji = selectedLeft;
    const item = quizItems.find((i) => i.kanji === leftKanji);
    if (!item) return;

    const correctAnswer =
      matchType === "meaning"
        ? item.meanings[0]
        : item.romaji_readings.on[0] ||
          item.romaji_readings.kun[0] ||
          item.readings.on[0] ||
          item.readings.kun?.[0];

    const isCorrect = text === correctAnswer;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setModal({ message: `${leftKanji} matched correctly!`, type: "success" });
      setDisabledRights((prev) => new Set([...prev, text])); // ✅ disable the matched right item
      setDisabledLefts((prev)=> new Set([...prev,selectedLeft]));
      setCorrectLefts((prev)=> new Set([...prev, item.kanji]))
    } else {
      setIncorrectCount((c) => c + 1);
      setModal({ message: `${leftKanji} matched incorrectly.`, type: "error" });
    }

    setConnections((prev) => ({
      ...prev,
      [leftKanji]: text,
    }));

    setSelectedLeft(null);
  };

  if (loading) return <p className="p-4">Loading quiz...</p>;
  if (!quizItems.length) return <p className="p-4">No quiz data available.</p>;

  return (
    <div>
      {modal && (
        <ModalMessage
          message={modal.message}
          type={modal.type}
          onClose={() => setModal(null)}
        />
      )}

      <div className="quiz-container">
        <div className="quiz-card">
          <h2 className="text-2xl font-bold mb-4">Matching Quiz</h2>
          <p className="quiz-type">
            Match Type: {matchType === "meaning" ? "KANJI → MEANING" : "KANJI → READING"}
          </p>

          <label className="hint-toggle">
            <input
              type="checkbox"
              checked={showHint}
              onChange={() => setShowHint(!showHint)}
            />
            Show Hints
          </label>

          <div className="matching-grid">
            <div className="column left-column">
              {quizItems.map((item, idx) => (
                <button
                  key={idx}
                  className={`match-item left ${selectedLeft === item.kanji ? "selected" : ""} ${correctLefts.has(item.kanji)? "correct":""}`}
                  onClick={() => handleLeftClick(item.kanji)}
                  disabled = {disabledRLefts.has(item.kanji)}
                >
                  <span className="kanji">{item.kanji}</span>
                  {showHint && (
                    <p className="hint">
                      {item.romaji_readings.on[0] ||
                        item.romaji_readings.kun[0] ||
                        item.meanings[0]}
                    </p>
                  )}
                </button>
              ))}
            </div>

            <div className="column right-column">
              {pairs.map((p, idx) => (
                <button
                  key={idx}
                  disabled={disabledRights.has(p.right)}
                  className={`match-item right ${
                    Object.values(connections).includes(p.right)
                      ? "connected"
                      : ""
                  }`}
                  onClick={() => handleRightClick(p.right)}
                >
                  {p.right}
                </button>
              ))}
            </div>
          </div>

          <div className="controls">
            <p className="score">
              ✅ Correct: {correctCount} &nbsp;&nbsp; ❌ Incorrect: {incorrectCount}
            </p>
            <button className="next-btn" onClick={() => loadQuiz()}>
              🔁 Next Round
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
