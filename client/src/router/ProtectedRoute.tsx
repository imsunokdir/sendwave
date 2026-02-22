import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dock from "../component/Dock";
import { motion } from "framer-motion";
import { navigationDirection } from "../component/Dock";

let isFirstRender = true;

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="min-h-screen bg-gray-950" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const shouldAnimate = !isFirstRender;
  if (isFirstRender) isFirstRender = false;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <motion.div
        key={location.pathname}
        initial={{
          opacity: shouldAnimate ? 0 : 1,
          x: shouldAnimate ? 60 * navigationDirection.value : 0,
        }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="pb-24"
      >
        <Outlet />
      </motion.div>
      <Dock />
    </div>
  );
}
