import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      onMouseEnter={(e) => {
        if (!loggingOut) e.currentTarget.style.background = "#fef2f2";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff";
      }}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "13px 16px",
        background: "#fff",
        border: "1px solid #fecaca",
        borderRadius: 14,
        color: loggingOut ? "#9ca3af" : "#ef4444",
        fontSize: 13,
        fontWeight: 600,
        cursor: loggingOut ? "default" : "pointer",
        transition: "all .15s",
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
      }}
    >
      {loggingOut ? (
        <>
          <div
            style={{
              width: 14,
              height: 14,
              border: "2px solid #d1d5db",
              borderTopColor: "#9ca3af",
              borderRadius: "50%",
              animation: "spin .7s linear infinite",
            }}
          />
          Logging out…
        </>
      ) : (
        <>
          <LogOut size={14} /> Log out
        </>
      )}
    </button>
  );
}
