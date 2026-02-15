import api from "./api";
// real statistics for superadmin role in the dashboard page of settings/backoffice
const dashboardService = {
  getStats: async () => {
    try {
      const params = { pageSize: 1 };
      const [artists, songs, playlists, quizzes, users] = await Promise.all([
        api.get("/artist", { params }),
        api.get("/song", { params }),
        api.get("/playlist", { params }),
        api.get("/quiz", { params }),
        api.get("/user", { params }),
      ]);

      return {
        totalArtists: artists.data.totalItems || 0,
        totalSongs: songs.data.totalItems || 0,
        totalPlaylists: playlists.data.totalItems || 0,
        totalQuizzes: quizzes.data.totalItems || 0,
        totalUsers: users.data.totalItems || 0,
      };
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return {
        totalArtists: 0,
        totalSongs: 0,
        totalPlaylists: 0,
        totalQuizzes: 0,
        totalUsers: 0,
      };
    }
  },
};

export default dashboardService;