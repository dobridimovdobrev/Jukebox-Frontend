const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemLabel,
  itemPreview,
  icon = "\u{1F5D1}\uFE0F",
}) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div
        className="delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-modal__body">
          <div className="delete-confirm">
            <div className="delete-confirm__icon">{icon}</div>
            <p className="delete-confirm__message">Delete this {itemLabel}?</p>
            {itemPreview && (
              <p className="delete-confirm__submessage">{itemPreview}</p>
            )}
          </div>
        </div>
        <div className="delete-modal__footer">
          <button
            className="btn-action btn-action--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-action btn-action--danger"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
