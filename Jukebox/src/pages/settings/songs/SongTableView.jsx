const cleanTitle = (title) => title.replace(/["()'\/]/g, "").replace(/\s+/g, " ").trim();

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const SongTableView = ({
  songs,
  loading,
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
            <th style={{ width: "30%" }}>Title</th>
            <th>Artist</th>
            <th>Duration</th>
            <th>Genre</th>
            <th>Year</th>
            <th>Country</th>
            <th>Played</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="text-center">
                Loading...
              </td>
            </tr>
          ) : songs.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No songs found.
              </td>
            </tr>
          ) : (
            <>
              {songs.map((song, index) => (
                <tr
                  key={song.songId}
                  ref={index === songs.length - 1 ? loadMoreRef : null}
                >
                  <td className="col-number">{index + 1}</td>
                  <td className="song-title-cell">
                    {cleanTitle(song.title).length > 40
                      ? `${cleanTitle(song.title).substring(0, 40)}...`
                      : cleanTitle(song.title)}
                  </td>
                  <td>{song.artistName}</td>
                  <td className="song-duration">
                    {formatDuration(song.duration)}
                  </td>
                  <td>{song.genre}</td>
                  <td>{song.releaseYear}</td>
                  <td>{song.countryCode}</td>
                  <td className="song-played">{song.songsPlayed || 0}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => onEdit(song)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-icon--danger"
                        onClick={() => onDelete(song)}
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
                  <td colSpan="9" className="text-center loading-more">
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

export default SongTableView;
