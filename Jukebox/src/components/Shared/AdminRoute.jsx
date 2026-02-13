import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ADMIN_ROLES = ["SuperAdmin"];

const AdminRoute = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.some((r) => ADMIN_ROLES.includes(r));

  if (!isAdmin) {
    return <Navigate to="/settings/artists" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
