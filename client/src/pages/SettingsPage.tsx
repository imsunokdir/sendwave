import SyncPreferences from "../component/settings/SyncPreferences";
import DangerZone from "../component/settings/DangerZone";

export default function SettingsPage() {
  return (
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              ⚙️
            </div>
            <h1
              style={{
                fontSize: 23,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              Settings
            </h1>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#9ca3af",
              margin: 0,
              marginLeft: 50,
            }}
          >
            App settings and preferences.
          </p>
        </div>

        {/* ── Sections ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SyncPreferences />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}
