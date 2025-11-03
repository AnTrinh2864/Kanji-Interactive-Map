import { useEffect, useState } from "react";
import "./MultipleChoice.css";
import { fetchKanji, fetchMulQuiz } from "@/api/kanjiApi";
import { saveKanji } from "../utils/KanjiHandler";
import { ModalMessage } from "../ModalMessage";

type KanjiData = {
  kanji: string;
  meanings: string[];
  radical: {
    meaning: string;
    parts: string[];
    basis: string;
  };
  readings: {
    kun: string[] | null;
    on: string[];
  };
  romaji_readings: {
    kun: string[];
    on: string[];
  };
};

type QuizType = "meaning" | "radical" | "reading";
type RadicalMode = "meaning" | "basis"; // New subtype

export default function MultipleChoiceQuiz({ currentUser }: { currentUser: any }) {
  const [quizItems, setQuizItems] = useState<KanjiData[]>([]);
  const [quizType, setQuizType] = useState<QuizType>("meaning");
  const [radicalMode, setRadicalMode] = useState<RadicalMode>("meaning");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [modal, setModal] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch 4 random Kanji
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

  // Setup quiz question
  const setupQuiz = (items: KanjiData[]) => {
    setSelected(null);
    setCorrectAnswer("");
    setQuestion("");
    setOptions([]);
    setShowHint(false);
    setQuizItems(items);

    const types: QuizType[] = ["meaning", "radical", "reading"];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    setQuizType(chosenType);

    const correctItem = items[Math.floor(Math.random() * items.length)];
    let questionText = "";
    let correct = "";

    if (chosenType === "meaning") {
      questionText = `Which kanji means "${correctItem.meanings[0]}"?`;
      correct = correctItem.kanji;
      setOptions(shuffle(items.map((i) => i.kanji)));
    }

    else if (chosenType === "radical") {
      // randomly choose radical meaning vs basis mode
      const mode: RadicalMode = Math.random() > 0.5 ? "meaning" : "basis";
      setRadicalMode(mode);

      if (mode === "meaning") {
        questionText = `Which kanji has the radical meaning "${correctItem.radical.meaning}"?`;
      } else {
        questionText = `Which kanji has the radical basis "${correctItem.radical.basis}"?`;
      }

      correct = correctItem.kanji;
      setOptions(shuffle(items.map((i) => i.kanji)));
    }

    else if (chosenType === "reading") {
      const reading =
        correctItem.romaji_readings.on[0] ||
        correctItem.romaji_readings.kun[0] ||
        "?";
      questionText = `Which kanji has the reading "${reading}"?`;
      correct = correctItem.kanji;
      setOptions(shuffle(items.map((i) => i.kanji)));
    }

    setQuestion(questionText);
    setCorrectAnswer(correct);
  };

  const handleSave = async (currentUser: any, kanji: string) => {
    const mainKanji = await fetchKanji(kanji);
    if (!currentUser || !mainKanji) return alert("You must log in to save progress.");
    const payload = {
      user_id: currentUser.id,
      kanji: {
        kanji: mainKanji.kanji.kanji,
        meaning: mainKanji.kanji.main_meanings?.[0] ?? "",
        reading:
          mainKanji.kanji.main_readings?.kun?.[0] ??
          mainKanji.kanji.main_readings?.on?.[0] ??
          "",
        parts: mainKanji.kanji.radical?.parts ?? [],
      },
    };
    saveKanji(payload, setModal);
  };

  const handleAnswer = (option: string) => setSelected(option);
  const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

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
          <h2 className="text-2xl font-bold mb-4">Multiple Choice Quiz</h2>

          <p className="quiz-type">Quiz Type: {quizType.toUpperCase()}</p>
          <p className="quiz-question">{question}</p>

          {/* Hint toggle label depends on quiz type */}
          <label className="hint-toggle">
            <input
              type="checkbox"
              checked={showHint}
              onChange={() => setShowHint(!showHint)}
            />
            {quizType === "reading"
              ? "Show On/Kun Hints"
              : quizType === "radical"
              ? radicalMode === "meaning"
                ? "Show Radical Parts"
                : "Show Radical Basis Meaning"
              : "Show Romaji Hints"}
          </label>

          <div className="quiz-options">
            {options.map((option, idx) => {
              const item = quizItems.find((i) => i.kanji === option);
              const romaji =
                item?.romaji_readings?.on[0] ||
                item?.romaji_readings?.kun[0] ||
                "";
              const readingHint =
                quizType === "reading"
                  ? `${item?.readings?.on[0] || ""} | ${item?.readings?.kun?.[0] || ""}`
                  : romaji;

              // radical hints
              const radicalHint =
                radicalMode === "meaning"
                  ? item?.radical?.parts?.join(" ") || "—"
                  : item?.radical?.meaning || "—";

              return (
                <div key={idx} className="option-wrapper">
                  <button
                    onClick={() => handleAnswer(option)}
                    className={`quiz-btn ${
                      selected === option
                        ? option === correctAnswer
                          ? "correct"
                          : "wrong"
                        : ""
                    }`}
                  >
                    {option}
                  </button>

                  {showHint && (
                    <p className="hint-text">
                      {quizType === "radical"
                        ? radicalHint
                        : readingHint || "—"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {selected && (
            <div>
              <p className="quiz-result">
                {selected === correctAnswer
                  ? "✅ Correct!"
                  : `❌ Wrong! The correct answer was ${correctAnswer}`}
              </p>
              <button
                className="save-btn"
                onClick={() => handleSave(currentUser, correctAnswer)}
              >
                💾 Save
              </button>
            </div>
          )}

          <button onClick={() => loadQuiz()} className="next-btn">
            Next Question
          </button>
        </div>
      </div>
    </div>
  );
}
