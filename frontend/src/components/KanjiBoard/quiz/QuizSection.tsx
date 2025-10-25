import {PartLinkBoard} from "./PartLinkBoard";
import MultipleChoice from "./MultipleChoice";
import FillInBlank from "./FillInBlank";

export default function QuizSection({ currentUser, defaultQuiz }: { currentUser: any, defaultQuiz:string }) {

  const renderQuiz = () => {
    switch (defaultQuiz) {
      case "Part Link":
        return <PartLinkBoard currentUser={currentUser} />;
      case "Multiple Choice":
        return <MultipleChoice currentUser={currentUser} />;
      case "Fill in the blank":
        return <FillInBlank currentUser={currentUser} />;
      default:
        return null;
    }
  };

 return (
    <div className="quiz-section p-4">
      <div className="mt-6">{renderQuiz()}</div>
    </div>
  );
}