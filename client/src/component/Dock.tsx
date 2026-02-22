import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Settings, LayoutGrid } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const routeOrder = ["/", "/hub", "/settings", "/profile"];
export const navigationDirection = { value: 1 };

export default function Dock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const items = [
    { icon: <Mail size={20} />, label: "Mail", path: "/" },
    { icon: <LayoutGrid size={20} />, label: "Hub", path: "/hub" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ];

  const handleNavigate = (path: string) => {
    const fromIndex = routeOrder.indexOf(location.pathname);
    const toIndex = routeOrder.indexOf(path);
    navigationDirection.value = toIndex > fromIndex ? 1 : -1;
    navigate(path, { replace: true });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-1 px-3 py-2.5 rounded-full border border-gray-200/60"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(5px) saturate(180%)",
          WebkitBackdropFilter: "blur(3px) saturate(180%)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            title={item.label}
            className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 hover:scale-110 group ${
              location.pathname === item.path
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            {item.icon}
            {location.pathname === item.path && (
              <span className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full" />
            )}
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </span>
          </button>
        ))}

        <div className="w-px h-6 bg-gray-300/60 mx-1" />

        <button
          onClick={() => handleNavigate("/profile")}
          className="relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 hover:scale-110 group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}
