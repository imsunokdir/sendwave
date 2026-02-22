import { useState } from "react";
import { RefreshCw, Check } from "lucide-react";

const INTERVAL_OPTIONS = [
  { label: "Every 5 minutes", value: "5" },
  { label: "Every 15 minutes", value: "15" },
  { label: "Every 30 minutes", value: "30" },
  { label: "Every hour", value: "60" },
];

export default function SyncPreferences() {
  const [selected, setSelected] = useState("15");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // wire to API later: await saveSyncInterval(selected);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <RefreshCw size={14} color="#6366f1" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
          Sync Interval
        </span>
      </div>

      {/* Options */}
      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px 0" }}>
          How often should your email accounts sync automatically?
        </p>
        {INTERVAL_OPTIONS.map((opt) => {
          const active = selected === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 10,
                cursor: "pointer",
                border: `1px solid ${active ? "#6366f1" : "#e5e7eb"}`,
                background: active ? "#f5f3ff" : "#f9fafb",
                transition: "all .15s",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#4f46e5" : "#374151",
                }}
              >
                {opt.label}
              </span>
              {active && <Check size={14} color="#6366f1" />}
            </div>
          );
        })}

        <button
          onClick={handleSave}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#4f46e5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = saved ? "#22c55e" : "#6366f1";
          }}
          style={{
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "9px 16px",
            background: saved ? "#22c55e" : "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all .2s",
            alignSelf: "flex-start",
          }}
        >
          {saved ? (
            <>
              <Check size={13} /> Saved!
            </>
          ) : (
            "Save preference"
          )}
        </button>
      </div>
    </div>
  );
}
