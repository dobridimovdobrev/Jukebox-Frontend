import api from "./api";

const countryService = {
  getAll: async () => {
    const response = await api.get("/country");
    return response.data;
  },
};

export default countryService;
