import api from "./api";

const playlistService = {
  search: async (params = {}) => {
    const response = await api.get("/playlist", { params });
    return response.data;
  },

  getMy: async () => {
    const response = await api.get("/playlist/my");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/playlist/${id}`);
    return response.data;
  },

  create: async (request) => {
    const response = await api.post("/playlist", request);
    return response.data;
  },

  generate: async (request) => {
    const response = await api.post("/playlist/generate", request);
    return response.data;
  },

  update: async (id, request) => {
    const response = await api.put(`/playlist/${id}`, request);
    return response.data;
  },

  addSong: async (playlistId, songId) => {
    const response = await api.post(`/playlist/${playlistId}/songs/${songId}`);
    return response.data;
  },

  removeSong: async (playlistId, songId) => {
    const response = await api.delete(`/playlist/${playlistId}/songs/${songId}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/playlist/${id}`);
    return response.data;
  },
};

export default playlistService;