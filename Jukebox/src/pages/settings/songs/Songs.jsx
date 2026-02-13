import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useMatch, useLocation } from "react-router-dom";
import "@/pages/settings/songs/Songs.scss";
import SongTableView from "@/pages/settings/songs/SongTableView";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import DeleteModal from "@/components/Shared/DeleteModal";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import songService from "@/services/songService";
import artistService from "@/services/artistService";
import countryService from "@/services/countryService";
import useSuccessMessage from "@/hooks/useSuccessMessage";

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

const Songs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formRouteMatch = useMatch("/settings/songs/:action/*");

  const [successMessage, showSuccess] = useSuccessMessage();

  // Data
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState([]);
  const [countries, setCountries] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterArtist, setFilterArtist] = useState("all");
  const [filterDecade, setFilterDecade] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");

  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);

  // Debounce search term
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

  // Build dropdown options from fetched artists
  const artistFilterOptions = [
    { value: "all", label: "All Artists" },
    ...artists.map((a) => ({ value: String(a.artistId), label: a.name })),
  ];

  const artistFormOptions = artists.map((a) => ({
    value: String(a.artistId),
    label: a.name,
  }));

  // Build country filter options from fetched countries
  const countryFilterOptions = [
    { value: "all", label: "All Countries" },
    ...countries.map((c) => ({ value: c.countryCode || c.code, label: c.name || c.countryCode || c.code })),
  ];

  const countryFormOptions = countries.map((c) => ({
    value: c.countryCode || c.code,
    label: c.name || c.countryCode || c.code,
  }));

  // Fetch all songs from API (all filters server-side, handles pagination)
  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const baseParams = { PageSize: 100 };
      if (debouncedSearch) baseParams.Title = debouncedSearch;
      if (filterGenre !== "all") baseParams.Genre = filterGenre;
      if (filterArtist !== "all") baseParams.ArtistId = Number(filterArtist);
      if (filterCountry !== "all") baseParams.CountryCode = filterCountry;
      if (filterDecade !== "all") {
        baseParams.ReleaseYearFrom = Number(filterDecade);
        baseParams.ReleaseYearTo = Number(filterDecade) + 9;
      }

      // Fetch first page
      const firstPage = await songService.search({ ...baseParams, PageNumber: 1 });
      let allSongs = firstPage.items || [];
      const total = firstPage.totalItems || allSongs.length;

      // Fetch remaining pages if needed
      const totalPages = Math.ceil(total / 100);
      for (let page = 2; page <= totalPages; page++) {
        const nextPage = await songService.search({ ...baseParams, PageNumber: page });
        allSongs = [...allSongs, ...(nextPage.items || [])];
      }

      setSongs(allSongs);
    } catch (err) {
      console.error("Failed to fetch songs:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterGenre, filterArtist, filterCountry, filterDecade]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Infinite scroll for display
  const { displayCount, loadingMore, hasMore, loadMoreRef, resetDisplayCount } =
    useInfiniteScroll({ itemsPerPage: 30, totalItems: songs.length });

  const displayedSongs = songs.slice(0, displayCount);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    resetDisplayCount();
  };

  // CRUD
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
      await fetchSongs();
      navigate("/settings/songs");
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
        await fetchSongs();
      } catch (err) {
        console.error("Failed to delete song:", err);
      }
    }
    setIsDeleteDialogOpen(false);
    setSongToDelete(null);
  };

  const isFormActive = !!formRouteMatch;

  return (
    <div className="songs">
      {successMessage && <div className="success-toast">{successMessage}</div>}
      {!isFormActive && (
        <>
          <div className="songs__header">
            <div className="songs__header-left">
              <h3 className="settings-section-title">Songs Management</h3>
              <span className="badge-count">{songs.length} songs</span>
            </div>
            <div className="songs__header-right">
              <button className="btn-action btn-action--primary" onClick={handleAddNew}>
                + Add Song
              </button>
            </div>
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

      <div className={`crud-layout${isFormActive ? " crud-layout--form-active" : ""}`}>
        <div className="crud-layout__table">
          <SongTableView
            songs={displayedSongs}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            loadMoreRef={loadMoreRef}
            hasMore={hasMore}
            loadingMore={loadingMore}
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
