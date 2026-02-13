import api from "./api";

const userService = {
  search: async (params = {}) => {
    const response = await api.get("/user", { params });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },

  updateProfile: async (request) => {
    const response = await api.put("/user/profile", request);
    return response.data;
  },

  // admin: update any user by id
  update: async (id, request) => {
    const response = await api.put(`/user/${id}`, request);
    return response.data;
  },

  deactivate: async (id) => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  },

  toggleActive: async (id) => {
    const response = await api.patch(`/user/${id}/toggle-active`);
    return response.data;
  },

  spendCoins: async (amount = 1) => {
    const response = await api.post("/user/spend-coins", null, {
      params: { amount },
    });
    return response.data;
  },
};

export default userService;
