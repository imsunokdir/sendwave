import { useState } from "react";
import { Plus, Trash2, Bell, BellOff, Power, Clock } from "lucide-react";
import { useAccounts } from "../../context/AccountsContext";
import type { Account } from "../../context/AccountsContext";
import {
  addEmailAccountService,
  deleteEmailAccountService,
  toggleSyncService,
  toggleNotificationsService,
} from "../../services/emailService";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatLastSynced = (date: string): string => {
  if (!date) return "Never";
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const statusColor: Record<string, string> = {
  synced: "#22c55e",
  error: "#ef4444",
  syncing: "#3b82f6",
  idle: "#9ca3af",
};

const providerStyle: Record<
  string,
  { letter: string; bg: string; color: string }
> = {
  gmail: { letter: "G", bg: "#fef2f2", color: "#ef4444" },
  outlook: { letter: "O", bg: "#eff6ff", color: "#3b82f6" },
  yahoo: { letter: "Y", bg: "#faf5ff", color: "#9333ea" },
};

// ─── Icon button ──────────────────────────────────────────────────────────────
function IconBtn({
  onClick,
  title,
  active = false,
  activeColor = "#6366f1",
  hoverColor = "#6b7280",
  children,
}: {
  onClick: () => void;
  title?: string;
  active?: boolean;
  activeColor?: string;
  hoverColor?: string;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        border: "none",
        background: hov ? "#f3f4f6" : "transparent",
        color: active ? activeColor : hov ? hoverColor : "#9ca3af",
        cursor: "pointer",
        transition: "all .15s",
      }}
    >
      {children}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EmailAccounts() {
  const { accounts, isLoading, setAccounts, refetch } = useAccounts();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    imapHost: "",
    imapPort: "993",
    imapTLS: true,
    provider: "gmail",
  });

  const setAccountLoading = (id: string, val: boolean) =>
    setLoadingIds((p) => {
      const n = new Set(p);
      val ? n.add(id) : n.delete(id);
      return n;
    });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    setError("");
    setSubmitting(true);
    try {
      await addEmailAccountService({
        ...form,
        imapPort: parseInt(form.imapPort),
      });
      setShowForm(false);
      setForm({
        email: "",
        password: "",
        imapHost: "",
        imapPort: "993",
        imapTLS: true,
        provider: "gmail",
      });
      refetch(); // full refetch so new account gets server _id
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this account?")) return;
    setAccountLoading(id, true);
    try {
      await deleteEmailAccountService(id);
      setAccounts((p) => p.filter((a) => a._id !== id)); // optimistic
    } catch {
      console.error("Failed to delete account");
    } finally {
      setAccountLoading(id, false);
    }
  };

  const handleToggleSync = async (id: string, current: boolean) => {
    setAccountLoading(id, true);
    try {
      await toggleSyncService(id);
      setAccounts((p) =>
        p.map((a) => (a._id === id ? { ...a, isActive: !current } : a)),
      );
    } catch {
      console.error("Failed to toggle sync");
    } finally {
      setAccountLoading(id, false);
    }
  };

  const handleToggleNotifications = async (id: string, current: boolean) => {
    setAccountLoading(id, true);
    try {
      await toggleNotificationsService(id);
      setAccounts((p) =>
        p.map((a) =>
          a._id === id ? { ...a, notificationsEnabled: !current } : a,
        ),
      );
    } catch {
      console.error("Failed to toggle notifications");
    } finally {
      setAccountLoading(id, false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}
      >
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── Account cards ── */}
      {accounts.length === 0 && !showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px dashed #d1d5db",
            borderRadius: 14,
            padding: "36px 20px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 13,
          }}
        >
          No accounts connected yet.
        </div>
      )}

      {accounts.map((acc: Account) => {
        const busy = loadingIds.has(acc._id);
        const p = providerStyle[acc.provider] ?? {
          letter: "✉",
          bg: "#f9fafb",
          color: "#6b7280",
        };

        return (
          <div
            key={acc._id}
            style={{
              position: "relative",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,.05)",
            }}
          >
            {/* Busy overlay */}
            {busy && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(243,244,246,.8)",
                  backdropFilter: "blur(3px)",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid #d1d5db",
                    borderTopColor: "#6b7280",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                  }}
                />
              </div>
            )}

            {/* Provider badge */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: p.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                color: p.color,
                flexShrink: 0,
              }}
            >
              {p.letter}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#111827",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {acc.email}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 3,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: statusColor[acc.syncStatus] ?? "#9ca3af",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    textTransform: "capitalize",
                  }}
                >
                  {acc.syncStatus}
                </span>
                <span style={{ color: "#d1d5db" }}>·</span>
                <Clock size={11} color="#9ca3af" />
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {formatLastSynced(acc.lastSyncedDate)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 2 }}>
              <IconBtn
                onClick={() =>
                  handleToggleNotifications(acc._id, acc.notificationsEnabled)
                }
                active={acc.notificationsEnabled}
                activeColor="#f59e0b"
                title={acc.notificationsEnabled ? "Mute" : "Unmute"}
              >
                {acc.notificationsEnabled ? (
                  <Bell size={15} />
                ) : (
                  <BellOff size={15} />
                )}
              </IconBtn>
              <IconBtn
                onClick={() => handleToggleSync(acc._id, acc.isActive)}
                active={acc.isActive}
                activeColor="#22c55e"
                title={acc.isActive ? "Pause sync" : "Resume sync"}
              >
                <Power size={15} />
              </IconBtn>
              <IconBtn
                onClick={() => handleDelete(acc._id)}
                hoverColor="#ef4444"
                title="Remove account"
              >
                <Trash2 size={15} />
              </IconBtn>
            </div>
          </div>
        );
      })}

      {/* ── Add account button ── */}
      <button
        onClick={() => setShowForm(!showForm)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#6366f1";
          e.currentTarget.style.color = "#6366f1";
          e.currentTarget.style.background = "#f5f3ff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#d1d5db";
          e.currentTarget.style.color = "#6b7280";
          e.currentTarget.style.background = "transparent";
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "11px 16px",
          border: "1.5px dashed #d1d5db",
          borderRadius: 14,
          background: "transparent",
          color: "#6b7280",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all .15s",
        }}
      >
        <Plus size={15} /> Connect account
      </button>

      {/* ── Inline form ── */}
      {showForm && (
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              margin: 0,
            }}
          >
            New email account
          </p>
          {error && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>
          )}

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {(
              [
                ["email", "email", "Email address"],
                ["password", "password", "App password"],
                ["text", "imapHost", "IMAP host (e.g. imap.gmail.com)"],
                ["number", "imapPort", "IMAP port (993)"],
              ] as [string, keyof typeof form, string][]
            ).map(([type, key, ph]) => (
              <input
                key={key}
                type={type}
                placeholder={ph}
                value={form[key] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{
                  padding: "9px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 13,
                  outline: "none",
                  background: "#fff",
                  color: "#111827",
                  gridColumn: key === "imapHost" ? "span 2" : undefined,
                }}
              />
            ))}
            <select
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              style={{
                padding: "9px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 9,
                fontSize: 13,
                outline: "none",
                background: "#fff",
                color: "#111827",
              }}
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
              <option value="yahoo">Yahoo</option>
              <option value="other">Other</option>
            </select>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              <input
                type="checkbox"
                checked={form.imapTLS}
                onChange={(e) =>
                  setForm({ ...form, imapTLS: e.target.checked })
                }
                style={{ width: 15, height: 15, accentColor: "#6366f1" }}
              />
              Use TLS/SSL
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            <button
              onClick={handleAdd}
              disabled={submitting}
              style={{
                padding: "8px 20px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 500,
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Adding…" : "Add account"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              style={{
                padding: "8px 20px",
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
