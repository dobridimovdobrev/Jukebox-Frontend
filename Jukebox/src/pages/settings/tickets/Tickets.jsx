import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useMatch } from "react-router-dom";
import { useSelector } from "react-redux";
import "@/pages/settings/tickets/Tickets.scss";
import TicketTableView from "@/pages/settings/tickets/TicketTableView";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import DeleteModal from "@/components/Shared/DeleteModal";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import ticketService from "@/services/ticketService";
import useSuccessMessage from "@/hooks/useSuccessMessage";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "answered", label: "Answered" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Bug Report", label: "Bug Report" },
  { value: "Feature Request", label: "Feature Request" },
  { value: "Account Issue", label: "Account Issue" },
  { value: "Playback Issue", label: "Playback Issue" },
  { value: "General", label: "General" },
];

const ADMIN_ROLES = ["SuperAdmin"];

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

  // States
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentRole = isAdmin ? "admin" : "user";
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  // Fetch tickets from backend
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (currentRole === "admin") {
        const result = await ticketService.search({ PageSize: 100 });
        data = result.items || result;
      } else {
        data = await ticketService.getMy();
      }
      const userName = user ? `${user.firstName} ${user.lastName}` : "User";
      const mapped = (Array.isArray(data) ? data : []).map((t) => ({
        ...mapBackendTicket(t),
        createdBy: t.userFullName || userName,
      }));
      setTickets(mapped);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [currentRole, user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filter
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.subject
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || ticket.priority === filterPriority;
    const matchesCategory =
      filterCategory === "all" || ticket.category === filterCategory;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Infinite scroll
  const { displayCount, loadingMore, hasMore, loadMoreRef, resetDisplayCount } =
    useInfiniteScroll({ itemsPerPage: 30, totalItems: filteredTickets.length });

  const displayedTickets = filteredTickets.slice(0, displayCount);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    resetDisplayCount();
  };

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
      await fetchTickets();
      navigate("/settings/tickets");
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  // Admin action
  const handleAdminAction = async (ticketId, { message, attachment, newStatus, note }) => {
    try {
      await ticketService.addAction(ticketId, {
        message: message || null,
        attachmentUrl: attachment || null,
        newStatus: newStatus || null,
        note: note || null,
      });
      await fetchTickets();
    } catch (err) {
      console.error("Failed to perform action:", err);
    }
  };

  // Delete
  const handleDeleteClick = (ticket) => {
    setTicketToDelete(ticket);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (ticketToDelete) {
      try {
        await ticketService.delete(ticketToDelete.id);
        await fetchTickets();
      } catch (err) {
        console.error("Failed to delete ticket:", err);
      }
    }
    setIsDeleteDialogOpen(false);
    setTicketToDelete(null);
  };

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
            onRefresh: fetchTickets,
          }}
        />
      </div>
    );
  }

  return (
    <div className="tickets">
      {successMessage && <div className="success-toast">{successMessage}</div>}
      <div className="tickets__header">
        <div className="tickets__header-left">
          <h3 className="settings-section-title">Tickets Management</h3>
          <span className="badge-count">{filteredTickets.length} tickets</span>
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

      {loading ? (
        <div className="tickets__loading">Loading tickets...</div>
      ) : (
        <TicketTableView
          tickets={displayedTickets}
          currentRole={currentRole}
          onView={handleView}
          onDelete={handleDeleteClick}
          loadMoreRef={loadMoreRef}
          hasMore={hasMore}
          loadingMore={loadingMore}
        />
      )}

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