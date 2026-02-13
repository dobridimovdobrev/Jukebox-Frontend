import api from "./api";

const ticketService = {
  // superamin search all tickets
  search: async (params = {}) => {
    const response = await api.get("/ticket", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/ticket/${id}`);
    return response.data;
  },

  // user: get my tickets
  getMy: async () => {
    const response = await api.get("/ticket/my");
    return response.data;
  },

  // user: create ticket
  create: async (request) => {
    const response = await api.post("/ticket", request);
    return response.data;
  },

  // superamin response + status change
  addAction: async (id, request) => {
    const response = await api.post(`/ticket/${id}/action`, request);
    return response.data;
  },

  // superamin get valid transitions
  getTransitions: async (id) => {
    const response = await api.get(`/ticket/${id}/transitions`);
    return response.data;
  },

  update: async (id, request) => {
    const response = await api.put(`/ticket/${id}`, request);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/ticket/${id}`);
    return response.data;
  },
};

export default ticketService;