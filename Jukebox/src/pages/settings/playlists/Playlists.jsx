import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, useNavigate, useMatch } from "react-router-dom";
import "@/pages/settings/playlists/Playlists.scss";
import PlaylistsTableView from "@/pages/settings/playlists/PlaylistsTableView";
import DeleteModal from "@/components/Shared/DeleteModal";
import playlistService from "@/services/playlistService";
import useSuccessMessage from "@/hooks/useSuccessMessage";

const PAGE_SIZE = 30;

const Playlists = () => {
  const navigate = useNavigate();
  const formRouteMatch = useMatch("/settings/playlists/:action/*");

  const [successMessage, showSuccess] = useSuccessMessage();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  const observerRef = useRef(null);

  const fetchPlaylists = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const params = { pageNumber: page, pageSize: PAGE_SIZE };
      if (searchTerm) params.name = searchTerm;

      const data = await playlistService.search(params);

      if (append) {
        setPlaylists((prev) => [...prev, ...data.items]);
      } else {
        setPlaylists(data.items || []);
      }
      setTotalItems(data.totalItems);
      setHasMore(data.hasNextPage);
      setPageNumber(page);
    } catch (error) {
      console.error("Fetch playlists error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPlaylists(1, false);
  }, [fetchPlaylists]);

  const loadMoreRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPlaylists(pageNumber + 1, true);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [hasMore, loadingMore, pageNumber, fetchPlaylists]
  );

  const handleAddNew = () => navigate("create");
  const handleEdit = (playlist) => navigate(`update/${playlist.playlistId}`);

  const handleSave = async (playlistData, playlistId) => {
    try {
      if (playlistId) {
        await playlistService.update(playlistId, playlistData);
        showSuccess("Playlist updated successfully!");
      } else {
        // new playlist → generate (imports songs from APIs)
        await playlistService.generate(playlistData);
        showSuccess("Playlist generated successfully!");
      }
      navigate("/settings/playlists");
      fetchPlaylists(1, false);
    } catch (error) {
      console.error("Save playlist error:", error);
    }
  };

  const handleCancelForm = () => navigate("/settings/playlists");

  const handleDeleteClick = (playlist) => {
    setPlaylistToDelete(playlist);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (playlistToDelete) {
      try {
        await playlistService.delete(playlistToDelete.playlistId);
        fetchPlaylists(1, false);
      } catch (error) {
        console.error("Delete playlist error:", error);
      }
    }
    setIsDeleteDialogOpen(false);
    setPlaylistToDelete(null);
  };

  const isChildActive = !!formRouteMatch;

  if (isChildActive) {
    return (
      <div className="playlists">
        <Outlet context={{ playlists, onSave: handleSave, onCancel: handleCancelForm }} />
      </div>
    );
  }

  return (
    <div className="playlists">
      {successMessage && <div className="success-toast">{successMessage}</div>}
      <div className="playlists__header">
        <div className="playlists__header-left">
          <h3 className="settings-section-title">Playlists Management</h3>
          <span className="badge-count">{totalItems} playlists</span>
        </div>
        <div className="playlists__header-right">
          <button className="btn-action btn-action--primary" onClick={handleAddNew}>
            + Generate Playlist
          </button>
        </div>
      </div>

      <div className="playlists__filters">
        <input
          type="text"
          className="form-control settings-search"
          placeholder="Search playlists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <PlaylistsTableView
        playlists={playlists}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        loadMoreRef={loadMoreRef}
        hasMore={hasMore}
        loadingMore={loadingMore}
        loading={loading}
      />

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemLabel="playlist"
        itemPreview={playlistToDelete?.name}
      />
    </div>
  );
};

export default Playlists;