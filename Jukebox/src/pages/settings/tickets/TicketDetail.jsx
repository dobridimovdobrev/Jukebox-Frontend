import { useState, useRef } from "react";
import { useOutletContext, useParams } from "react-router-dom";

const TRANSITIONS = {
  open: ["in_progress", "closed"],
  in_progress: ["answered"],
  answered: ["in_progress", "closed"],
  closed: [],
};

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  answered: "Answered",
  closed: "Closed",
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const formatDateTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TicketDetail = () => {
  const { tickets, currentRole, onAdminAction, onCancel } = useOutletContext();
  const { id } = useParams();
  const ticket = tickets.find((t) => t.id === Number(id));

  const [responseText, setResponseText] = useState("");
  const [responseImage, setResponseImage] = useState(null);
  const [responsePreview, setResponsePreview] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!ticket) {
    return (
      <div className="ticket-detail">
        <button className="ticket-detail__back" onClick={onCancel}>
          ← Back to Tickets
        </button>
        <p>Ticket not found.</p>
      </div>
    );
  }

  const validTransitions = TRANSITIONS[ticket.status] || [];

  const handleSubmit = async () => {
    const hasResponse = responseText.trim() || responseImage;
    const hasStatusChange = !!selectedStatus;

    if (!hasResponse && !hasStatusChange) return;

    setSubmitting(true);
    try {
      await onAdminAction(ticket.id, {
        message: responseText.trim(),
        attachment: responseImage,
        newStatus: selectedStatus || null,
      });

      setResponseText("");
      setResponseImage(null);
      setResponsePreview(null);
      setSelectedStatus("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setResponseImage(event.target.result);
      setResponsePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setResponseImage(null);
    setResponsePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSubmit = !submitting && (responseText.trim() || responseImage || selectedStatus);

  return (
    <div className="ticket-detail">
      <button className="ticket-detail__back" onClick={onCancel}>
        ← Back to Tickets
      </button>

      {/* Header */}
      <div className="ticket-detail__header">
        <h3 className="ticket-detail__subject">{ticket.subject}</h3>
        <span className={`badge-ticket badge-ticket--${ticket.status}`}>
          {STATUS_LABELS[ticket.status] || ticket.status}
        </span>
      </div>

      {/* Meta */}
      <div className="ticket-detail__meta">
        <span>{ticket.category}</span>
        <span className="ticket-detail__meta-sep">·</span>
        <span className={`badge-priority badge-priority--${ticket.priority}`}>
          {PRIORITY_LABELS[ticket.priority] || ticket.priority}
        </span>
        <span className="ticket-detail__meta-sep">·</span>
        <span>Submitted by <strong>{ticket.createdBy}</strong></span>
        <span className="ticket-detail__meta-sep">·</span>
        <span>{formatDateTime(ticket.createdAt)}</span>
      </div>

      {/* Description */}
      <div className="ticket-detail__section">
        <h4 className="ticket-detail__section-title">Description</h4>
        <p className="ticket-detail__description">{ticket.description}</p>
      </div>

      {/* Attachment */}
      {ticket.attachment && (
        <div className="ticket-detail__section">
          <h4 className="ticket-detail__section-title">Attachment</h4>
          <img
            className="ticket-detail__attachment"
            src={ticket.attachment}
            alt="Ticket attachment"
          />
        </div>
      )}

      {/* History Timeline */}
      <div className="ticket-detail__section">
        <h4 className="ticket-detail__section-title">History</h4>
        <div className="ticket-detail__timeline">
          {ticket.history.map((entry, i) => (
            <div
              key={i}
              className={`ticket-detail__timeline-item ticket-detail__timeline-item--${entry.type}`}
            >
              <div className="ticket-detail__timeline-dot" />
              <div className="ticket-detail__timeline-content">
                {entry.type === "created" && (
                  <>
                    <span className="ticket-detail__timeline-label">Ticket created</span>
                    <span className="ticket-detail__timeline-meta">
                      {formatDateTime(entry.date)} by {entry.by}
                    </span>
                  </>
                )}
                {entry.type === "transition" && (
                  <>
                    <span className="ticket-detail__timeline-label">
                      {STATUS_LABELS[entry.from] || entry.from} → {STATUS_LABELS[entry.to] || entry.to}
                    </span>
                    {entry.note && (
                      <span className="ticket-detail__timeline-note">{entry.note}</span>
                    )}
                    <span className="ticket-detail__timeline-meta">
                      {formatDateTime(entry.date)} by {entry.by}
                    </span>
                  </>
                )}
                {entry.type === "response" && (
                  <>
                    <span className="ticket-detail__timeline-label">
                      Response from {entry.by}
                    </span>
                    {entry.message && (
                      <p className="ticket-detail__timeline-message">{entry.message}</p>
                    )}
                    {entry.attachment && (
                      <img
                        className="ticket-detail__timeline-image"
                        src={entry.attachment}
                        alt="Response attachment"
                      />
                    )}
                    <span className="ticket-detail__timeline-meta">
                      {formatDateTime(entry.date)}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      {currentRole === "admin" && ticket.status !== "closed" && (
        <div className="ticket-detail__section ticket-detail__admin-actions">
          <h4 className="ticket-detail__section-title">Admin Response</h4>
          <div className="ticket-detail__respond">
            <textarea
              className="settings-form__textarea"
              placeholder="Write a response to the user..."
              rows={3}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />

            {responsePreview && (
              <div className="ticket-attachment-preview">
                <img src={responsePreview} alt="Response attachment" />
                <button
                  type="button"
                  className="btn-action btn-action--danger"
                  onClick={handleRemoveImage}
                >
                  Remove
                </button>
              </div>
            )}

            <div className="ticket-detail__respond-footer">
              {validTransitions.length > 0 && (
                <div className="ticket-detail__status-inline">
                  <label className="ticket-detail__status-label">Status:</label>
                  <select
                    className="ticket-detail__status-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">Keep current ({STATUS_LABELS[ticket.status]})</option>
                    {validTransitions.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="ticket-detail__respond-buttons">
                <label className="ticket-detail__file-label">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    hidden
                  />
                  <span className="btn-action btn-action--secondary">Attach Image</span>
                </label>
                <button
                  className={`btn-action ${
                    selectedStatus === "closed" ? "btn-action--danger" : "btn-action--primary"
                  }`}
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  {submitting
                    ? "Sending..."
                    : selectedStatus
                    ? `Submit & ${selectedStatus === "closed" ? "Close" : "Update Status"}`
                    : "Send Response"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {ticket.status === "closed" && (
        <div className="ticket-detail__closed-notice">
          This ticket is closed. No further actions are available.
        </div>
      )}
    </div>
  );
};

export default TicketDetail;