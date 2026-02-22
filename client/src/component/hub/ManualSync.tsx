import { useState } from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { useAccounts } from "../../context/AccountsContext";
import type { Account } from "../../context/AccountsContext";

const formatLastSynced = (date: string): string => {
  if (!date) return "Never";
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const providerStyle: Record<
  string,
  { letter: string; bg: string; color: string }
> = {
  gmail: { letter: "G", bg: "#fef2f2", color: "#ef4444" },
  outlook: { letter: "O", bg: "#eff6ff", color: "#3b82f6" },
  yahoo: { letter: "Y", bg: "#faf5ff", color: "#9333ea" },
};

export default function ManualSync() {
  const { accounts } = useAccounts();
  const [days, setDays] = useState("7");
  const [syncing, setSyncing] = useState<string | null>(null);
  const [synced, setSynced] = useState<string[]>([]);

  const sync = async (id: string) => {
    setSyncing(id);
    // swap this for your real API call, e.g:
    // await manualSyncService(id, parseInt(days));
    await new Promise((r) => setTimeout(r, 1800));
    setSyncing(null);
    setSynced((p) => [...p, id]);
    setTimeout(() => setSynced((p) => p.filter((x) => x !== id)), 3000);
  };

  const syncAll = async () => {
    for (const acc of accounts) {
      await sync(acc._id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── Info + controls card ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,.05)",
        }}
      >
        {/* Warning banner */}
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <AlertCircle
            size={14}
            color="#d97706"
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#92400e",
              lineHeight: 1.5,
            }}
          >
            Manual sync pulls emails immediately. Accounts sync automatically
            every 15 minutes.
          </p>
        </div>

        {/* Days control */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
            Sync last
          </span>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            min="1"
            max="365"
            style={{
              width: 64,
              padding: "7px 10px",
              textAlign: "center",
              border: "1px solid #e5e7eb",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              color: "#111827",
              outline: "none",
              background: "#f9fafb",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          />
          <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
            days
          </span>

          <button
            onClick={syncAll}
            disabled={!!syncing || accounts.length === 0}
            onMouseEnter={(e) => {
              if (!syncing) e.currentTarget.style.background = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#6366f1";
            }}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 500,
              cursor: syncing ? "default" : "pointer",
              opacity: syncing ? 0.6 : 1,
              transition: "all .15s",
            }}
          >
            <RefreshCw size={13} /> Sync all
          </button>
        </div>
      </div>

      {/* ── Per-account rows ── */}
      {accounts.length === 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px dashed #d1d5db",
            borderRadius: 14,
            padding: "32px 20px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 13,
          }}
        >
          No accounts connected. Add one in the Email Accounts tab.
        </div>
      )}

      {accounts.map((acc: Account) => {
        const p = providerStyle[acc.provider] ?? {
          letter: "✉",
          bg: "#f9fafb",
          color: "#6b7280",
        };
        const isSyncing = syncing === acc._id;
        const isDone = synced.includes(acc._id);

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
              boxShadow: "0 1px 3px rgba(0,0,0,.05)",
              overflow: "hidden",
            }}
          >
            {/* Syncing overlay */}
            {isSyncing && (
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
                    borderTopColor: "#6366f1",
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
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                Last synced {formatLastSynced(acc.lastSyncedDate)}
              </div>
            </div>

            {/* Sync button */}
            <button
              onClick={() => sync(acc._id)}
              disabled={isSyncing || !!syncing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: isDone ? "#dcfce7" : "#f3f4f6",
                color: isDone ? "#16a34a" : "#374151",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 500,
                cursor: isSyncing || syncing ? "default" : "pointer",
                transition: "all .2s",
                opacity: !isSyncing && syncing ? 0.4 : 1,
              }}
            >
              {isDone ? (
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
        );
      })}
    </div>
  );
}
