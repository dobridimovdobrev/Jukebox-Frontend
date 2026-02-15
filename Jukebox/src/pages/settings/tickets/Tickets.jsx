import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, useNavigate, useMatch } from "react-router-dom";
import { useSelector } from "react-redux";
import "@/pages/settings/tickets/Tickets.scss";
import TicketTableView from "@/pages/settings/tickets/TicketTableView";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import DeleteModal from "@/components/Shared/DeleteModal";
import ticketService from "@/services/ticketService";
import useSuccessMessage from "@/hooks/useSuccessMessage";
// all ticke statuses
const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "answered", label: "Answered" },
  { value: "closed", label: "Closed" },
];
// ticket system prioriry
const PRIORITY_FILTER_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];
// ticket system categories i will imporve in future from backend
const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Bug Report", label: "Bug Report" },
  { value: "Feature Request", label: "Feature Request" },
  { value: "Account Issue", label: "Account Issue" },
  { value: "Playback Issue", label: "Playback Issue" },
  { value: "General", label: "General" },
];
// 30 tickets per page with scroll infinity hook and lazy loading
const ADMIN_ROLES = ["SuperAdmin"];
const PAGE_SIZE = 30;

// Map backend response to local format
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

const Tickets = () => {
  const navigate = useNavigate();
  const childRouteMatch = useMatch("/settings/tickets/:action/*");
  const user = useSelector((s) => s.auth.user);
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r));

  const [successMessage, showSuccess] = useSuccessMessage();

  // ticket data
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const currentRole = isAdmin ? "admin" : "user";

  // ticket filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  //delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const observerRef = useRef(null);

  // search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const userName = user ? `${user.firstName} ${user.lastName}` : "User";

  // fetch tickets from backend
  const fetchTickets = useCallback(
    async (page = 1, append = false) => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        if (isAdmin) {
          // pagination with filtering
          const params = { PageNumber: page, PageSize: PAGE_SIZE };
          if (debouncedSearch) params.Title = debouncedSearch;
          if (filterStatus !== "all") params.Status = filterStatus;
          if (filterPriority !== "all") params.Priority = filterPriority;
          if (filterCategory !== "all") params.Category = filterCategory;

          const data = await ticketService.search(params);
          const mapped = (data.items || []).map((t) => ({
            ...mapBackendTicket(t),
            createdBy: t.userFullName || userName,
          }));

          if (append) {
            setTickets((prev) => [...prev, ...mapped]);
          } else {
            setTickets(mapped);
          }
          setTotalItems(data.totalItems);
          setHasMore(data.hasNextPage);
          setPageNumber(page);
        } else {
          // backend pagiantion
          const data = await ticketService.getMy();
          const mapped = (Array.isArray(data) ? data : []).map((t) => ({
            ...mapBackendTicket(t),
            createdBy: t.userFullName || userName,
          }));
          setTickets(mapped);
          setTotalItems(mapped.length);
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setTickets([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isAdmin, debouncedSearch, filterStatus, filterPriority, filterCategory, userName],
  );

  useEffect(() => {
    fetchTickets(1, false);
  }, [fetchTickets]);

  // IntersectionObserver for infinite scroll with my reusable hook
  const loadMoreRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchTickets(pageNumber + 1, true);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [hasMore, loadingMore, pageNumber, fetchTickets],
  );

  // ticket filters
  const displayedTickets = isAdmin
    ? tickets
    : tickets.filter((ticket) => {
        const matchesSearch = ticket.subject
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());
        const matchesStatus =
          filterStatus === "all" || ticket.status === filterStatus;
        const matchesPriority =
          filterPriority === "all" || ticket.priority === filterPriority;
        const matchesCategory =
          filterCategory === "all" || ticket.category === filterCategory;
        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
      });

  const handleFilterChange = (setter) => (e) => setter(e.target.value);

  // Navigation
  const handleAddNew = () => navigate("create");
  const handleView = (ticket) => navigate(`view/${ticket.id}`);
  const handleCancel = () => navigate("/settings/tickets");

  // Create ticket
  const handleSave = async (formData) => {
    try {
      await ticketService.create({
        title: formData.subject,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        attachmentUrl: formData.attachment,
      });
      showSuccess("Ticket created successfully!");
      navigate("/settings/tickets");
      fetchTickets(1, false);
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  // admin actions
  const handleAdminAction = async (ticketId, { message, attachment, newStatus, note }) => {
    try {
      await ticketService.addAction(ticketId, {
        message: message || null,
        attachmentUrl: attachment || null,
        newStatus: newStatus || null,
        note: note || null,
      });
      fetchTickets(1, false);
    } catch (err) {
      console.error("Failed to perform action:", err);
    }
  };

  // delete
  const handleDeleteClick = (ticket) => {
    setTicketToDelete(ticket);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (ticketToDelete) {
      try {
        await ticketService.delete(ticketToDelete.id);
        fetchTickets(1, false);
      } catch (err) {
        console.error("Failed to delete ticket:", err);
      }
    }
    setIsDeleteDialogOpen(false);
    setTicketToDelete(null);
  };
  // badges
  const badgeCount = isAdmin ? totalItems : displayedTickets.length;
  const isChildActive = !!childRouteMatch;

  if (isChildActive) {
    return (
      <div className="tickets">
        <Outlet
          context={{
            tickets,
            currentRole,
            onSave: handleSave,
            onAdminAction: handleAdminAction,
            onCancel: handleCancel,
            onRefresh: () => fetchTickets(1, false),
          }}
        />
      </div>
    );
  }
  // success message and button for new ticket
  return (
    <div className="tickets">
      {successMessage && <div className="success-toast">{successMessage}</div>}
      <div className="tickets__header">
        <div className="tickets__header-left">
          <h3 className="settings-section-title">Tickets Management</h3>
          <span className="badge-count">{badgeCount} tickets</span>
        </div>
        <div className="tickets__header-right">
          {!isAdmin && (
            <button
              className="btn-action btn-action--primary"
              onClick={handleAddNew}
            >
              + New Ticket
            </button>
          )}
        </div>
      </div>
      {/* ticke dropdowns with my custom component */}
      <div className="tickets__filters">
        <input
          type="text"
          className="form-control settings-search"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={handleFilterChange(setSearchTerm)}
        />
        <CustomDropdownSelect
          value={filterStatus}
          onChange={handleFilterChange(setFilterStatus)}
          options={STATUS_FILTER_OPTIONS}
        />
        <CustomDropdownSelect
          value={filterPriority}
          onChange={handleFilterChange(setFilterPriority)}
          options={PRIORITY_FILTER_OPTIONS}
        />
        <CustomDropdownSelect
          value={filterCategory}
          onChange={handleFilterChange(setFilterCategory)}
          options={CATEGORY_FILTER_OPTIONS}
        />
      </div>
        {/* ticke table view */}
      <TicketTableView
        tickets={displayedTickets}
        currentRole={currentRole}
        loading={loading}
        onView={handleView}
        onDelete={handleDeleteClick}
        loadMoreRef={loadMoreRef}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
      {/* delete modal */}
      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemLabel="ticket"
        itemPreview={ticketToDelete?.subject}
      />
    </div>
  );
};

export default Tickets;
