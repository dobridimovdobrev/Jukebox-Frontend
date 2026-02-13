import api from "./api";

const dashboardService = {
  getStats: async () => {
    try {
      const [artists, songs, playlists, quizzes, users] = await Promise.all([
        api.get("/artist", { params: { pageSize: 1 } }),
        api.get("/song", { params: { pageSize: 1 } }),
        api.get("/playlist"),
        api.get("/quiz"),
        api.get("/user"),
      ]);

      return {
        totalArtists: artists.data.totalItems || artists.data.length || 0,
        totalSongs: songs.data.totalItems || songs.data.length || 0,
        totalPlaylists: Array.isArray(playlists.data) ? playlists.data.length : 0,
        totalQuizzes: Array.isArray(quizzes.data) ? quizzes.data.length : 0,
        totalUsers: Array.isArray(users.data) ? users.data.length : 0,
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