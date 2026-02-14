import { useRef, useEffect } from "react";

const formatCareer = (start, end) => {
  if (!start) return "—";
  return end ? `${start} – ${end}` : `${start} – present`;
};

const ArtistTableView = ({
  artists,
  onEdit,
  onDelete,
  onToggleActive,
  onLoadMore,
  hasMore,
  loading,
}) => {
  const loadMoreRef = useRef(null);

  // infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="table-container">
      <table className="table settings-table">
        <thead>
          <tr>
            <th className="col-number">#</th>
            <th style={{ width: "44px" }}>Photo</th>
            <th>Name</th>
            <th>Genre</th>
            <th>Songs</th>
            <th>Played</th>
            <th>Career</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {artists.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                {loading ? "Loading..." : "No artists found. Add one manually or import."}
              </td>
            </tr>
          ) : (
            <>
              {artists.map((artist, index) => (
                <tr key={artist.artistId}>
                  <td className="col-number">{index + 1}</td>
                  <td>
                    {artist.photo && artist.photo !== "default.jpg" ? (
                      <img
                        className="artist-photo"
                        src={artist.photo}
                        alt={artist.name}
                      />
                    ) : (
                      <span className="artist-photo artist-photo--placeholder">
                        🎤
                      </span>
                    )}
                  </td>
                  <td>{artist.name}</td>
                  <td>{artist.genre || "—"}</td>
                  <td>{artist.songsCount || 0}</td>
                  <td>{artist.totalPlayed || 0}</td>
                  <td className="artist-career">
                    {formatCareer(artist.careerStart, artist.careerEnd)}
                  </td>
                  <td>{artist.countryCode || "—"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon btn-icon--success"
                        onClick={() => onToggleActive(artist.artistId)}
                        title={artist.isActive ? "Deactivate" : "Activate"}
                      >
                        {artist.isActive ? "⏸" : "▶"}
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => onEdit(artist)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-icon--danger"
                        onClick={() => onDelete(artist)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* infinite scroll  */}
              {hasMore && (
                <tr ref={loadMoreRef}>
                  <td colSpan="9" className="text-center loading-more">
                    {loading ? "Loading..." : ""}
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

export default ArtistTableView;