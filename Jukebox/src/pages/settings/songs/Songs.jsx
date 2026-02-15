import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useMatch, useLocation } from "react-router-dom";
import "@/pages/settings/songs/Songs.scss";
import SongTableView from "@/pages/settings/songs/SongTableView";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import DeleteModal from "@/components/Shared/DeleteModal";
import songService from "@/services/songService";
import artistService from "@/services/artistService";
import countryService from "@/services/countryService";
import useSuccessMessage from "@/hooks/useSuccessMessage";
// i will improve this from back end in the future
const GENRE_FILTER_OPTIONS = [
  { value: "all", label: "All Genres" },
  { value: "Pop", label: "Pop" },
  { value: "Rock", label: "Rock" },
  { value: "R&B", label: "R&B" },
  { value: "Soul", label: "Soul" },
  { value: "Funk", label: "Funk" },
  { value: "Disco", label: "Disco" },
  { value: "Reggae", label: "Reggae" },
  { value: "Alternative", label: "Alternative" },
];
// i will improve this from back end in the future
const DECADE_FILTER_OPTIONS = [
  { value: "all", label: "All Years" },
  { value: "1950", label: "1950–1959" },
  { value: "1960", label: "1960–1969" },
  { value: "1970", label: "1970–1979" },
  { value: "1980", label: "1980–1989" },
  { value: "1990", label: "1990–1999" },
  { value: "2000", label: "2000–2009" },
  { value: "2010", label: "2010–2019" },
  { value: "2020", label: "2020–2029" },
];

const PAGE_SIZE = 30;

const ADMIN_ROLES = ["SuperAdmin"];

