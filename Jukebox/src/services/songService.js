import api from "./api";

const songService = {
  search: async (params = {}) => {
    const response = await api.get("/song", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/song/${id}`);
    return response.data;
  },

  getByArtist: async (artistId, params = {}) => {
    const response = await api.get("/song", {
      params: { ...params, ArtistId: artistId },
    });
    return response.data;
  },

  create: async (request) => {
    const response = await api.post("/song", request);
    return response.data;
  },

  update: async (id, request) => {
    const response = await api.put(`/song/${id}`, request);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/song/${id}`);
    return response.data;
  },

  incrementPlayCount: async (id) => {
    const response = await api.post(`/song/${id}/play`);
    return response.data;
  },
};

export default songService;