import { useState } from "react";
import type { ReactNode } from "react";
import {
  Mail,
  Send,
  RefreshCw,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Power,
  Settings,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Account {
  _id: string;
  email: string;
  provider: string;
  isActive: boolean;
  notificationsEnabled: boolean;
  syncStatus: string;
  lastSyncedDate: string;
}

interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused";
  sent: number;
  replies: number;
  scheduled: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockAccounts: Account[] = [
  {
    _id: "1",
    email: "alice@gmail.com",
    provider: "gmail",
    isActive: true,
    notificationsEnabled: true,
    syncStatus: "synced",
    lastSyncedDate: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    _id: "2",
    email: "alice@outlook.com",
    provider: "outlook",
    isActive: false,
    notificationsEnabled: false,
    syncStatus: "error",
    lastSyncedDate: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Q2 Re-engagement",
    status: "active",
    sent: 142,
    replies: 31,
    scheduled: "Daily 9am",
  },
  {
    id: "2",
    name: "Cold Intro — SaaS",
    status: "paused",
    sent: 88,
    replies: 12,
    scheduled: "Mon/Wed/Fri",
  },
];

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

const statusColors: Record<string, string> = {
  synced: "#22c55e",
  error: "#ef4444",
  syncing: "#3b82f6",
  paused: "#f59e0b",
  active: "#22c55e",
};

const StatusDot = ({ status }: { status: string }) => (
  <span
    style={{
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: statusColors[status] ?? "#9ca3af",
      display: "inline-block",
      flexShrink: 0,
    }}
  />
);

// ─── Icon Button ──────────────────────────────────────────────────────────────
interface IconBtnProps {
  onClick: () => void;
  title?: string;
  active?: boolean;
  activeColor?: string;
  hoverColor?: string;
  children: ReactNode;
}

function IconBtn({
  onClick,
  title,
  active = false,
  activeColor = "#6366f1",
  hoverColor = "#6366f1",
  children,
}: IconBtnProps) {
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

// ─── Tab: Email Accounts ──────────────────────────────────────────────────────
function EmailAccountsTab() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [showForm, setShowForm] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    email: "",
    password: "",
    imapHost: "",
    imapPort: "993",
    provider: "gmail",
    imapTLS: true,
  });

  const setLoading = (id: string, val: boolean) =>
    setLoadingIds((p) => {
      const n = new Set(p);
      val ? n.add(id) : n.delete(id);
      return n;
    });

  const toggle = async (id: string, field: keyof Account) => {
    setLoading(id, true);
    await new Promise((r) => setTimeout(r, 800));
    setAccounts((p) =>
      p.map((a) =>
        a._id === id ? { ...a, [field]: !a[field as keyof Account] } : a,
      ),
    );
    setLoading(id, false);
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this account?")) return;
    setLoading(id, true);
    await new Promise((r) => setTimeout(r, 600));
    setAccounts((p) => p.filter((a) => a._id !== id));
    setLoading(id, false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {accounts.map((acc) => {
        const busy = loadingIds.has(acc._id);
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
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              </div>
            )}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: acc.provider === "gmail" ? "#fef2f2" : "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontWeight: 700,
                flexShrink: 0,
                color: acc.provider === "gmail" ? "#ef4444" : "#3b82f6",
              }}
            >
              {acc.provider === "gmail"
                ? "G"
                : acc.provider === "outlook"
                  ? "O"
                  : "✉"}
            </div>
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
                <StatusDot status={acc.syncStatus} />
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
            <div style={{ display: "flex", gap: 2 }}>
              <IconBtn
                onClick={() => toggle(acc._id, "notificationsEnabled")}
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
                onClick={() => toggle(acc._id, "isActive")}
                active={acc.isActive}
                activeColor="#22c55e"
                title={acc.isActive ? "Pause sync" : "Resume sync"}
              >
                <Power size={15} />
              </IconBtn>
              <IconBtn
                onClick={() => remove(acc._id)}
                hoverColor="#ef4444"
                title="Remove"
              >
                <Trash2 size={15} />
              </IconBtn>
            </div>
          </div>
        );
      })}

      <button
        onClick={() => setShowForm(!showForm)}
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
      >
        <Plus size={15} /> Connect account
      </button>

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
          <p style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
            New email account
          </p>
          {(["Email address", "App password", "IMAP host"] as const).map(
            (ph) => (
              <input
                key={ph}
                placeholder={ph}
                style={{
                  padding: "9px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 13,
                  outline: "none",
                  background: "#fff",
                  color: "#111827",
                }}
              />
            ),
          )}
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
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{
                padding: "8px 18px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "8px 18px",
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

// ─── Tab: Outreach ────────────────────────────────────────────────────────────
function OutreachTab() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {campaigns.map((c) => (
        <div
          key={c.id}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <StatusDot status={c.status} />
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#111827",
                flex: 1,
              }}
            >
              {c.name}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 9px",
                borderRadius: 99,
                background: c.status === "active" ? "#dcfce7" : "#fef9c3",
                color: c.status === "active" ? "#16a34a" : "#ca8a04",
                textTransform: "capitalize",
              }}
            >
              {c.status}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {(
              [
                ["Sent", c.sent],
                ["Replies", c.replies],
                ["Schedule", c.scheduled],
              ] as [string, string | number][]
            ).map(([label, val]) => (
              <div
                key={label}
                style={{
                  background: "#f9fafb",
                  borderRadius: 9,
                  padding: "8px 10px",
                }}
              >
                <div
                  style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}
                >
                  {label}
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
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
        }}
      >
        <Plus size={15} /> New campaign
      </button>
    </div>
  );
}