const Songs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formRouteMatch = useMatch("/settings/songs/:action/*");
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r));

  const [successMessage, showSuccess] = useSuccessMessage();

  // song data
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [artists, setArtists] = useState([]);
  const [countries, setCountries] = useState([]);

  // song filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterArtist, setFilterArtist] = useState("all");
  const [filterDecade, setFilterDecade] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");

  // delete modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);

  const observerRef = useRef(null);

  // search temr
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch artists + countries for filter + form dropdowns
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await artistService.search({ PageSize: 100 });
        setArtists(data.items || []);
      } catch (err) {
        console.error("Failed to fetch artists:", err);
      }
    };
    const fetchCountries = async () => {
      try {
        const data = await countryService.getAll();
        setCountries(data || []);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    };
    fetchArtists();
    fetchCountries();
  }, []);

  // Build dropdown options
  const artistFilterOptions = [
    { value: "all", label: "All Artists" },
    ...artists.map((a) => ({ value: String(a.artistId), label: a.name })),
  ];

  const artistFormOptions = artists.map((a) => ({
    value: String(a.artistId),
    label: a.name,
  }));

  // Build country filter 
  const countryFilterOptions = [
    { value: "all", label: "All Countries" },
    ...countries.map((c) => ({ value: c.countryCode || c.code, label: c.name || c.countryCode || c.code })),
  ];

  const countryFormOptions = countries.map((c) => ({
    value: c.countryCode || c.code,
    label: c.name || c.countryCode || c.code,
  }));

  // Fetch songs with backend pagination
  const fetchSongs = useCallback(
    async (page = 1, append = false) => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const params = { PageNumber: page, PageSize: PAGE_SIZE };
        if (debouncedSearch) params.Title = debouncedSearch;
        if (filterGenre !== "all") params.Genre = filterGenre;
        if (filterArtist !== "all") params.ArtistId = Number(filterArtist);
        if (filterCountry !== "all") params.CountryCode = filterCountry;
        if (filterDecade !== "all") {
          params.ReleaseYearFrom = Number(filterDecade);
          params.ReleaseYearTo = Number(filterDecade) + 9;
        }

        const data = await songService.search(params);

        if (append) {
          setSongs((prev) => [...prev, ...data.items]);
        } else {
          setSongs(data.items || []);
        }
        setTotalItems(data.totalItems);
        setHasMore(data.hasNextPage);
        setPageNumber(page);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, filterGenre, filterArtist, filterCountry, filterDecade],
  );

  useEffect(() => {
    fetchSongs(1, false);
  }, [fetchSongs]);

  // IntersectionObserver for infinite scroll with lazy loading using my hook 
  const loadMoreRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchSongs(pageNumber + 1, true);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [hasMore, loadingMore, pageNumber, fetchSongs],
  );

  const handleFilterChange = (setter) => (e) => setter(e.target.value);

  // CRUD operations  
  const handleAddNew = () => navigate("create");

  const handleEdit = (song) => navigate(`update/${song.songId}`);

  const handleSave = async (songData, songId) => {
    try {
      if (songId) {
        await songService.update(songId, songData);
        showSuccess("Song updated successfully!");
      } else {
        await songService.create(songData);
        showSuccess("Song created successfully!");
      }
      navigate("/settings/songs");
      fetchSongs(1, false);
    } catch (err) {
      console.error("Failed to save song:", err);
    }
  };

  const handleCancelForm = () => navigate("/settings/songs");

  const handleDeleteClick = (song) => {
    setSongToDelete(song);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (songToDelete) {
      try {
        await songService.delete(songToDelete.songId);
        fetchSongs(1, false);
      } catch (err) {
        console.error("Failed to delete song:", err);
      }
    }
    setIsDeleteDialogOpen(false);
    setSongToDelete(null);
  };

  const isFormActive = !!formRouteMatch;

  /* block direct url access for standard users i need to improve this
  from my SiBackendless, i don't want to give access to all info of my songs to users for now */
  useEffect(() => {
    if (isFormActive && !isAdmin) navigate("/settings/songs", { replace: true });
  }, [isFormActive, isAdmin, navigate]);

  return (
    <div className="songs">
      {successMessage && <div className="success-toast">{successMessage}</div>}
      {!isFormActive && (
        <>
          <div className="songs__header">
            <div className="songs__header-left">
              <h3 className="settings-section-title">Songs Management</h3>
              <span className="badge-count">{totalItems} songs</span>
            </div>
            {isAdmin && (
              <div className="songs__header-right">
                <button className="btn-action btn-action--primary" onClick={handleAddNew}>
                  + Add Song
                </button>
              </div>
            )}
          </div>

          <div className="songs__filters">
            <input
              type="text"
              className="form-control settings-search"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={handleFilterChange(setSearchTerm)}
            />
            <CustomDropdownSelect
              value={filterGenre}
              onChange={handleFilterChange(setFilterGenre)}
              options={GENRE_FILTER_OPTIONS}
            />
            <CustomDropdownSelect
              value={filterDecade}
              onChange={handleFilterChange(setFilterDecade)}
              options={DECADE_FILTER_OPTIONS}
            />
            <CustomDropdownSelect
              value={filterCountry}
              onChange={handleFilterChange(setFilterCountry)}
              options={countryFilterOptions}
              searchable
            />
            <CustomDropdownSelect
              value={filterArtist}
              onChange={handleFilterChange(setFilterArtist)}
              options={artistFilterOptions}
              searchable
            />
          </div>
        </>
      )}
        {/* crud operations */}
      <div className={`crud-layout${isFormActive ? " crud-layout--form-active" : ""}`}>
        <div className="crud-layout__table">
          <SongTableView
            songs={songs}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            loadMoreRef={loadMoreRef}
            hasMore={hasMore}
            loadingMore={loadingMore}
            isAdmin={isAdmin}
          />
        </div>
        <div className="crud-layout__form">
          <button className="crud-layout__back" onClick={handleCancelForm}>
            ← Back to List
          </button>
          <Outlet
            key={location.pathname}
            context={{ songs, artistOptions: artistFormOptions, countryOptions: countryFormOptions, onSave: handleSave, onCancel: handleCancelForm }}
          />
        </div>
      </div>
        {/* delete modal */}
      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemLabel="song"
        itemPreview={songToDelete?.title}
      />
    </div>
  );
};

export default Songs;
