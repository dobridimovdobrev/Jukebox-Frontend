import api from "./api";

const quizService = {
  search: async (params = {}) => {
    const response = await api.get("/quiz", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/quiz/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get("/quiz/categories");
    return response.data;
  },

  getRandom: async (category, difficulty, count = 10) => {
    const response = await api.get("/quiz/random", {
      params: { category, difficulty, count },
    });
    return response.data;
  },

  create: async (request) => {
    const response = await api.post("/quiz", request);
    return response.data;
  },

  update: async (id, request) => {
    const response = await api.put(`/quiz/${id}`, request);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/quiz/${id}`);
    return response.data;
  },
};

export default quizService;