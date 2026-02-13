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

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const TicketTableView = ({
  tickets,
  onView,
  onDelete,
  loadMoreRef,
  hasMore,
  loadingMore,
}) => {
  return (
    <div className="table-container">
      <table className="table settings-table">
        <thead>
          <tr>
            <th className="col-number">#</th>
            <th style={{ width: "30%" }}>Subject</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Author</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No tickets found.
              </td>
            </tr>
          ) : (
            <>
              {tickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  ref={index === tickets.length - 1 ? loadMoreRef : null}
                >
                  <td className="col-number">{index + 1}</td>
                  <td className="ticket-subject-cell">
                    {ticket.subject.length > 45
                      ? `${ticket.subject.substring(0, 45)}...`
                      : ticket.subject}
                  </td>
                  <td>{ticket.category}</td>
                  <td>
                    <span className={`badge-priority badge-priority--${ticket.priority}`}>
                      {PRIORITY_LABELS[ticket.priority]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-ticket badge-ticket--${ticket.status}`}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </td>
                  <td>{ticket.createdBy}</td>
                  <td className="ticket-date-cell">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => onView(ticket)}
                        title="View"
                      >
                        👁
                      </button>
                      <button
                        className="btn-icon btn-icon--danger"
                        onClick={() => onDelete(ticket)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loadingMore && hasMore && (
                <tr>
                  <td colSpan="8" className="text-center loading-more">
                    Loading...
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTableView;
