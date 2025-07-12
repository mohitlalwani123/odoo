import axios from "axios";

// Create main axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle global auth failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — redirecting to login");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ Auth API
export const authAPI = {
  register: (userData) => api.post("register/", userData),
  login: (credentials) => api.post("login/", credentials),
};

// ✅ Question + Answer API
export const questionAPI = {
  getQuestions: () => api.get("questions/"),
  createQuestion: (questionData) => api.post("questions/", questionData),
  getQuestionById: (id) => api.get(`questions/${id}/`),
  getAnswers: (questionId) => api.get(`questions/${questionId}/answers/`),
  postAnswer: (questionId, answerData) =>
    api.post(`questions/${questionId}/answers/`, answerData),
  incrementView: (id) => api.post(`questions/${id}/increment_view/`),

};

// ✅ Export main instance for any other use
export default api;
