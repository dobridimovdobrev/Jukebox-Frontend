import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, useNavigate, useMatch } from "react-router-dom";
import "@/pages/settings/users/Users.scss";
import UsersTableView from "@/pages/settings/users/UsersTableView";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import DeleteModal from "@/components/Shared/DeleteModal";
import userService from "@/services/userService";
import countryService from "@/services/countryService";
import useSuccessMessage from "@/hooks/useSuccessMessage";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const PAGE_SIZE = 30;

const Users = () => {
  const navigate = useNavigate();
  const formRouteMatch = useMatch("/settings/users/:action/*");

  const [successMessage, showSuccess] = useSuccessMessage();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [countries, setCountries] = useState([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const observerRef = useRef(null);

  const fetchUsers = useCallback(
    async (page = 1, append = false) => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const params = { pageNumber: page, pageSize: PAGE_SIZE };
        if (searchTerm) params.name = searchTerm;
        if (filterStatus === "active") params.isActive = true;
        if (filterStatus === "inactive") params.isActive = false;

        const data = await userService.search(params);

        if (append) {
          setUsers((prev) => [...prev, ...data.items]);
        } else {
          setUsers(data.items || []);
        }
        setTotalItems(data.totalItems);
        setHasMore(data.hasNextPage);
        setPageNumber(page);
      } catch (error) {
        console.error("Fetch users error:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchTerm, filterStatus],
  );

  useEffect(() => {
    fetchUsers(1, false);
  }, [fetchUsers]);

  useEffect(() => {
    countryService
      .getAll()
      .then((data) => {
        setCountries(data || []);
      })
      .catch(() => setCountries([]));
  }, []);

  const countryOptions = countries.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  const loadMoreRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchUsers(pageNumber + 1, true);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [hasMore, loadingMore, pageNumber, fetchUsers],
  );

  const handleFilterChange = (setter) => (e) => setter(e.target.value);

  const handleEdit = (user) => navigate(`update/${user.userId}`);

  const handleSave = async (userData, userId) => {
    try {
      if (userId) {
        await userService.update(userId, userData);
        showSuccess("User updated successfully!");
      }
      navigate("/settings/users");
      fetchUsers(1, false);
    } catch (error) {
      console.error("Save user error:", error);
    }
  };

  const handleCancelForm = () => navigate("/settings/users");

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await userService.deactivate(userToDelete.userId);
        fetchUsers(1, false);
      } catch (error) {
        console.error("Delete user error:", error);
      }
    }
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleToggleActive = async (userId) => {
    try {
      await userService.toggleActive(userId);
      fetchUsers(1, false);
    } catch (error) {
      console.error("Toggle active error:", error);
    }
  };

  const isChildActive = !!formRouteMatch;

  if (isChildActive) {
    return (
      <div className="users">
        <Outlet
          context={{
            users,
            countryOptions,
            onSave: handleSave,
            onCancel: handleCancelForm,
          }}
        />
      </div>
    );
  }

  return (
    <div className="users">
      {successMessage && <div className="success-toast">{successMessage}</div>}
      <div className="users__header">
        <div className="users__header-left">
          <h3 className="settings-section-title">Users Management</h3>
          <span className="badge-count">{totalItems} users</span>
        </div>
      </div>

      <div className="users__filters">
        <input
          type="text"
          className="form-control settings-search"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleFilterChange(setSearchTerm)}
        />
        <CustomDropdownSelect
          value={filterStatus}
          onChange={handleFilterChange(setFilterStatus)}
          options={STATUS_FILTER_OPTIONS}
        />
      </div>

      <UsersTableView
        users={users}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onToggleActive={handleToggleActive}
        loadMoreRef={loadMoreRef}
        hasMore={hasMore}
        loadingMore={loadingMore}
        loading={loading}
      />

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemLabel="user"
        itemPreview={
          userToDelete
            ? `${userToDelete.firstName} ${userToDelete.lastName}`
            : ""
        }
      />
    </div>
  );
};

export default Users;
