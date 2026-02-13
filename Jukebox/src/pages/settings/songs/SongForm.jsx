import { useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";

const GENRE_OPTIONS = [
  { value: "Pop", label: "Pop" },
  { value: "Rock", label: "Rock" },
  { value: "R&B", label: "R&B" },
  { value: "Jazz", label: "Jazz" },
  { value: "Electronic", label: "Electronic" },
  { value: "Hip Hop", label: "Hip Hop" },
  { value: "Country", label: "Country" },
  { value: "Metal", label: "Metal" },
  { value: "Indie", label: "Indie" },
  { value: "Classical", label: "Classical" },
  { value: "Soul", label: "Soul" },
  { value: "Funk", label: "Funk" },
  { value: "Disco", label: "Disco" },
  { value: "Reggae", label: "Reggae" },
  { value: "Blues", label: "Blues" },
  { value: "Latin", label: "Latin" },
  { value: "Alternative", label: "Alternative" },
];

const formatSecondsToInput = (seconds) => {
  if (!seconds && seconds !== 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const parseInputToSeconds = (input) => {
  const parts = input.split(":");
  if (parts.length !== 2) return null;
  const mins = parseInt(parts[0], 10);
  const secs = parseInt(parts[1], 10);
  if (isNaN(mins) || isNaN(secs) || secs >= 60 || secs < 0 || mins < 0) return null;
  return mins * 60 + secs;
};

const SongForm = () => {
  const { songs, artistOptions, countryOptions, onSave, onCancel } = useOutletContext();
  const { id } = useParams();
  const song = id ? songs.find((s) => s.songId === Number(id)) : null;

  const [formData, setFormData] = useState(() =>
    song
      ? {
          title: song.title,
          artistId: String(song.artistId),
          duration: formatSecondsToInput(song.duration),
          genre: song.genre || "",
          releaseYear: song.releaseYear || "",
          countryCode: song.countryCode || "",
          youtubeId: song.youtubeId || "",
        }
      : {
          title: "",
          artistId: "",
          duration: "",
          genre: "",
          releaseYear: "",
          countryCode: "",
          youtubeId: "",
        }
  );

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.artistId) {
      newErrors.artistId = "Artist is required";
    }
    if (!formData.genre) {
      newErrors.genre = "Genre is required";
    }
    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    } else if (parseInputToSeconds(formData.duration) === null) {
      newErrors.duration = "Use format m:ss (e.g. 4:35)";
    }
    if (!formData.releaseYear) {
      newErrors.releaseYear = "Year is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleArtistChange = (e) => {
    setFormData({ ...formData, artistId: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const saveData = {
        title: formData.title,
        artistId: Number(formData.artistId),
        duration: parseInputToSeconds(formData.duration),
        genre: formData.genre,
        releaseYear: Number(formData.releaseYear),
        countryCode: formData.countryCode || null,
        youtubeId: formData.youtubeId || null,
      };
      onSave(saveData, song?.songId || null);
    }
  };

  return (
    <div className="settings-form">
      <div className="settings-form__header">
        <h4 className="settings-form__title">
          {song ? "Edit Song" : "New Song"}
        </h4>
        <button className="settings-form__close" onClick={onCancel}>
          ×
        </button>
      </div>

      <form className="settings-form__body" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="settings-form__group">
          <label className="settings-form__label">Title *</label>
          <input
            type="text"
            className="settings-form__input"
            placeholder="Song title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          {errors.title && (
            <span className="settings-form__error">{errors.title}</span>
          )}
        </div>

        {/* Artist + Genre */}
        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">Artist *</label>
            <CustomDropdownSelect
              value={formData.artistId}
              onChange={handleArtistChange}
              options={artistOptions}
              placeholder="Select artist"
              searchable
            />
            {errors.artistId && (
              <span className="settings-form__error">{errors.artistId}</span>
            )}
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Genre *</label>
            <CustomDropdownSelect
              value={formData.genre}
              onChange={(e) =>
                setFormData({ ...formData, genre: e.target.value })
              }
              options={GENRE_OPTIONS}
              placeholder="Select genre"
            />
            {errors.genre && (
              <span className="settings-form__error">{errors.genre}</span>
            )}
          </div>
        </div>

        {/* Duration + Release Year + Country */}
        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">Duration *</label>
            <input
              type="text"
              className="settings-form__input"
              placeholder="m:ss (e.g. 4:35)"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
            />
            {errors.duration && (
              <span className="settings-form__error">{errors.duration}</span>
            )}
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Release Year *</label>
            <input
              type="number"
              className="settings-form__input"
              placeholder="e.g. 1982"
              min="1900"
              max="2030"
              value={formData.releaseYear}
              onChange={(e) =>
                setFormData({ ...formData, releaseYear: e.target.value })
              }
            />
            {errors.releaseYear && (
              <span className="settings-form__error">{errors.releaseYear}</span>
            )}
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Country</label>
            <CustomDropdownSelect
              value={formData.countryCode}
              onChange={(e) =>
                setFormData({ ...formData, countryCode: e.target.value })
              }
              options={countryOptions}
              placeholder="Select country"
              searchable
            />
          </div>
        </div>

        {/* API Identifiers separator */}
        <div className="settings-form__separator">API Identifiers</div>

        {/* YouTube Video ID */}
        <div className="settings-form__group">
          <label className="settings-form__label">YouTube Video ID</label>
          <input
            type="text"
            className="settings-form__input"
            placeholder="e.g. dQw4w9WgXcQ"
            value={formData.youtubeId}
            onChange={(e) =>
              setFormData({ ...formData, youtubeId: e.target.value })
            }
          />
        </div>

        {/* Actions */}
        <div className="settings-form__actions">
          <button
            type="button"
            className="btn-action btn-action--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn-action btn-action--primary">
            {song ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SongForm;
