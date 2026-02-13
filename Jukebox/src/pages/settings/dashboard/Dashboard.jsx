import { useState, useEffect } from "react";
import "@/pages/settings/dashboard/Dashboard.scss";
import dashboardService from "@/services/dashboardService";
import playlistService from "@/services/playlistService";

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentPlaylists, setRecentPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [dashStats, playlistData] = await Promise.all([
          dashboardService.getStats(),
          playlistService.search({ pageNumber: 1, pageSize: 10 }),
        ]);

        setStats([
          { label: "Artists", value: dashStats.artists },
          { label: "Total Songs", value: dashStats.songs },
          { label: "Playlists", value: dashStats.playlists },
          { label: "Quiz Questions", value: dashStats.quizzes },
          { label: "Users", value: dashStats.users },
        ]);

        setRecentPlaylists(playlistData.items || []);
      } catch (error) {
        console.error("Dashboard load error:", error);
        setStats([
          { label: "Artists", value: "—" },
          { label: "Total Songs", value: "—" },
          { label: "Playlists", value: "—" },
          { label: "Quiz Questions", value: "—" },
          { label: "Users", value: "—" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard__stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <span className="stat-card__value">
              {loading ? "..." : stat.value}
            </span>
            <span className="stat-card__label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard__table-section">
        <h3 className="settings-section-title mb-2">Recent Playlists</h3>
        <div className="table-container">
          <table className="table settings-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Songs</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {recentPlaylists.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    {loading ? "Loading..." : "No playlists yet."}
                  </td>
                </tr>
              ) : (
                recentPlaylists.map((playlist) => (
                  <tr key={playlist.playlistId}>
                    <td>{playlist.name}</td>
                    <td>{playlist.category || "—"}</td>
                    <td>{playlist.songsCount || 0}</td>
                    <td>{playlist.userFullName || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;