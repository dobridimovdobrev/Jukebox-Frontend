import { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import userService from "@/services/userService";

const UsersForm = () => {
  const { onCancel } = useOutletContext();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // load user directly from API
  useEffect(() => {
    if (!id) return;
    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await userService.getById(id);
        setUser(data);
      } catch (error) {
        console.error("Load user error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  if (loading) {
    return (
      <div className="settings-form settings-form--full-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-form settings-form--full-page">
        <div className="settings-form__header">
          <h4 className="settings-form__title">User not found</h4>
          <button className="settings-form__close" onClick={onCancel}>×</button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="settings-form settings-form--full-page">
      <div className="settings-form__header">
        <h4 className="settings-form__title">User Details</h4>
        <button className="settings-form__close" onClick={onCancel}>×</button>
      </div>

      <div className="settings-form__body">
        {/* Identity */}
        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">First Name</label>
            <input
              type="text"
              className="settings-form__input"
              value={user.firstName}
              disabled
            />
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Last Name</label>
            <input
              type="text"
              className="settings-form__input"
              value={user.lastName}
              disabled
            />
          </div>
        </div>

        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">Email</label>
            <input
              type="text"
              className="settings-form__input"
              value={user.email}
              disabled
            />
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Role</label>
            <input
              type="text"
              className="settings-form__input"
              value={user.role || "User"}
              disabled
            />
          </div>
        </div>

        {/* Details */}
        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">Gender</label>
            <input
              type="text"
              className="settings-form__input"
              value={user.gender || "—"}
              disabled
            />
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Country</label>
            <input
              type="text"
              className="settings-form__input"
              value={user.country || "—"}
              disabled
            />
          </div>
        </div>

        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">Birthday</label>
            <input
              type="text"
              className="settings-form__input"
              value={formatDate(user.birthday)}
              disabled
            />
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Registered</label>
            <input
              type="text"
              className="settings-form__input"
              value={formatDate(user.createdAt)}
              disabled
            />
          </div>
        </div>

        {/* Stats */}
        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">Coins</label>
            <input
              type="text"
              className="settings-form__input"
              value={user.coins}
              disabled
            />
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Songs Played</label>
            <input
              type="text"
              className="settings-form__input"
              value={user.totalSongsPlayed}
              disabled
            />
          </div>
        </div>

        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">Status</label>
            <input
              type="text"
              className="settings-form__input"
              value={user.isActive ? "Active" : "Inactive"}
              disabled
            />
          </div>
          <div className="settings-form__group" />
        </div>

        {/* Actions */}
        <div className="settings-form__actions">
          <button
            type="button"
            className="btn-action btn-action--secondary"
            onClick={onCancel}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersForm;