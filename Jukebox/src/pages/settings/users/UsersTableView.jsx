const getRoleBadge = (role) => {
  const classes = {
    admin: "badge-role badge-role--admin",
    user: "badge-role badge-role--user",
  };
  return classes[role] || "badge-role";
};
// user table view function with props
const UsersTableView = ({
  users,
  onView,
  onDelete,
  onToggleActive,
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
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Country</th>
            <th>Coins</th>
            <th>Played</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No users found.
              </td>
            </tr>
          ) : (
            <>
              {users.map((user, index) => (
                <tr
                  key={user.userId}
                  ref={index === users.length - 1 ? loadMoreRef : null}
                >
                  <td className="col-number">{index + 1}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td className="user-email">{user.email}</td>
                  <td>
                    <span className={getRoleBadge(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge-status ${
                        user.isActive
                          ? "badge-status--active"
                          : "badge-status--inactive"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{user.country || "—"}</td>
                  <td>{user.coins ?? 0}</td>
                  <td>{user.totalSongsPlayed ?? 0}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon btn-icon--success"
                        onClick={() => onToggleActive(user.userId)}
                        title={user.isActive ? "Deactivate" : "Activate"}
                      >
                        {user.isActive ? "⏸" : "▶"}
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => onView(user)}
                        title="View"
                      >
                        👁
                      </button>
                      <button
                        className="btn-icon btn-icon--danger"
                        onClick={() => onDelete(user)}
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
                  <td colSpan="9" className="text-center loading-more">
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

export default UsersTableView;
