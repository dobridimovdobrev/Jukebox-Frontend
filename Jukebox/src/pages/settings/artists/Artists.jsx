import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useMatch, useLocation } from "react-router-dom";
import "@/pages/settings/artists/Artists.scss";
import ArtistTableView from "@/pages/settings/artists/ArtistTableView";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import DeleteModal from "@/components/Shared/DeleteModal";
import artistService from "@/services/artistService";
import countryService from "@/services/countryService";
import useSuccessMessage from "@/hooks/useSuccessMessage";

const GENRE_FILTER_OPTIONS = [
  { value: "all", label: "All Genres" },
  { value: "Pop", label: "Pop" },
  { value: "Rock", label: "Rock" },
  { value: "R&B", label: "R&B" },
  { value: "Jazz", label: "Jazz" },
  { value: "Electronic", label: "Electronic" },
  { value: "Hip Hop", label: "Hip Hop" },
  { value: "Soul", label: "Soul" },
  { value: "Funk", label: "Funk" },
  { value: "Disco", label: "Disco" },
  { value: "Reggae", label: "Reggae" },
  { value: "Blues", label: "Blues" },
  { value: "Metal", label: "Metal" },
  { value: "Alternative", label: "Alternative" },
];

const ADMIN_ROLES = ["SuperAdmin"];

