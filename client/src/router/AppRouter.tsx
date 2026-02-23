import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

// Lazy loaded pages
const HomePage = lazy(() => import("../pages/HomePage"));
const HubPage = lazy(() => import("../pages/HubPage"));
const EmailDetailPage = lazy(() => import("../pages/EmailDetailPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const NewCampaignPage = lazy(() => import("../pages/NewCampaignPage"));
const CampaignDetailPage = lazy(() => import("../pages/CampaignDetailPage"));
const LoginPage = lazy(() =>
  import("../pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("../pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);

// Fallback spinner — matches your app's light indigo theme
function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4ff 0%, #f9fafb 60%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          width: 28,
          height: 28,
          border: "3px solid #e5e7eb",
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spin .7s linear infinite",
        }}
      />
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading)
    return <div style={{ minHeight: "100vh", background: "#f9fafb" }} />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/email/:id" element={<EmailDetailPage />} />
            <Route path="/hub" element={<HubPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/campaigns/new" element={<NewCampaignPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
