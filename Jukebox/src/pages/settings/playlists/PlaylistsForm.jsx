import { useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";

const SONGS_COUNT_OPTIONS = [
  { value: 30, label: "30 songs" },
  { value: 50, label: "50 songs" },
  { value: 80, label: "80 songs" },
  { value: 100, label: "100 songs" },
];

const CURRENT_YEAR = new Date().getFullYear();
  // i need imporve this in the future

/* const generateYearOptions = (start, end) => {
  const options = [];
  for (let year = start; year <= end; year++) {
    options.push({ value: year, label: String(year) });
  }
  return options;
}; */

const PlaylistsForm = () => {
  const { playlists, artists: availableArtists, onSave, onCancel } = useOutletContext();
  const { id } = useParams();
  const playlist = id ? playlists.find((p) => p.playlistId === Number(id)) : null;

  const [formData, setFormData] = useState(() =>
    playlist
      ? {
          name: playlist.name,
          artists: playlist.artists.map((a) => ({
            artistId: String(a.artistId),
            artistName: a.artistName,
            yearStart: a.yearStart,
            yearEnd: a.yearEnd,
          })),
          songsCount: playlist.songsCount,
        }
      : {
          name: "",
          artists: [{ artistId: "", artistName: "", yearStart: "", yearEnd: "" }],
          songsCount: 50,
        }
  );

  const [errors, setErrors] = useState({});

  const getArtistData = (artistId) => {
    return availableArtists.find((a) => a.value === Number(artistId));
  };

  const getCareerEnd = (artist) => {
    return artist.careerEnd || CURRENT_YEAR;
  };

  // Filter out already-selected artists from dropdown options
  const getAvailableArtistOptions = (currentIndex) => {
    const selectedIds = formData.artists
      .filter((_, i) => i !== currentIndex)
      .map((a) => a.artistId)
      .filter(Boolean);

    return availableArtists
      .filter((a) => !selectedIds.includes(String(a.value)))
      .map((a) => ({ value: String(a.value), label: a.label }));
  };
      /* I need impove these for now i will comment them */
  /* const getYearFromOptions = (artistId, yearEnd) => {
    const artist = getArtistData(artistId);
    if (!artist) return [];
    const end = yearEnd || getCareerEnd(artist);
    return generateYearOptions(artist.careerStart, end);
  };

  const getYearToOptions = (artistId, yearStart) => {
    const artist = getArtistData(artistId);
    if (!artist) return [];
    const start = yearStart || artist.careerStart;
    return generateYearOptions(start, getCareerEnd(artist));
  }; */

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
    if (errors.name) setErrors({ ...errors, name: "" });
  };

  const handleArtistChange = (index, e) => {
    const artistId = e.target.value;
    const artist = getArtistData(artistId);
    const updatedArtists = [...formData.artists];

    if (artist) {
      updatedArtists[index] = {
        artistId: String(artist.value),
        artistName: artist.label,
        yearStart: artist.careerStart,
        yearEnd: getCareerEnd(artist),
      };
    } else {
      updatedArtists[index] = { artistId: "", artistName: "", yearStart: "", yearEnd: "" };
    }

    setFormData({ ...formData, artists: updatedArtists });
    if (errors.artists) setErrors({ ...errors, artists: "" });
  };

   /* I need impove these for now i will comment them */

  /* const handleYearStartChange = (index, e) => {
    const yearStart = Number(e.target.value);
    const updatedArtists = [...formData.artists];
    updatedArtists[index] = { ...updatedArtists[index], yearStart };

    
    if (updatedArtists[index].yearEnd && yearStart > updatedArtists[index].yearEnd) {
      updatedArtists[index].yearEnd = yearStart;
    }

    setFormData({ ...formData, artists: updatedArtists });
  };

  const handleYearEndChange = (index, e) => {
    const yearEnd = Number(e.target.value);
    const updatedArtists = [...formData.artists];
    updatedArtists[index] = { ...updatedArtists[index], yearEnd };
    setFormData({ ...formData, artists: updatedArtists });
  }; */

    // soungs count play i want to use it for some future statistics
  const handleSongsCountChange = (e) => {
    setFormData({ ...formData, songsCount: Number(e.target.value) });
  };
  // playlist form with max 5 artist limit
  const handleAddArtist = () => {
    if (formData.artists.length >= 5) return;
    setFormData({
      ...formData,
      artists: [...formData.artists, { artistId: "", artistName: "", yearStart: "", yearEnd: "" }],
    });
  };
    // remove artists
  const handleRemoveArtist = (index) => {
    const updatedArtists = formData.artists.filter((_, i) => i !== index);
    setFormData({ ...formData, artists: updatedArtists });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Playlist name is required";
    }

    const selectedArtists = formData.artists.filter((a) => a.artistId);
    if (selectedArtists.length === 0) {
      newErrors.artists = "Select at least one artist";
    }

    for (let i = 0; i < formData.artists.length; i++) {
      const a = formData.artists[i];
      if (a.artistId && a.yearStart && a.yearEnd && a.yearStart > a.yearEnd) {
        newErrors.artists = "Year range is invalid for one or more artists";
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // clean up
    const cleanedArtists = formData.artists
      .filter((a) => a.artistId)
      .map((a) => ({
        artistId: Number(a.artistId),
        artistName: a.artistName,
        yearStart: a.yearStart,
        yearEnd: a.yearEnd,
      }));

    const saveData = {
      name: formData.name.trim(),
      artists: cleanedArtists,
      songsCount: formData.songsCount,
    };

    onSave(saveData, playlist?.playlistId || null);
  };

  const selectedArtistCount = formData.artists.filter((a) => a.artistId).length;
  const songsPerArtist = selectedArtistCount > 0
    ? Math.floor(formData.songsCount / selectedArtistCount)
    : formData.songsCount;

  return (
    <div className="settings-form settings-form--full-page">
      <div className="settings-form__header">
        <h4>{playlist ? "Edit Playlist" : "New Playlist"}</h4>
        <button className="settings-form__close" onClick={onCancel}>
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="settings-form__body">
        {/* Playlist Name */}
        <div className="settings-form__group">
          <label className="settings-form__label">
            Playlist Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className={`settings-form__input${errors.name ? " is-invalid" : ""}`}
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g. 80s Pop Classics"
          />
          {errors.name && <div className="settings-form__error">{errors.name}</div>}
        </div>

        {/* Artists & Year Ranges */}
        <div className="settings-form__separator">Artists & Year Ranges</div>
        {errors.artists && <div className="settings-form__error">{errors.artists}</div>}

        {formData.artists.map((artistSlot, index) => (
          <div key={index} className="playlists-form__artist-row">
            <div className="playlists-form__artist-select">
              <label className="settings-form__label">
                Artist {index + 1} {index === 0 && <span className="required">*</span>}
              </label>
              <CustomDropdownSelect
                value={artistSlot.artistId}
                onChange={(e) => handleArtistChange(index, e)}
                options={getAvailableArtistOptions(index)}
                placeholder="Select Artist..."
                searchable
              />
            </div>

            {/* TODO: re-enable year range when backend filtering is ready
            {artistSlot.artistId && (
              <div className="playlists-form__year-range">
                <div className="playlists-form__year-field">
                  <label className="settings-form__label">From</label>
                  <CustomDropdownSelect
                    value={String(artistSlot.yearStart)}
                    onChange={(e) => handleYearStartChange(index, e)}
                    options={getYearFromOptions(artistSlot.artistId, artistSlot.yearEnd)}
                  />
                </div>
                <span className="playlists-form__year-separator">—</span>
                <div className="playlists-form__year-field">
                  <label className="settings-form__label">To</label>
                  <CustomDropdownSelect
                    value={String(artistSlot.yearEnd)}
                    onChange={(e) => handleYearEndChange(index, e)}
                    options={getYearToOptions(artistSlot.artistId, artistSlot.yearStart)}
                  />
                </div>
              </div>
            )}
            */}

            {index > 0 && (
              <button
                type="button"
                className="playlists-form__remove-artist"
                onClick={() => handleRemoveArtist(index)}
                title="Remove artist"
              >
                &times;
              </button>
            )}
          </div>
        ))}

        {formData.artists.length < 5 && (
          <button
            type="button"
            className="playlists-form__add-artist"
            onClick={handleAddArtist}
          >
            + Add Artist
          </button>
        )}

        {/* Playlist Size */}
        <div className="settings-form__separator">Playlist Size</div>

        <div className="settings-form__group">
          <label className="settings-form__label">
            Songs Count <span className="required">*</span>
          </label>
          <CustomDropdownSelect
            value={String(formData.songsCount)}
            onChange={handleSongsCountChange}
            options={SONGS_COUNT_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
          />
          {selectedArtistCount > 1 && (
            <div className="playlists-form__songs-info">
              ~{songsPerArtist} songs per artist ({selectedArtistCount} artists selected)
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="settings-form__actions">
          <button type="button" className="btn-action" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-action btn-action--primary">
            {playlist ? "Update Playlist" : "Create Playlist"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaylistsForm;
