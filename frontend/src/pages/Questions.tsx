import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  MessageCircle,
  Clock,
  Tag,
} from "lucide-react";
// @ts-ignore
import { questionAPI } from "../utils/api";
// @ts-ignore
import api from "../utils/api";

const Questions = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const categories = [
    "all",
    "javascript",
    "react",
    "python",
    "nodejs",
    "css",
    "typescript",
    "database",
    "api",
    "mobile",
  ];

  const fetchQuestions = async () => {
    try {
      const res = await questionAPI.getQuestions();
      setQuestions(res.data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleVote = async (questionId: number, type: "up" | "down") => {
    try {
      await api.post(`questions/${questionId}/vote/`, { type });
      await fetchQuestions();
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const filteredQuestions = questions
    .filter((q) => {
      const matchesSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.question_detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some((tag: any) =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" ||
        q.tags.some((tag: any) => tag.name === selectedCategory);

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "votes") {
        return (b.votes || 0) - (a.votes || 0);
      }
      if (sortBy === "answers") {
        return (b.answer_count || 0) - (a.answer_count || 0);
      }
      if (sortBy === "views") {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });

  if (loading)
    return <p className="p-8 text-gray-500 text-center">Loading questions...</p>;

  if (!questions.length)
    return <p className="p-8 text-gray-500 text-center">No questions found.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
            <p className="text-gray-600 mt-2">{filteredQuestions.length} questions found</p>
          </div>
          <Link
            to="/ask"
            className="inline-flex items-center mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90"
          >
            <Plus className="mr-2 h-5 w-5" />
            Ask Question
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedCategory === category
                      ? "bg-blue-100 text-blue-800 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="votes">Most Votes</option>
              <option value="answers">Most Answers</option>
              <option value="views">Most Views</option>
            </select>
          </div>
        </div>

        {/* Main Questions List */}
        <div className="flex-1 space-y-6">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
            >
              <div className="flex items-start space-x-4">
                {/* Votes */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <button onClick={() => handleVote(question.id, "up")}>
                    <ArrowUp className="h-5 w-5 text-gray-400 hover:text-green-600" />
                  </button>
                  <span className="text-lg font-semibold text-gray-700">{question.votes}</span>
                  <button onClick={() => handleVote(question.id, "down")}>
                    <ArrowDown className="h-5 w-5 text-gray-400 hover:text-red-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <Link
                      to={`/questions/${question.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {question.title}
                    </Link>
                    <span
                      className={`ml-3 px-2 py-1 text-xs rounded-full ${getDifficultyColor(
                        question.difficulty_level
                      )}`}
                    >
                      {question.difficulty_level}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-2 line-clamp-2">{question.question_detail}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {question.tags.map((tag: any, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mt-4 gap-4">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />{" "}
                      {question.answer_count || 0} answers
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {question.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />{" "}
                      {new Date(question.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Questions;
