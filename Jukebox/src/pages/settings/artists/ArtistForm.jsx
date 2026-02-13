import { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import artistService from "@/services/artistService";

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

const ArtistForm = () => {
  const { countryOptions, onSave, onCancel } = useOutletContext();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    photo: "",
    name: "",
    genre: "",
    careerStart: "",
    careerEnd: "",
    countryCode: "",
    youtubeChannelId: "",
    musicBrainzId: "",
    isrcCode: "",
    biography: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // load artist data for edit
  useEffect(() => {
    if (!id) return;
    const loadArtist = async () => {
      try {
        setLoading(true);
        const artist = await artistService.getById(id);
        setFormData({
          photo: artist.photo || "",
          name: artist.name || "",
          genre: artist.genre || "",
          careerStart: artist.careerStart || "",
          careerEnd: artist.careerEnd || "",
          countryCode: artist.countryCode || "",
          youtubeChannelId: artist.youtubeChannelId || "",
          musicBrainzId: artist.musicBrainzId || "",
          isrcCode: artist.isrcCode || "",
          biography: artist.biography || "",
          isActive: artist.isActive,
        });
      } catch (error) {
        console.error("Load artist error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadArtist();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Artist name is required";
    }
    if (!formData.genre) {
      newErrors.genre = "Genre is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData, id ? Number(id) : null);
    }
  };

  if (loading) return <div className="settings-form"><p>Loading...</p></div>;

  return (
    <div className="settings-form">
      <div className="settings-form__header">
        <h4 className="settings-form__title">
          {id ? "Edit Artist" : "New Artist"}
        </h4>
        <button className="settings-form__close" onClick={onCancel}>
          ×
        </button>
      </div>

      <form className="settings-form__body" onSubmit={handleSubmit}>
        {/* photo url + preview */}
        <div className="settings-form__group">
          <label className="settings-form__label">Photo URL</label>
          <div className="settings-form__photo-row">
            {formData.photo && formData.photo !== "default.jpg" && (
              <img
                className="settings-form__photo-preview"
                src={formData.photo}
                alt="Preview"
              />
            )}
            <input
              type="text"
              className="settings-form__input"
              placeholder="https://..."
              value={formData.photo}
              onChange={(e) =>
                setFormData({ ...formData, photo: e.target.value })
              }
            />
          </div>
        </div>

        {/* name */}
        <div className="settings-form__group">
          <label className="settings-form__label">Name *</label>
          <input
            type="text"
            className="settings-form__input"
            placeholder="Artist name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          {errors.name && (
            <span className="settings-form__error">{errors.name}</span>
          )}
        </div>

        {/* genre + country */}
        <div className="settings-form__row">
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
          <div className="settings-form__group">
            <label className="settings-form__label">Country</label>
            <CustomDropdownSelect
              value={formData.countryCode}
              onChange={(e) =>
                setFormData({ ...formData, countryCode: e.target.value })
              }
              options={countryOptions || []}
              placeholder="Select country"
              searchable
            />
          </div>
        </div>

        {/* career start + end */}
        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">Career Start</label>
            <input
              type="number"
              className="settings-form__input"
              placeholder="e.g. 1964"
              min="1900"
              max="2030"
              value={formData.careerStart}
              onChange={(e) =>
                setFormData({ ...formData, careerStart: e.target.value })
              }
            />
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Career End</label>
            <input
              type="number"
              className="settings-form__input"
              placeholder="Empty = active"
              min="1900"
              max="2030"
              value={formData.careerEnd}
              onChange={(e) =>
                setFormData({ ...formData, careerEnd: e.target.value })
              }
            />
          </div>
        </div>

        {/* biography */}
        <div className="settings-form__group">
          <label className="settings-form__label">Biography</label>
          <textarea
            className="settings-form__input settings-form__textarea"
            placeholder="Short biography..."
            rows="3"
            value={formData.biography}
            onChange={(e) =>
              setFormData({ ...formData, biography: e.target.value })
            }
          />
        </div>

        {/* api identifiers */}
        <div className="settings-form__separator">API Identifiers</div>

        {/* youtube channel id */}
        <div className="settings-form__group">
          <label className="settings-form__label">YouTube Channel ID</label>
          <input
            type="text"
            className="settings-form__input"
            placeholder="UC..."
            value={formData.youtubeChannelId}
            onChange={(e) =>
              setFormData({ ...formData, youtubeChannelId: e.target.value })
            }
          />
        </div>

        {/* musicbrainz id */}
        <div className="settings-form__group">
          <label className="settings-form__label">MusicBrainz ID</label>
          <input
            type="text"
            className="settings-form__input"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={formData.musicBrainzId}
            onChange={(e) =>
              setFormData({ ...formData, musicBrainzId: e.target.value })
            }
          />
        </div>

        {/* isrc */}
        <div className="settings-form__group">
          <label className="settings-form__label">ISRC</label>
          <input
            type="text"
            className="settings-form__input"
            placeholder="ISRC code"
            value={formData.isrcCode}
            onChange={(e) =>
              setFormData({ ...formData, isrcCode: e.target.value })
            }
          />
        </div>

        {/* active */}
        <div className="settings-form__group settings-form__checkbox">
          <label>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            Active (visible in jukebox)
          </label>
        </div>

        {/* actions */}
        <div className="settings-form__actions">
          <button
            type="button"
            className="btn-action btn-action--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn-action btn-action--primary">
            {id ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtistForm;