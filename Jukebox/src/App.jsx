import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import JukeboxLayout from "@/components/Shared/JukeboxLayout/JukeboxLayout";
import SettingsContent from "@/pages/settings/Settings";
import AuthPage from "@/pages/auth/AuthPage";
import ProtectedRoute from "@/components/Shared/ProtectedRoute";
import AdminRoute from "@/components/Shared/AdminRoute";

// settings pages
import Dashboard from "@/pages/settings/dashboard/Dashboard";
import Artists from "@/pages/settings/artists/Artists";
import ArtistForm from "@/pages/settings/artists/ArtistForm";
import Quiz from "@/pages/settings/quiz/Quiz";
import QuizForm from "@/pages/settings/quiz/QuizForm";
import Songs from "@/pages/settings/songs/Songs";
import SongForm from "@/pages/settings/songs/SongForm";
import Playlists from "@/pages/settings/playlists/Playlists";
import PlaylistsForm from "@/pages/settings/playlists/PlaylistsForm";
import Users from "@/pages/settings/users/Users";
import UsersForm from "@/pages/settings/users/UsersForm";
import Profile from "@/pages/settings/profile/Profile";
import Tickets from "@/pages/settings/tickets/Tickets";
import TicketCreateForm from "@/pages/settings/tickets/TicketCreateForm";
import TicketDetail from "@/pages/settings/tickets/TicketDetail";

// redirect pages in my backoffice based on roles
const ADMIN_ROLES = ["SuperAdmin"];
const SettingsRedirect = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r));
  return <Navigate to={isAdmin ? "dashboard" : "profile"} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* authentication page */}
        <Route path="/login" element={<AuthPage />} />

        {/* redirect login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<JukeboxLayout />}>
          {/* nested routes for setting layout*/}
          <Route path="settings" element={<SettingsContent />}>
            <Route index element={<SettingsRedirect />} />

            {/* My superadmin routes*/}
            <Route element={<AdminRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="quiz" element={<Quiz />}>
                <Route path="create" element={<QuizForm />} />
                <Route path="update/:id" element={<QuizForm />} />
              </Route>
              <Route path="users" element={<Users />}>
                <Route path="view/:id" element={<UsersForm />} />
              </Route>
            </Route>

            {/* Shared routes for superadmin and user */}
            <Route path="artists" element={<Artists />}>
              <Route path="create" element={<ArtistForm />} />
              <Route path="update/:id" element={<ArtistForm />} />
            </Route>
            <Route path="songs" element={<Songs />}>
              <Route path="create" element={<SongForm />} />
              <Route path="update/:id" element={<SongForm />} />
            </Route>
            <Route path="playlists" element={<Playlists />}>
              <Route path="create" element={<PlaylistsForm />} />
              <Route path="update/:id" element={<PlaylistsForm />} />
            </Route>
            <Route path="tickets" element={<Tickets />}>
              <Route path="create" element={<TicketCreateForm />} />
              <Route path="view/:id" element={<TicketDetail />} />
            </Route>
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
