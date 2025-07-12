import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// @ts-ignore
import { questionAPI } from "../utils/api";

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchQuestion = async () => {
    try {
      const res = await questionAPI.getQuestionById(id);
      setQuestion(res.data);
    } catch (error) {
      console.error("Failed to fetch question:", error);
    }
  };

  const fetchAnswers = async () => {
    try {
      const res = await questionAPI.getAnswers(id);
      setAnswers(res.data);
    } catch (error) {
      console.error("Failed to fetch answers:", error);
    }
  };

  const incrementViews = async () => {
    try {
      await questionAPI.incrementView(id);
    } catch (error) {
      console.error("Failed to increment view:", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await incrementViews();
      await fetchQuestion();
      await fetchAnswers();
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      await questionAPI.postAnswer(id, { content: newAnswer });
      setNewAnswer("");
      await fetchAnswers();
    } catch (error) {
      console.error("Failed to post answer:", error);
      alert("Failed to post answer");
    }
  };

  if (loading) return <p className="p-8 text-gray-500">Loading question...</p>;
  if (!question) return <p className="p-8 text-red-500">Question not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
      <p className="mb-6 text-gray-700 whitespace-pre-wrap">{question.question_detail}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {question.tags.map((tag: any, index: number) => (
          <span
            key={index}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
          >
            {tag.name}
          </span>
        ))}
      </div>

      <p className="text-gray-500 mb-8">Asked by: {question.author}</p>

      <h2 className="text-xl font-semibold mb-4">{answers.length} Answers</h2>

      {answers.map((ans) => (
        <div key={ans.id} className="mb-6 p-4 border rounded">
          <p className="mb-2 whitespace-pre-wrap">{ans.content}</p>
          <p className="text-sm text-gray-500">Answered by: {ans.author.username}</p>
        </div>
      ))}

      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3">Your Answer</h3>
        <form onSubmit={handleSubmitAnswer} className="space-y-4">
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows={5}
            className="w-full p-3 border rounded"
            placeholder="Write your answer here..."
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Answer
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionDetail;