// ─── Tab: Manual Sync ─────────────────────────────────────────────────────────
function ManualSyncTab() {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [synced, setSynced] = useState<string[]>([]);

  const sync = async (id: string) => {
    setSyncing(id);
    await new Promise((r) => setTimeout(r, 1800));
    setSyncing(null);
    setSynced((p) => [...p, id]);
    setTimeout(() => setSynced((p) => p.filter((x) => x !== id)), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 12,
          padding: "12px 14px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <AlertCircle
          size={15}
          color="#d97706"
          style={{ flexShrink: 0, marginTop: 1 }}
        />
        <p
          style={{ margin: 0, fontSize: 13, color: "#92400e", lineHeight: 1.5 }}
        >
          Manual sync pulls the latest emails immediately. Accounts sync
          automatically every 15 minutes.
        </p>
      </div>
      {mockAccounts.map((acc) => (
        <div
          key={acc._id}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              flexShrink: 0,
              color: "#6b7280",
            }}
          >
            {acc.provider === "gmail" ? "G" : "O"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
              {acc.email}
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
              Last synced {formatLastSynced(acc.lastSyncedDate)}
            </div>
          </div>
          <button
            onClick={() => sync(acc._id)}
            disabled={syncing === acc._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: synced.includes(acc._id) ? "#dcfce7" : "#f3f4f6",
              color: synced.includes(acc._id) ? "#16a34a" : "#374151",
              border: "none",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 500,
              cursor: syncing === acc._id ? "default" : "pointer",
              transition: "all .2s",
            }}
          >
            {syncing === acc._id ? (
              <>
                <div
                  style={{
                    width: 13,
                    height: 13,
                    border: "2px solid #9ca3af",
                    borderTopColor: "#374151",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />{" "}
                Syncing…
              </>
            ) : synced.includes(acc._id) ? (
              <>
                <Check size={13} /> Done!
              </>
            ) : (
              <>
                <RefreshCw size={13} /> Sync now
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Tab Config ───────────────────────────────────────────────────────────────
interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
  component: ReactNode;
}

const TABS: Tab[] = [
  {
    id: "accounts",
    label: "Email Accounts",
    icon: <Mail size={15} />,
    component: <EmailAccountsTab />,
  },
  {
    id: "outreach",
    label: "Outreach",
    icon: <Send size={15} />,
    component: <OutreachTab />,
  },
  {
    id: "sync",
    label: "Manual Sync",
    icon: <RefreshCw size={15} />,
    component: <ManualSyncTab />,
  },
];

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function EmailSettingsPage() {
  const [activeTab, setActiveTab] = useState("accounts");
  const current = TABS.find((t) => t.id === activeTab)!;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f4ff 0%, #f9fafb 60%)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "40px 16px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Settings size={18} color="#fff" />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
                Email Settings
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#9ca3af", marginLeft: 46 }}>
              Manage your accounts, campaigns & sync
            </p>
          </div>

          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "#e5e7eb",
              borderRadius: 14,
              padding: 4,
              marginBottom: 20,
            }}
          >
            {TABS.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "9px 10px",
                    border: "none",
                    borderRadius: 11,
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    background: active ? "#fff" : "transparent",
                    color: active ? "#111827" : "#6b7280",
                    cursor: "pointer",
                    boxShadow: active ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                    transition: "all .18s",
                  }}
                >
                  <span style={{ color: active ? "#6366f1" : "#9ca3af" }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div key={activeTab} style={{ animation: "fadeIn .2s ease-out" }}>
            {current.component}
          </div>
        </div>
      </div>
    </>
  );
}