const Artists = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formRouteMatch = useMatch("/settings/artists/:action/*");
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r));

  const [successMessage, showSuccess] = useSuccessMessage();

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [countries, setCountries] = useState([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState(null);

  // import artist state
  const [showImport, setShowImport] = useState(false);
  const [importQuery, setImportQuery] = useState("");
  const [importResults, setImportResults] = useState([]);
  const [importSearching, setImportSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const importTimer = useRef(null);

  // fetch artists from backend
  const fetchArtists = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const params = {
        pageNumber: pageNum,
        pageSize: 30,
      };
      if (searchTerm) params.name = searchTerm;
      if (filterGenre !== "all") params.genre = filterGenre;
      if (filterCountry !== "all") params.countryCode = filterCountry;

      const data = await artistService.search(params);

      if (append) {
        setArtists((prev) => [...prev, ...data.items]);
      } else {
        setArtists(data.items);
      }
      setTotalItems(data.totalItems);
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Fetch artists error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterGenre, filterCountry]);

  // fetch on mount and when filters change
  useEffect(() => {
    fetchArtists(1, false);
  }, [fetchArtists]);

  // fetch countries on mount
  useEffect(() => {
    countryService
      .getAll()
      .then((data) => setCountries(data || []))
      .catch(() => {});
  }, []);

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (importTimer.current) clearTimeout(importTimer.current);
    };
  }, []);

  // load more for infinite scroll
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchArtists(page + 1, true);
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
  };

  // import: debounced search on MusicBrainz
  const handleImportSearchChange = (value) => {
    setImportQuery(value);
    setImportError("");
    setImportSuccess("");

    if (importTimer.current) clearTimeout(importTimer.current);

    if (value.trim().length < 2) {
      setImportResults([]);
      return;
    }

    setImportSearching(true);
    importTimer.current = setTimeout(async () => {
      try {
        const data = await artistService.searchMusicBrainz(value.trim());
        const items = Array.isArray(data) ? data : data.items || [];
        setImportResults(items);
      } catch {
        setImportResults([]);
      } finally {
        setImportSearching(false);
      }
    }, 400);
  };

  // import: select artist from dropdown
  const handleImportSelect = async (result) => {
    try {
      setImporting(true);
      setImportError("");
      setImportSuccess("");

      if (result.artistId) {
        // Already in DB
        setImportSuccess(`"${result.name}" is already in the database`);
      } else {
        // Import from MusicBrainz
        await artistService.importByMusicBrainzId(result.musicBrainzId);
        setImportSuccess(`"${result.name}" imported successfully!`);
        fetchArtists(1, false);
      }

      setImportQuery("");
      setImportResults([]);
    } catch (error) {
      setImportError(error.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // crud
  const handleAddNew = () => {
    navigate("create");
  };

  const handleEdit = (artist) => {
    navigate(`update/${artist.artistId}`);
  };

  const handleSave = async (formData, artistId) => {
    try {
      const payload = {
        ...formData,
        careerStart: formData.careerStart || null,
        careerEnd: formData.careerEnd || null,
        youtubeChannelId: formData.youtubeChannelId || null,
        musicBrainzId: formData.musicBrainzId || null,
        isrcCode: formData.isrcCode || null,
        photo: formData.photo || "default.jpg",
      };

      if (artistId) {
        await artistService.update(artistId, payload);
        showSuccess("Artist updated successfully!");
      } else {
        await artistService.create(payload);
        showSuccess("Artist created successfully!");
      }
      navigate("/settings/artists");
      fetchArtists(1, false);
    } catch (error) {
      console.error("Save artist error:", error);
    }
  };

  const handleCancelForm = () => {
    navigate("/settings/artists");
  };

  const handleDeleteClick = (artist) => {
    setArtistToDelete(artist);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (artistToDelete) {
      try {
        await artistService.delete(artistToDelete.artistId);
        fetchArtists(1, false);
      } catch (error) {
        console.error("Delete artist error:", error);
      }
    }
    setIsDeleteDialogOpen(false);
    setArtistToDelete(null);
  };

  const handleToggleActive = async (artistId) => {
    const artist = artists.find((a) => a.artistId === artistId);
    if (!artist) return;
    try {
      await artistService.update(artistId, { isActive: !artist.isActive });
      setArtists(
        artists.map((a) =>
          a.artistId === artistId ? { ...a, isActive: !a.isActive } : a
        )
      );
    } catch (error) {
      console.error("Toggle active error:", error);
    }
  };

  const isFormActive = !!formRouteMatch;

  // Block direct URL access to form routes for non-admin users
  useEffect(() => {
    if (isFormActive && !isAdmin) navigate("/settings/artists", { replace: true });
  }, [isFormActive, isAdmin, navigate]);

  return (
    <div className="artists">
      {successMessage && <div className="success-toast">{successMessage}</div>}
      {!isFormActive && (
        <>
          <div className="artists__header">
            <div className="artists__header-left">
              <h3 className="settings-section-title">Artists Management</h3>
              <span className="badge-count">{totalItems} artists</span>
            </div>
            {isAdmin && (
              <div className="artists__header-right">
                <button
                  className="btn-action btn-action--secondary"
                  onClick={() => {
                    setShowImport(!showImport);
                    setImportQuery("");
                    setImportResults([]);
                    setImportError("");
                    setImportSuccess("");
                  }}
                >
                  ↓ Import
                </button>
                <button className="btn-action btn-action--primary" onClick={handleAddNew}>
                  + Add Artist
                </button>
              </div>
            )}
          </div>

          {isAdmin && showImport && (
            <div className="artists__import">
              <div className="artists__import-search">
                <input
                  type="text"
                  className="form-control settings-search"
                  placeholder="Search MusicBrainz..."
                  value={importQuery}
                  onChange={(e) => handleImportSearchChange(e.target.value)}
                />
                {importSearching && <span className="artists__import-spinner" />}
              </div>
              {importResults.length > 0 && (
                <div className="artists__import-results">
                  {importResults.map((r) => (
                    <div
                      key={r.musicBrainzId || r.artistId}
                      className="artists__import-item"
                      onClick={() => handleImportSelect(r)}
                    >
                      <span>{r.name}</span>
                      {r.genre && <span className="artists__import-genre">{r.genre}</span>}
                      {r.artistId && <span className="artists__import-badge">In DB</span>}
                    </div>
                  ))}
                </div>
              )}
              {importError && <span className="artists__import-error">{importError}</span>}
              {importSuccess && <span className="artists__import-success">{importSuccess}</span>}
              {importing && <span className="artists__import-loading">Importing...</span>}
            </div>
          )}

          <div className="artists__filters">
            <input
              type="text"
              className="form-control settings-search"
              placeholder="Search artists..."
              value={searchTerm}
              onChange={handleFilterChange(setSearchTerm)}
            />
            <CustomDropdownSelect
              value={filterGenre}
              onChange={handleFilterChange(setFilterGenre)}
              options={GENRE_FILTER_OPTIONS}
            />
            <CustomDropdownSelect
              value={filterCountry}
              onChange={handleFilterChange(setFilterCountry)}
              options={[
                { value: "all", label: "All Countries" },
                ...countries.map((c) => ({ value: c.countryCode || c.code, label: c.name || c.countryCode || c.code })),
              ]}
              searchable
            />
          </div>
        </>
      )}

      <div className={`crud-layout${isFormActive ? " crud-layout--form-active" : ""}`}>
        <div className="crud-layout__table">
          <ArtistTableView
            artists={artists}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onToggleActive={handleToggleActive}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loading}
            isAdmin={isAdmin}
          />
        </div>
        <div className="crud-layout__form">
          <button className="crud-layout__back" onClick={handleCancelForm}>
            ← Back to List
          </button>
          <Outlet key={location.pathname} context={{ artists, countryOptions: countries.map((c) => ({ value: c.countryCode || c.code, label: c.name || c.countryCode || c.code })), onSave: handleSave, onCancel: handleCancelForm }} />
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemLabel="artist"
        itemPreview={artistToDelete?.name}
      />
    </div>
  );
};

export default Artists;