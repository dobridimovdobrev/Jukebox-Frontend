import { useSelector, useDispatch } from "react-redux";
import { setSongs, setActivePlaylist, playSong } from "@/redux/playerSlice";
import playlistService from "@/services/playlistService";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

const PlaylistPanel = ({ isActive, onClose }) => {
  const dispatch = useDispatch();
  const playlists = useSelector((s) => s.player.playlists);
  const activePlaylistId = useSelector((s) => s.player.activePlaylistId);

  const { displayCount, loadingMore, loadMoreRef } = useInfiniteScroll({
    itemsPerPage: 20,
    totalItems: playlists.length,
  });

  const visiblePlaylists = playlists.slice(0, displayCount);

  const handlePlaylistClick = async (playlist) => {
    if (playlist.playlistId === activePlaylistId) return;
    try {
      const full = await playlistService.getById(playlist.playlistId);
      const songs = [...(full.songs || [])].sort((a, b) => a.order - b.order);
      dispatch(setSongs(songs));
      dispatch(setActivePlaylist(playlist.playlistId));

      // Auto-play first song (same pattern as Artist click)
      if (songs.length > 0) {
        dispatch(playSong({ song: songs[0], index: 0 }));
      }
    } catch (err) {
      console.error("Failed to load playlist:", err);
    }
  };

  return (
    <div
      className={`playlist-panel ${isActive ? "playlist-panel--active" : ""}`}
    >
      <div className="playlist-panel__content">
        <button
          className="playlist-panel__close"
          onClick={onClose}
          aria-label="Close playlist panel"
        >
          &times;
        </button>

        <h3 className="playlist-panel__title">My Playlists</h3>

        {playlists.length === 0 ? (
          <p className="playlist-panel__empty">
            No playlists yet. Generate one from the wizard!
          </p>
        ) : (
          <div className="playlist-panel__table-container">
            <table className="playlist-panel__table">
              <thead>
                <tr>
                  <th className="playlist-panel__col-number">#</th>
                  <th>Name</th>
                  <th className="playlist-panel__col-songs">Songs</th>
                </tr>
              </thead>
              <tbody>
                {visiblePlaylists.map((pl, i) => (
                  <tr
                    key={pl.playlistId}
                    className={
                      pl.playlistId === activePlaylistId
                        ? "playlist-panel__row--active"
                        : ""
                    }
                    onClick={() => handlePlaylistClick(pl)}
                    ref={i === visiblePlaylists.length - 1 ? loadMoreRef : null}
                  >
                    <td className="playlist-panel__col-number">{i + 1}</td>
                    <td>{pl.name}</td>
                    <td className="playlist-panel__col-songs">
                      {pl.songsCount || 0}
                    </td>
                  </tr>
                ))}
                {loadingMore && (
                  <tr>
                    <td colSpan="3" className="playlist-panel__loading">
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPanel;
