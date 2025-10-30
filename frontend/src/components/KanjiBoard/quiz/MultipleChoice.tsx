import { useEffect, useState } from "react";
import "./MultipleChoice.css"
import { fetchKanji, fetchMulQuiz } from "@/api/kanjiApi";
import { saveKanji } from "../utils/KanjiHandler";
import { ModalMessage } from "../ModalMessage";

type KanjiData = {
  kanji: string;
  meanings: string[];
  radical: {
    meaning: string;
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

export default function MultipleChoiceQuiz({currentUser} : {currentUser:any}) {
  const [quizItems, setQuizItems] = useState<KanjiData[]>([]);
  const [quizType, setQuizType] = useState<QuizType>("meaning");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ message: string; type: "success" | "error" } | null>(null);
  // Fetch 4 random Kanji
  useEffect(() => {
    async function loadQuiz() {
      try {
        const response = await fetchMulQuiz()
        if (response.quiz_items.length === 4) setupQuiz(response.quiz_items);
      } catch (error) {
        console.error("Error loading quiz:", error);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, []);

  // Setup quiz question
  const setupQuiz = (items: KanjiData[]) => {
    console.log("setting up")
    setSelected(null);
    setCorrectAnswer("");
    setQuestion("");
    setOptions([]);
    setQuizItems(items);

    // Randomly choose question type
    const types: QuizType[] = ["meaning", "radical", "reading"];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    setQuizType(chosenType);

    // Randomly pick one correct item
    const correctItem = items[Math.floor(Math.random() * items.length)];
    let questionText = "";
    let correct = "";

    // Generate question and options based on type
    if (chosenType === "meaning") {
      questionText = `Which kanji means "${correctItem.meanings[0]}"?`;
      correct = correctItem.kanji;
      setOptions(shuffle(items.map((i) => i.kanji)));
    } else if (chosenType === "radical") {
      questionText = `Which kanji has the radical meaning "${correctItem.radical.meaning}"?`;
      correct = correctItem.kanji;
      setOptions(shuffle(items.map((i) => i.kanji)));
    } else if (chosenType === "reading") {
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
  const handleSave = async (currentUser:any, kanji: string) => {
      const mainKanji = await fetchKanji(kanji);
      if (!currentUser || !mainKanji) return alert("You must log in to save progress.");
      const payload = {
        user_id: currentUser.id,
        kanji: {
          kanji: mainKanji.kanji,
          meaning: mainKanji.main_meanings?.[0] ?? "",
          reading: mainKanji.main_readings?.kun?.[0] ?? mainKanji.main_readings?.on?.[0] ?? "",
          parts: mainKanji.radical?.parts ?? [],
        },
      };
      saveKanji(payload, setModal)
  }
  const handleAnswer = (option: string) => {
    setSelected(option);
  };

  const shuffle = (arr: string[]) =>
    [...arr].sort(() => Math.random() - 0.5);

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
      <p className="quiz-question">{question}</p>

      <div className="quiz-options">
        {options.map((option, idx) => (
          <button
            key={idx}
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
        ))}
      </div>

      {selected && (
        <div>
        <p className="quiz-result">
          {selected === correctAnswer
            ? "✅ Correct!"
            : `❌ Wrong! The correct answer was ${correctAnswer}`}
        </p>
        <button onClick={()=>handleSave(currentUser, correctAnswer)}>Save</button>
        </div>
      )}

      <button
        onClick={() => setupQuiz(quizItems)}
        className="next-btn"
      >
        Next Question
      </button>
    </div>
  </div>
  </div>
)}