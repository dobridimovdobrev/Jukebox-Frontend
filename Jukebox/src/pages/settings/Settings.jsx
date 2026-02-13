import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import "@/pages/settings/Settings.scss";

const ADMIN_ONLY_TABS = ["dashboard", "quiz", "users"];

const ALL_TABS = [
  { id: "dashboard", label: "Dashboard", path: "/settings/dashboard" },
  { id: "quiz", label: "Quiz", path: "/settings/quiz" },
  { id: "profile", label: "Profile", path: "/settings/profile" },
  { id: "artists", label: "Artists", path: "/settings/artists" },
  { id: "songs", label: "Songs", path: "/settings/songs" },
  { id: "playlist", label: "Playlists", path: "/settings/playlists" },
  { id: "users", label: "Users", path: "/settings/users" },
  { id: "tickets", label: "Tickets", path: "/settings/tickets" },
];

const ADMIN_ROLES = ["SuperAdmin"];

const SettingsContent = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r));
  const tabs = isAdmin
    ? ALL_TABS
    : ALL_TABS.filter((tab) => !ADMIN_ONLY_TABS.includes(tab.id));

  return (
    <div className="settings-content">
      {/* Top Bar */}
      <div className="settings-content__top d-flex justify-content-between align-items-center">
        {/*Top Greeting */}
        <h1 className="settings-content__greeting m-0">
          Hi, {user?.firstName}
        </h1>

        {/* Top navigation */}
        <nav className="settings-content__navigation">
          <ul className="d-flex gap-2 border-0 m-0 p-0">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <NavLink
                  to={tab.path}
                  className={({ isActive }) =>
                    `btn-tab ${isActive ? "active" : ""}`
                  }
                >
                  {tab.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content - rendering child or sub routes trough Outlet */}
      <div className="settings-content__main">
        {/* dashboard,quiz,artists, etc... */}
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsContent;
