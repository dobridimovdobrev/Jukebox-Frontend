const LogoutConfirm = ({ isActive, onConfirm, onCancel }) => {
  return (
    <div className={`logout-confirm${isActive ? " logout-confirm--active" : ""}`}>
      <div className="logout-confirm__content">
        <div className="logout-confirm__screen">
          <h3 className="logout-confirm__title">Logout</h3>
          <p className="logout-confirm__message">
            Are you sure you want to leave the jukebox?
          </p>
          <div className="logout-confirm__actions">
            <button className="logout-confirm__btn logout-confirm__btn--cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="logout-confirm__btn logout-confirm__btn--confirm" onClick={onConfirm}>
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirm;
