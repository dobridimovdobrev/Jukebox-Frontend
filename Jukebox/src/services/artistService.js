import api from "./api";

const artistService = {
  search: async (params = {}) => {
    const response = await api.get("/artist", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/artist/${id}`);
    return response.data;
  },

  create: async (request) => {
    const response = await api.post("/artist", request);
    return response.data;
  },

  searchMusicBrainz: async (query) => {
    const response = await api.get("/artist/search-musicbrainz", {
      params: { query, limit: 10 },
    });
    return response.data;
  },

  importByMusicBrainzId: async (musicBrainzId) => {
    const response = await api.post("/artist/import-musicbrainz", {
      musicBrainzId,
    });
    return response.data;
  },

  import: async (artistName) => {
    const response = await api.post(
      `/artist/import/${encodeURIComponent(artistName)}`
    );
    return response.data;
  },

  update: async (id, request) => {
    const response = await api.put(`/artist/${id}`, request);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/artist/${id}`);
    return response.data;
  },
};

export default artistService;