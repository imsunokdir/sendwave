import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

export default function DangerZone() {
  const [confirm, setConfirm] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #fecaca",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #fef2f2",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#fef2f2",
        }}
      >
        <AlertTriangle size={14} color="#ef4444" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>
          Danger Zone
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
                margin: "0 0 2px 0",
              }}
            >
              Delete account
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
              Permanently delete your account and all associated data. This
              cannot be undone.
            </p>
          </div>

          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#fecaca";
                e.currentTarget.style.color = "#9ca3af";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                border: "1px solid #fecaca",
                borderRadius: 9,
                background: "#fff",
                color: "#9ca3af",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                flexShrink: 0,
                transition: "all .15s",
              }}
            >
              <Trash2 size={13} /> Delete
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setConfirm(false)}
                style={{
                  padding: "8px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 9,
                  background: "#f9fafb",
                  color: "#6b7280",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => alert("Wire delete account API here")}
                style={{
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: 9,
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Confirm delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
