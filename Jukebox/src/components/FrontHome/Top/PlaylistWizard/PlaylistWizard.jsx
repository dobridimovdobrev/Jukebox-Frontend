import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoList } from "react-icons/io5";
import {
  pause,
  setSongs,
  setActivePlaylist,
  addPlaylist,
  setGenerating,
  appendSongs,
} from "@/redux/playerSlice";
import playlistService from "@/services/playlistService";
import artistService from "@/services/artistService";
import vinylBg from "@/assets/new-vinyl-background.webp";

const PlaylistWizard = ({ isActive, onClose, onViewPlaylists  }) => {
  const dispatch = useDispatch();
  const isPlaying = useSelector((s) => s.player.isPlaying);

  // wizzard steps state
  const [screen, setScreen] = useState("type");
  const [playlistType, setPlaylistType] = useState(null); // "individual" | "multiple"
  const [playlistName, setPlaylistName] = useState("");
  const [maxArtists, setMaxArtists] = useState(1);
  const [selectedArtists, setSelectedArtists] = useState([]);

  // artist search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // generation playlist state
  const [progress, setProgress] = useState(0);
  const [generatedPlaylist, setGeneratedPlaylist] = useState(null);
  const [error, setError] = useState(null);

  const animTimers = useRef([]);
  const searchTimer = useRef(null);

  // reset all state when wizzard start
  useEffect(() => {
    if (isActive) {
      setScreen("type");
      setPlaylistType(null);
      setPlaylistName("");
      setMaxArtists(1);
      setSelectedArtists([]);
      setSearchQuery("");
      setSearchResults([]);
      setProgress(0);
      setGeneratedPlaylist(null);
      setError(null);
    }
    return () => {
      animTimers.current.forEach(clearTimeout);
      animTimers.current = [];
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [isActive]);

  // artist search from api brainz music that i configure in backend
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const data = await artistService.searchMusicBrainz(value.trim());
        const items = Array.isArray(data) ? data : data.items || [];
        // exclude artists already selected
        const filtered = items.filter(
          (a) => !selectedArtists.some((s) => s.artistId === a.artistId)
        );
        setSearchResults(filtered);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

   const handleSelectArtist = async (artist) => {
    if (selectedArtists.length >= maxArtists) return;

    // if artist has no artistId, import first
    if (!artist.artistId) {
      try {
        const imported = await artistService.importByMusicBrainzId(
          artist.musicBrainzId
        );
        setSelectedArtists((prev) => [...prev, imported]);
      } catch (err) {
        console.error("Failed to import artist:", err);
        return;
      }
    } else {
      setSelectedArtists((prev) => [...prev, artist]);
    }

    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveArtist = (artistId) => {
    setSelectedArtists((prev) => prev.filter((a) => a.artistId !== artistId));
  };

  // auto description from selected artist names that user is slelected
  const buildDescription = () =>
    selectedArtists.map((a) => a.name).join(", ");

  // auto category from artist genres
  const buildCategory = () => {
    const genres = selectedArtists.map((a) => a.genre).filter(Boolean);
    const unique = [...new Set(genres)];
    return unique.join(", ").slice(0, 50) || null;
  };

  // playlist generation
  const handleGenerate = async () => {
    setScreen("generating");
    setProgress(0);
    setError(null);

    if (isPlaying) dispatch(pause());
    dispatch(setSongs([]));
    dispatch(setGenerating(true));

    // fake progress for now to 99% over ~20s in future i wil sync with bakcend playlist generation
   // fake progress to 99% — speed adapts to number of artists selected
    // 1 artist ~20s, 2 ~40s, 3 ~60s, 4 ~120s, 5 ~150s, i choose this values, after my tests
    const progressSpeed = { 1: 0.08, 2: 0.04, 3: 0.026, 4: 0.013, 5: 0.011 };
    const factor = progressSpeed[selectedArtists.length] || 0.08;
    const fakeInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99;
        const remaining = 99 - prev;
        return prev + remaining * factor;
      });
    }, 300);

    try {
      const request = {
        playlistName,
        description: buildDescription(),
        category: buildCategory(),
        artists: selectedArtists.map((a) => ({ artistId: a.artistId })),
      };

      const result = await playlistService.generate(request);

      clearInterval(fakeInterval);
      setGeneratedPlaylist(result);

      dispatch(addPlaylist(result));
      dispatch(setActivePlaylist(result.playlistId));

      // spread before sort 
      const songs = [...(result.songs || [])].sort((a, b) => a.order - b.order);
      const totalSongs = songs.length;

      if (totalSongs === 0) {
        dispatch(setGenerating(false));
        setProgress(100);
        setScreen("done");
        return;
      }

      // dispatch songs for populatre songlist with animation
      const batchSize = 3;
      const batches = [];
      for (let i = 0; i < totalSongs; i += batchSize) {
        batches.push(songs.slice(i, i + batchSize));
      }

      batches.forEach((batch, batchIndex) => {
        const timer = setTimeout(() => {
          dispatch(appendSongs(batch));
          const fraction = Math.min((batchIndex + 1) * batchSize, totalSongs) / totalSongs;
          setProgress((prev) => prev + (100 - prev) * fraction);

          if (batchIndex === batches.length - 1) {
            dispatch(setGenerating(false));
            setProgress(100);
            setScreen("done");
          }
        }, batchIndex * 120);
        animTimers.current.push(timer);
      });
    } catch (err) {
      clearInterval(fakeInterval);
      console.error("Failed to generate playlist:", err);
      setError("Failed to generate playlist. Try again.");
      dispatch(setGenerating(false));
      setScreen("artist-select");
    }
  };

  const handleClose = () => {
    animTimers.current.forEach(clearTimeout);
    animTimers.current = [];
    if (searchTimer.current) clearTimeout(searchTimer.current);
    dispatch(setGenerating(false));
    onClose();
  };

  //Screens for Quiz Playlist

  // Screen 1 —  individual or multiple artists

  const renderType = () => (
    <div className="playlist-wizard__screen">
      <h3 className="playlist-wizard__title">Create Playlist</h3>
      <p className="playlist-wizard__subtitle">
        Choose how you want to build your playlist
      </p>
      <div className="playlist-wizard__type-grid">
        <button
          className="playlist-wizard__type-card"
          onClick={() => {
            setPlaylistType("individual");
            setMaxArtists(1);
            setScreen("name");
          }}
        >
          <span className="playlist-wizard__type-icon">&#9835;</span>
          <span className="playlist-wizard__type-label">Individual</span>
          <span className="playlist-wizard__type-desc">1 artist</span>
        </button>
        <button
          className="playlist-wizard__type-card"
          onClick={() => {
            setPlaylistType("multiple");
            setScreen("name");
          }}
        >
          <span className="playlist-wizard__type-icon">&#9835;&#9835;</span>
          <span className="playlist-wizard__type-label">Multiple</span>
          <span className="playlist-wizard__type-desc">2-5 artists</span>
        </button>
      </div>
    </div>
  );

  // Screen 2 — playlist name
  const renderName = () => (
    <div className="playlist-wizard__screen">
      <button
        className="playlist-wizard__back-link"
        onClick={() => setScreen("type")}
      >
        &#8592; Back
      </button>
      <h3 className="playlist-wizard__title">Playlist Name</h3>
      <div className="playlist-wizard__field">
        <label className="playlist-wizard__label">Name</label>
        <input
          type="text"
          className="playlist-wizard__input"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="My Jukebox Mix"
          maxLength={100}
          autoFocus
        />
      </div>
      <div className="playlist-wizard__actions">
        <button
          className="playlist-wizard__btn playlist-wizard__btn--proceed"
          disabled={!playlistName.trim()}
          onClick={() =>
            setScreen(playlistType === "multiple" ? "count" : "artist-select")
          }
        >
          Next
        </button>
      </div>
    </div>
  );

  // Screen 3 — how many artists for multiple choise, max 5 artists are permitted
  const renderCount = () => (
    <div className="playlist-wizard__screen">
      <button
        className="playlist-wizard__back-link"
        onClick={() => setScreen("name")}
      >
        &#8592; Back
      </button>
      <h3 className="playlist-wizard__title">How Many Artists?</h3>
      <div className="playlist-wizard__count-grid">
        {[2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className="playlist-wizard__count-card"
            onClick={() => {
              setMaxArtists(n);
              setSelectedArtists([]);
              setScreen("artist-select");
            }}
          >
            <span className="playlist-wizard__count-number">{n}</span>
            <span className="playlist-wizard__count-label">artists</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Screen 4 — search and select one by one from brainz music api trough backend
  const renderArtistSelect = () => (
    <div className="playlist-wizard__screen">
      <button
        className="playlist-wizard__back-link"
        onClick={() =>
          setScreen(playlistType === "multiple" ? "count" : "name")
        }
      >
        &#8592; Back
      </button>
      <h3 className="playlist-wizard__title">
        Select Artist{maxArtists > 1 ? "s" : ""}
      </h3>
      <span className="playlist-wizard__hint">
        {selectedArtists.length}/{maxArtists} selected
      </span>
      {error && <span className="playlist-wizard__error">{error}</span>}

      {/* select artists — trough the search form */}
      {selectedArtists.length > 0 && (
        <div className="playlist-wizard__selected-list">
          {selectedArtists.map((artist) => (
            <div
              key={artist.artistId}
              className="playlist-wizard__selected-chip"
            >
              <img
                className="playlist-wizard__selected-photo"
                src={artist.photo}
                alt={artist.name}
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect fill='%23333' width='24' height='24'/%3E%3Ctext fill='%23C5A676' x='50%25' y='55%25' text-anchor='middle' font-size='8'%3E%3F%3C/text%3E%3C/svg%3E";
                }}
              />
              <span className="playlist-wizard__selected-name">
                {artist.name}
              </span>
              <button
                className="playlist-wizard__selected-remove"
                onClick={() => handleRemoveArtist(artist.artistId)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* search only visible while still selecting */}
      {selectedArtists.length < maxArtists && (
        <div className="playlist-wizard__search">
          <div className="playlist-wizard__search-field">
            <input
              type="text"
              className="playlist-wizard__input"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search artist name..."
              autoFocus
            />
            {searchLoading && (
              <span className="playlist-wizard__search-spinner" />
            )}
          </div>

          {/*dropdown select in search*/}
          {searchResults.length > 0 && (
            <div className="playlist-wizard__search-dropdown">
              {searchResults.map((artist) => (
                <div
                  key={artist.musicBrainzId || artist.artistId}
                  className="playlist-wizard__search-item"
                  onClick={() => handleSelectArtist(artist)}
                >
                  <img
                    className="playlist-wizard__search-photo"
                    src={artist.photo}
                    /* alt={artist.name} */
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect fill='%23333' width='32' height='32'/%3E%3Ctext fill='%23C5A676' x='50%25' y='55%25' text-anchor='middle' font-size='10'%3E%3F%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="playlist-wizard__search-info">
                    <span className="playlist-wizard__search-name">
                      {artist.name}
                    </span>
                    {artist.genre && (
                      <span className="playlist-wizard__search-genre">
                        {artist.genre}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* no results message */}
          {searchQuery.trim().length >= 2 &&
            !searchLoading &&
            searchResults.length === 0 && (
              <div className="playlist-wizard__search-dropdown">
                <span className="playlist-wizard__search-empty">
                  No artists found
                </span>
              </div>
            )}
        </div>
      )}

      <div className="playlist-wizard__actions playlist-wizard__actions--bottom-right">
        <button
          className="playlist-wizard__btn playlist-wizard__btn--proceed"
          disabled={selectedArtists.length !== maxArtists}
          onClick={handleGenerate}
        >
          Start
        </button>
      </div>
    </div>
  );

  // Screen 5 — genereate automatic playlist 
  const renderGenerating = () => (
    <div className="playlist-wizard__screen">
      <h3 className="playlist-wizard__title">Generating Playlist...</h3>
      <p className="playlist-wizard__subtitle">
        Importing songs for {selectedArtists.length} artist
        {selectedArtists.length > 1 ? "s" : ""}
      </p>
      <div className="playlist-wizard__progress-bar">
        <div
          className="playlist-wizard__progress-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <span className="playlist-wizard__progress-text">
        {Math.round(Math.min(progress, 100))}%
      </span>
    </div>
  );

  // Screen 6 — complete
  const renderDone = () => (
    <div className="playlist-wizard__screen">
      <h3 className="playlist-wizard__title">Playlist Created!</h3>
      <div className="playlist-wizard__result">
        <span className="playlist-wizard__result-name">
          {generatedPlaylist?.name}
        </span>
        <span className="playlist-wizard__result-count">
          {generatedPlaylist?.songsCount ||
            generatedPlaylist?.songs?.length ||
            0}{" "}
          songs
        </span>
      </div>
      <p className="playlist-wizard__subtitle">
        Activate your playlist via the <IoList className="playlist-wizard__inline-icon" /> icon
      </p>
      <div className="playlist-wizard__actions playlist-wizard__actions--center">
        {/* open the playlist panel in the video player */}
        <button
          className="playlist-wizard__btn playlist-wizard__btn--proceed"
          onClick={onViewPlaylists}
        >
          View Playlists
        </button>
      </div>
    </div>
  );

  const renderScreen = () => {
    switch (screen) {
      case "type":
        return renderType();
      case "name":
        return renderName();
      case "count":
        return renderCount();
      case "artist-select":
        return renderArtistSelect();
      case "generating":
        return renderGenerating();
      case "done":
        return renderDone();
      default:
        return null;
    }
  };

  return (
    <div
      className={`playlist-wizard ${isActive ? "playlist-wizard--active" : ""}`}
      style={{ backgroundImage: `url(${vinylBg})` }}
    >
      <div className="playlist-wizard__content">
        {screen !== "generating" && (
          <button
            className="playlist-wizard__close"
            onClick={handleClose}
            aria-label="Close wizard"
          >
            &times;
          </button>
        )}
        {renderScreen()}
      </div>
    </div>
  );
};

export default PlaylistWizard;
