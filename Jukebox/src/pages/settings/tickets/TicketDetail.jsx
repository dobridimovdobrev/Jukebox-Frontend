import { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import ticketService from "@/services/ticketService";
import compressImage from "@/utils/compressImage";
import uploadService from "@/services/uploadService";
// ticket system transitions
const TRANSITIONS = {
  open: ["in_progress", "closed"],
  in_progress: ["answered", "closed"],
  answered: ["in_progress", "closed"],
  closed: [],
};
// all status for my ticket system
const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  answered: "Answered",
  closed: "Closed",
};
// ticket priority labels
const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
// date of ticket creation
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

const mapBackendTicket = (t) => ({
  id: t.ticketId,
  subject: t.title,
  description: t.description,
  category: t.category,
  priority: t.priority?.toLowerCase(),
  status: t.status,
  attachment: t.attachmentUrl,
  createdBy: t.userFullName || "User",
  createdAt: t.createdAt,
  resolvedAt: t.resolvedAt,
  history: (t.history || []).map((h) => ({
    type: h.type,
    from: h.fromStatus,
    to: h.toStatus,
    message: h.message,
    note: h.note,
    attachment: h.attachmentUrl,
    by: h.by || "System",
    date: h.date,
  })),
});
  // ticket details
const TicketDetail = () => {
  const { currentRole, onAdminAction, onCancel, onRefresh } = useOutletContext();
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState("");
  const [responseImage, setResponseImage] = useState(null);
  const [responsePreview, setResponsePreview] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketService.getById(Number(id));
      setTicket(mapBackendTicket(data));
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  if (loading) {
    return (
      <div className="ticket-detail">
        <button className="ticket-detail__back" onClick={onCancel}>
          &larr; Back to Tickets
        </button>
        <p>Loading ticket...</p>
      </div>
    );
  }
  // manage message when no tickets found
  if (!ticket) {
    return (
      <div className="ticket-detail">
        <button className="ticket-detail__back" onClick={onCancel}>
          &larr; Back to Tickets
        </button>
        <p>Ticket not found.</p>
      </div>
    );
  }
  // validation ans states ticket system
  const validTransitions = TRANSITIONS[ticket.status] || [];
  const isAdmin = currentRole === "admin";
  const isClosed = ticket.status === "closed";
  const canReply = !isClosed;

  const handleAdminSubmit = async () => {
    const hasResponse = responseText.trim() || responseImage;
    const hasStatusChange = !!selectedStatus;

    if (!hasResponse && !hasStatusChange) return;

    setSubmitting(true);
    try {
      let attachmentUrl = null;
      if (responseImage) {
        attachmentUrl = await uploadService.uploadImage(responseImage);
      }
      await onAdminAction(ticket.id, {
        message: responseText.trim(),
        attachment: attachmentUrl,
        newStatus: selectedStatus || null,
      });
      resetForm();
      await fetchTicket();
      if (onRefresh) onRefresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserReply = async () => {
    if (!responseText.trim() && !responseImage) return;

    setSubmitting(true);
    try {
      let attachmentUrl = null;
      if (responseImage) {
        attachmentUrl = await uploadService.uploadImage(responseImage);
      }
      await ticketService.reply(ticket.id, {
        message: responseText.trim() || null,
        attachmentUrl: attachmentUrl,
      });
      resetForm();
      await fetchTicket();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setResponseText("");
    setResponseImage(null);
    setResponsePreview(null);
    setSelectedStatus("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) return;

    try {
      const compressed = await compressImage(file);
      setResponseImage(compressed);
      setResponsePreview(compressed);
    } catch {
      console.error("Failed to compress image");
    }
  };

  const handleRemoveImage = () => {
    setResponseImage(null);
    setResponsePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSubmitAdmin = !submitting && (responseText.trim() || responseImage || selectedStatus);
  const canSubmitUser = !submitting && (responseText.trim() || responseImage);

  return (
    <div className="ticket-detail">
      <button className="ticket-detail__back" onClick={onCancel}>
        &larr; Back to Tickets
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
        <span className="ticket-detail__meta-sep">&middot;</span>
        <span className={`badge-priority badge-priority--${ticket.priority}`}>
          {PRIORITY_LABELS[ticket.priority] || ticket.priority}
        </span>
        <span className="ticket-detail__meta-sep">&middot;</span>
        <span>Submitted by <strong>{ticket.createdBy}</strong></span>
        <span className="ticket-detail__meta-sep">&middot;</span>
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
            src={uploadService.resolveUrl(ticket.attachment)}
            alt="Ticket attachment"
          />
        </div>
      )}

      {/* History Timeline */}
      <div className="ticket-detail__section">
        <h4 className="ticket-detail__section-title">History</h4>
        {ticket.history.length === 0 ? (
          <p className="ticket-detail__no-history">No history yet.</p>
        ) : (
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
                        {STATUS_LABELS[entry.from] || entry.from} &rarr; {STATUS_LABELS[entry.to] || entry.to}
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
                          src={uploadService.resolveUrl(entry.attachment)}
                          alt="Response attachment"
                        />
                      )}
                      <span className="ticket-detail__timeline-meta">
                        {formatDateTime(entry.date)}
                      </span>
                    </>
                  )}
                  {entry.type === "user_reply" && (
                    <>
                      <span className="ticket-detail__timeline-label">
                        Reply from {entry.by}
                      </span>
                      {entry.message && (
                        <p className="ticket-detail__timeline-message">{entry.message}</p>
                      )}
                      {entry.attachment && (
                        <img
                          className="ticket-detail__timeline-image"
                          src={uploadService.resolveUrl(entry.attachment)}
                          alt="Reply attachment"
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
        )}
      </div>

      {/* Admin Actions */}
      {isAdmin && canReply && (
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
            {/* ticket status label */}
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
                  onClick={handleAdminSubmit}
                  disabled={!canSubmitAdmin}
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

      {/* User Reply */}
      {!isAdmin && canReply && (
        <div className="ticket-detail__section ticket-detail__user-reply">
          <h4 className="ticket-detail__section-title">Your Reply</h4>
          <div className="ticket-detail__respond">
            <textarea
              className="settings-form__textarea"
              placeholder="Write a reply..."
              rows={3}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />

            {responsePreview && (
              <div className="ticket-attachment-preview">
                <img src={responsePreview} alt="Reply attachment" />
                <button
                  type="button"
                  className="btn-action btn-action--danger"
                  onClick={handleRemoveImage}
                >
                  Remove
                </button>
              </div>
            )}
              {/* atch image only jpg and png formats uploaded to my backend */}
            <div className="ticket-detail__respond-footer">
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
                  className="btn-action btn-action--primary"
                  onClick={handleUserReply}
                  disabled={!canSubmitUser}
                >
                  {submitting ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        {/*  info message on closed ticket */}
      {isClosed && (
        <div className="ticket-detail__closed-notice">
          This ticket is closed. No further actions are available.
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
