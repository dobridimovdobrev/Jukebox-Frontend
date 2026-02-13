const getRoleBadge = (role) => {
  const classes = {
    admin: "badge-role badge-role--admin",
    user: "badge-role badge-role--user",
  };
  return classes[role] || "badge-role";
};

const formatBirthday = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const UsersTableView = ({
  users,
  onEdit,
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
            <th>Username</th>
            <th>Email</th>
            <th>Birthday</th>
            <th>Role</th>
            <th>Status</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No users found. Add one manually.
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
                  <td className="user-username">{user.username}</td>
                  <td className="user-email">{user.email}</td>
                  <td className="user-birthday">{formatBirthday(user.birthday)}</td>
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
                        onClick={() => onEdit(user)}
                        title="Edit"
                      >
                        ✏️
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
