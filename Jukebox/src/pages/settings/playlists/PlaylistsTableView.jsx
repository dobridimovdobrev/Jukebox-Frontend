const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatArtists = (artists) => {
  if (!artists || artists.length === 0) return "—";
  if (artists.length <= 2) {
    return artists.map((a) => a.artistName).join(", ");
  }
  return `${artists[0].artistName}, ${artists[1].artistName} +${artists.length - 2}`;
};

const PlaylistsTableView = ({
  playlists,
  onEdit,
  onDelete,
  loadMoreRef,
  hasMore,
  loadingMore,
}) => {
  return (
    <div className="table-container">
      <table className="table settings-table">
        <thead>
          <tr>
            <th className="col-number">#</th>
            <th style={{ width: "25%" }}>Name</th>
            <th style={{ width: "30%" }}>Artists</th>
            <th>Songs</th>
            <th>User</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {playlists.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No playlists found. Create one!
              </td>
            </tr>
          ) : (
            <>
              {playlists.map((playlist, index) => (
                <tr
                  key={playlist.id}
                  ref={index === playlists.length - 1 ? loadMoreRef : null}
                >
                  <td className="col-number">{index + 1}</td>
                  <td className="playlist-name-cell">{playlist.name}</td>
                  <td className="playlist-artists-cell">
                    {formatArtists(playlist.artists)}
                  </td>
                  <td>{playlist.songsCount}</td>
                  <td className="playlist-user-cell">{playlist.userName}</td>
                  <td className="playlist-date-cell">
                    {formatDate(playlist.createdAt)}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => onEdit(playlist)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-icon--danger"
                        onClick={() => onDelete(playlist)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loadingMore && hasMore && (
                <tr>
                  <td colSpan="7" className="text-center loading-more">
                    Loading...
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlaylistsTableView;
