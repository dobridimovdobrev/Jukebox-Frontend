import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useMatch } from "react-router-dom";
import "@/pages/settings/playlists/Playlists.scss";
import PlaylistsTableView from "@/pages/settings/playlists/PlaylistsTableView";
import DeleteModal from "@/components/Shared/DeleteModal";
import playlistService from "@/services/playlistService";
import artistService from "@/services/artistService";
import useSuccessMessage from "@/hooks/useSuccessMessage";

const PAGE_SIZE = 30;
const ADMIN_ROLES = ["SuperAdmin"];

const Playlists = () => {
  const navigate = useNavigate();
  const formRouteMatch = useMatch("/settings/playlists/:action/*");
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r));

  const [successMessage, showSuccess] = useSuccessMessage();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [artists, setArtists] = useState([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  const observerRef = useRef(null);

  // playlist search from backend
  const fetchPlaylists = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      if (isAdmin) {
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
      } else {
        const data = await playlistService.getMy();
        setPlaylists(Array.isArray(data) ? data : data.items || []);
        setHasMore(false);
        setTotalItems(Array.isArray(data) ? data.length : (data.items || []).length);
      }
    } catch (error) {
      console.error("Fetch playlists error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, isAdmin]);

  useEffect(() => {
    fetchPlaylists(1, false);
  }, [fetchPlaylists]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchArtists = async () => {
      try {
        const data = await artistService.search({ PageSize: 100 });
        setArtists(data.items || []);
      } catch (err) {
        console.error("Failed to fetch artists:", err);
      }
    };
    fetchArtists();
  }, [isAdmin]);

  const artistOptions = artists.map((a) => ({
    value: a.artistId,
    label: a.name,
    careerStart: a.careerStart,
    careerEnd: a.careerEnd,
  }));

  // infinite scroll
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

  // searching playlist filters
  const displayedPlaylists = !isAdmin && searchTerm
    ? playlists.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : playlists;

  const handleAddNew = () => navigate("create");
  const handleEdit = (playlist) => navigate(`update/${playlist.playlistId}`);

  const handleSave = async (playlistData, playlistId) => {
    try {
      if (playlistId) {
        await playlistService.update(playlistId, playlistData);
        showSuccess("Playlist updated successfully!");
      } else {
        await playlistService.create(playlistData);
        showSuccess("Playlist created successfully!");
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

  const isFormActive = !!formRouteMatch;

  // block direct url for standard users
  useEffect(() => {
    if (isFormActive && !isAdmin) navigate("/settings/playlists", { replace: true });
  }, [isFormActive, isAdmin, navigate]);

  if (isFormActive && isAdmin) {
    return (
      <div className="playlists">
        <Outlet context={{ playlists, artists: artistOptions, onSave: handleSave, onCancel: handleCancelForm }} />
      </div>
    );
  }

  return (
    <div className="playlists">
      {successMessage && <div className="success-toast">{successMessage}</div>}
      <div className="playlists__header">
        <div className="playlists__header-left">
          <h3 className="settings-section-title">Playlists Management</h3>
          <span className="badge-count">
            {isAdmin ? totalItems : displayedPlaylists.length} playlists
          </span>
        </div>
        {isAdmin && (
          <div className="playlists__header-right">
            <button className="btn-action btn-action--primary" onClick={handleAddNew}>
              + Add Playlist
            </button>
          </div>
        )}
      </div>
        {/* playlist filters */}
      <div className="playlists__filters">
        <input
          type="text"
          className="form-control settings-search"
          placeholder="Search playlists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
        {/* playlist table view */}
      <PlaylistsTableView
        playlists={displayedPlaylists}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        loadMoreRef={loadMoreRef}
        hasMore={hasMore}
        loadingMore={loadingMore}
        loading={loading}
        isAdmin={isAdmin}
      />
      {/* delete playlist modal */}
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
