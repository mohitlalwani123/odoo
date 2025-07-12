import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, X, Eye, Code, Bold, Italic, Link as LinkIcon, List
} from "lucide-react";
// @ts-ignore
import { questionAPI } from '../utils/api';

const AskQuestion = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    category: "",
    difficulty: "beginner",
  });

  const [currentTag, setCurrentTag] = useState("");
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = [
    "javascript", "react", "python", "nodejs", "css", "typescript",
    "database", "api", "mobile", "other"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const addTag = () => {
    const newTag = currentTag.trim().toLowerCase();
    if (newTag && !formData.tags.includes(newTag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    else if (formData.title.length < 10) newErrors.title = "Title must be at least 10 characters";

    if (!formData.content.trim()) newErrors.content = "Question content is required";
    else if (formData.content.length < 30) newErrors.content = "Content must be at least 30 characters";

    if (!formData.category) newErrors.category = "Please select a category";
    if (formData.tags.length === 0) newErrors.tags = "Add at least one tag";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      title: formData.title,
      question_detail: formData.content,
      category: formData.category,
      difficulty_level: formData.difficulty,
      tags: formData.tags.map(tag => ({ name: tag }))
    };

    try {
      await questionAPI.createQuestion(payload);
      alert("Question posted successfully!");
      navigate("/questions");
    } catch  (error: unknown) {
  if (error instanceof Error) {
    console.error("Failed to post question:", error.message);
  } else if (typeof error === 'object' && error !== null && 'response' in error) {
    console.error("Failed to post question:", (error as any).response.data);
  } else {
    console.error("An unknown error occurred.");
  }
  alert("Failed to post question.");
}
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = "";

    switch (syntax) {
      case "bold": replacement = `**${selectedText || "bold text"}**`; break;
      case "italic": replacement = `*${selectedText || "italic text"}*`; break;
      case "code": replacement = `\`${selectedText || "code"}\``; break;
      case "link": replacement = `[${selectedText || "link text"}](url)`; break;
      case "list": replacement = `\n- ${selectedText || "list item"}`; break;
      default: replacement = selectedText;
    }

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
          <p className="text-gray-600 mt-2">Get help from the community by asking a clear, detailed question</p>
        </div>

        {/* Ask Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-lg font-semibold mb-3">Question Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., How to implement authentication in React?"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Category & Difficulty */}
          <div className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold mb-3">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${errors.category ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                ))}
              </select>
              {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-lg font-semibold mb-3">Difficulty Level</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-lg font-semibold">Question Details *</label>
              <button type="button" onClick={() => setPreview(!preview)} className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded">
                <Eye className="h-4 w-4 mr-1" /> {preview ? "Edit" : "Preview"}
              </button>
            </div>

            {!preview ? (
              <>
                {/* Markdown Toolbar */}
                <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded border">
                  <button type="button" onClick={() => insertMarkdown("bold")} className="p-2 hover:bg-gray-200 rounded"><Bold className="h-4 w-4" /></button>
                  <button type="button" onClick={() => insertMarkdown("italic")} className="p-2 hover:bg-gray-200 rounded"><Italic className="h-4 w-4" /></button>
                  <button type="button" onClick={() => insertMarkdown("code")} className="p-2 hover:bg-gray-200 rounded"><Code className="h-4 w-4" /></button>
                  <button type="button" onClick={() => insertMarkdown("link")} className="p-2 hover:bg-gray-200 rounded"><LinkIcon className="h-4 w-4" /></button>
                  <button type="button" onClick={() => insertMarkdown("list")} className="p-2 hover:bg-gray-200 rounded"><List className="h-4 w-4" /></button>
                </div>

                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={10}
                  placeholder="Describe your problem, include what you've tried, code snippets, etc."
                  className={`w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 ${errors.content ? 'border-red-300' : 'border-gray-300'}`}
                />
              </>
            ) : (
              <div className="border p-4 rounded-lg bg-gray-50 min-h-[250px] whitespace-pre-wrap">
                {formData.content || <p className="text-gray-500">Nothing to preview...</p>}
              </div>
            )}
            {errors.content && <p className="mt-2 text-sm text-red-600">{errors.content}</p>}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-lg font-semibold mb-3">Tags * (up to 5)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-blue-600"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag (press Enter or comma)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2"
                disabled={formData.tags.length >= 5}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!currentTag.trim() || formData.tags.length >= 5}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {errors.tags && <p className="mt-2 text-sm text-red-600">{errors.tags}</p>}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate("/questions")} className="px-6 py-3 border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg">Post Question</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;
