import { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import artistService from "@/services/artistService";

const SONGS_COUNT_OPTIONS = [
  { value: "30", label: "30 songs" },
  { value: "50", label: "50 songs" },
  { value: "80", label: "80 songs" },
  { value: "100", label: "100 songs" },
];

const PlaylistsForm = () => {
  const { playlists, onSave, onCancel } = useOutletContext();
  const { id } = useParams();
  const playlist = id
    ? playlists.find((p) => p.playlistId === Number(id) || p.playlistId === id)
    : null;

  const [availableArtists, setAvailableArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);

  const [formData, setFormData] = useState(() =>
    playlist
      ? {
          name: playlist.name,
          artists: playlist.artists?.map((a) => ({
            artistId: String(a.artistId),
            artistName: a.artistName,
          })) || [{ artistId: "", artistName: "" }],
          songsCount: String(playlist.songsCount || 50),
        }
      : {
          name: "",
          artists: [{ artistId: "", artistName: "" }],
          songsCount: "50",
        }
  );

  const [errors, setErrors] = useState({});

  // Load all artists for dropdown
  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoadingArtists(true);
        const data = await artistService.search({ pageSize: 500 });
        const items = data.items || data || [];
        setAvailableArtists(
          items.map((a) => ({
            value: String(a.artistId),
            label: a.artistName,
          }))
        );
      } catch (error) {
        console.error("Load artists error:", error);
      } finally {
        setLoadingArtists(false);
      }
    };
    loadArtists();
  }, []);

  // Filter out already-selected artists
  const getAvailableOptions = (currentIndex) => {
    const selectedIds = formData.artists
      .filter((_, i) => i !== currentIndex)
      .map((a) => a.artistId)
      .filter(Boolean);

    return availableArtists.filter((a) => !selectedIds.includes(a.value));
  };

  const handleArtistChange = (index, e) => {
    const artistId = e.target.value;
    const artist = availableArtists.find((a) => a.value === artistId);
    const updated = [...formData.artists];

    updated[index] = artist
      ? { artistId: artist.value, artistName: artist.label }
      : { artistId: "", artistName: "" };

    setFormData({ ...formData, artists: updated });
    if (errors.artists) setErrors({ ...errors, artists: "" });
  };

  const handleAddArtist = () => {
    if (formData.artists.length >= 5) return;
    setFormData({
      ...formData,
      artists: [...formData.artists, { artistId: "", artistName: "" }],
    });
  };

  const handleRemoveArtist = (index) => {
    setFormData({
      ...formData,
      artists: formData.artists.filter((_, i) => i !== index),
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Playlist name is required";
    }
    const selected = formData.artists.filter((a) => a.artistId);
    if (selected.length === 0) {
      newErrors.artists = "Select at least one artist";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Match backend GeneratePlaylistRequest DTO
    const saveData = {
      playlistName: formData.name.trim(),
      artists: formData.artists
        .filter((a) => a.artistId)
        .map((a) => ({ artistId: Number(a.artistId) })),
      songsCount: Number(formData.songsCount),
    };

    onSave(saveData, playlist?.playlistId || null);
  };

  const selectedCount = formData.artists.filter((a) => a.artistId).length;
  const songsPerArtist =
    selectedCount > 0
      ? Math.floor(Number(formData.songsCount) / selectedCount)
      : Number(formData.songsCount);

  if (loadingArtists) {
    return (
      <div className="settings-form settings-form--full-page">
        <p>Loading artists...</p>
      </div>
    );
  }

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
            className={`form-control settings-form__input${errors.name ? " is-invalid" : ""}`}
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder="e.g. 80s Pop Classics"
          />
          {errors.name && (
            <div className="settings-form__error">{errors.name}</div>
          )}
        </div>

        {/* Artists */}
        <div className="settings-form__separator">Artists</div>
        {errors.artists && (
          <div className="settings-form__error">{errors.artists}</div>
        )}

        {formData.artists.map((artistSlot, index) => (
          <div key={index} className="playlists-form__artist-row">
            <div className="playlists-form__artist-select">
              <label className="settings-form__label">
                Artist {index + 1}{" "}
                {index === 0 && <span className="required">*</span>}
              </label>
              <CustomDropdownSelect
                value={artistSlot.artistId}
                onChange={(e) => handleArtistChange(index, e)}
                options={getAvailableOptions(index)}
                placeholder="Select Artist..."
                searchable
              />
            </div>

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
            value={formData.songsCount}
            onChange={(e) =>
              setFormData({ ...formData, songsCount: e.target.value })
            }
            options={SONGS_COUNT_OPTIONS}
          />
          {selectedCount > 1 && (
            <div className="playlists-form__songs-info">
              ~{songsPerArtist} songs per artist ({selectedCount} artists
              selected)
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="settings-form__actions">
          <button type="button" className="btn-action" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-action btn-action--primary">
            {playlist ? "Update Playlist" : "Generate Playlist"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaylistsForm;