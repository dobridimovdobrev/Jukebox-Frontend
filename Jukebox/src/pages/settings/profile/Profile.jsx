import { useState, useEffect } from "react";
import "@/pages/settings/profile/Profile.scss";
import userService from "@/services/userService";
import countryService from "@/services/countryService";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import useSuccessMessage from "@/hooks/useSuccessMessage";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const Profile = () => {
  const [successMessage, showSuccess] = useSuccessMessage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    country: "",
    birthday: "",
  });

  const [readOnly, setReadOnly] = useState({
    email: "",
    role: "",
    coins: 0,
    totalSongsPlayed: 0,
    createdAt: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          gender: data.gender || "",
          country: data.country || "",
          birthday: data.birthday ? data.birthday.split("T")[0] : "",
        });
        setReadOnly({
          email: data.email || "",
          role: data.role || "User",
          coins: data.coins ?? 0,
          totalSongsPlayed: data.totalSongsPlayed ?? 0,
          createdAt: data.createdAt || "",
        });
      } catch (error) {
        console.error("Load profile error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    countryService
      .getAll()
      .then((data) => {
        setCountryOptions((data || []).map((c) => ({ value: c.name, label: c.name })));
      })
      .catch(() => setCountryOptions([]));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await userService.updateProfile(formData);
      showSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="profile">
        <p className="profile__loading">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile">
      {successMessage && <div className="success-toast">{successMessage}</div>}
      <div className="settings-form settings-form--full-page">
        <div className="settings-form__header">
          <h4 className="settings-form__title">My Profile</h4>
        </div>

        <form className="settings-form__body" onSubmit={handleSubmit}>
          {/* First Name + Last Name */}
          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">First Name *</label>
              <input
                type="text"
                className="settings-form__input"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              {errors.firstName && (
                <span className="settings-form__error">{errors.firstName}</span>
              )}
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Last Name *</label>
              <input
                type="text"
                className="settings-form__input"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
              {errors.lastName && (
                <span className="settings-form__error">{errors.lastName}</span>
              )}
            </div>
          </div>

          {/* Email (read-only) + Role (read-only) */}
          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">Email</label>
              <input
                type="text"
                className="settings-form__input"
                value={readOnly.email}
                disabled
              />
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Role</label>
              <input
                type="text"
                className="settings-form__input"
                value={readOnly.role}
                disabled
              />
            </div>
          </div>

          {/* Gender + Country */}
          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">Gender</label>
              <CustomDropdownSelect
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={GENDER_OPTIONS}
                placeholder="Select gender"
              />
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Country</label>
              <CustomDropdownSelect
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                options={countryOptions}
                placeholder="Select country"
                searchable
              />
            </div>
          </div>

          {/* Birthday + Registered (read-only) */}
          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">Birthday</label>
              <input
                type="date"
                className="settings-form__input"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              />
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Registered</label>
              <input
                type="text"
                className="settings-form__input"
                value={formatDate(readOnly.createdAt)}
                disabled
              />
            </div>
          </div>

          {/* Coins + Songs Played (read-only) */}
          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">Coins</label>
              <input
                type="text"
                className="settings-form__input"
                value={readOnly.coins}
                disabled
              />
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Songs Played</label>
              <input
                type="text"
                className="settings-form__input"
                value={readOnly.totalSongsPlayed}
                disabled
              />
            </div>
          </div>

          {/* Save */}
          <div className="settings-form__actions">
            <button
              type="submit"
              className="btn-action btn-action--primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
