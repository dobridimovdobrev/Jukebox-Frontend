import api from "./api";

const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  register: async (request) => {
    const response = await api.post("/auth/register", request);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default authService;