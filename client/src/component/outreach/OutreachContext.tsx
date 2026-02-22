import { useState, useEffect } from "react";
import { Plus, Trash2, Brain } from "lucide-react";
import {
  getAllContextService,
  saveContextService,
  deleteContextService,
} from "../../services/outreachService";
import type { ContextItem } from "../../services/outreachService";

export default function OutreachContext() {
  const [items, setItems] = useState<ContextItem[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getAllContextService();
        setItems(data);
      } catch {
        setError("Failed to load context.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError("");
    try {
      await saveContextService(trimmed);
      const data = await getAllContextService(); // refetch to get real _id
      setItems(data);
      setText("");
    } catch {
      setError("Failed to save context.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteContextService(id);
      setItems((p) => p.filter((item) => item._id !== id));
    } catch {
      setError("Failed to delete context.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── Input card ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <Brain size={15} color="#6366f1" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
            Add context snippet
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
            ⌘ + Enter to add
          </span>
        </div>

        {error && (
          <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 8px 0" }}>
            {error}
          </p>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. If interested, share https://cal.com/yourname to book a call"
          rows={3}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 9,
            fontSize: 13,
            color: "#111827",
            lineHeight: 1.6,
            resize: "none",
            outline: "none",
            background: "#f9fafb",
            boxSizing: "border-box",
            fontFamily: "inherit",
            transition: "border-color .15s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
        />

        <button
          onClick={handleAdd}
          disabled={!text.trim() || submitting}
          onMouseEnter={(e) => {
            if (text.trim() && !submitting)
              e.currentTarget.style.background = "#4f46e5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              text.trim() && !submitting ? "#6366f1" : "#e5e7eb";
          }}
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: text.trim() && !submitting ? "#6366f1" : "#e5e7eb",
            color: text.trim() && !submitting ? "#fff" : "#9ca3af",
            border: "none",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 500,
            cursor: text.trim() && !submitting ? "pointer" : "default",
            transition: "all .15s",
          }}
        >
          {submitting ? (
            <>
              <div
                style={{
                  width: 13,
                  height: 13,
                  border: "2px solid #a5b4fc",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin .7s linear infinite",
                }}
              />
              Saving…
            </>
          ) : (
            <>
              <Plus size={14} /> Add context
            </>
          )}
        </button>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "32px 0",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: "3px solid #e5e7eb",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              animation: "spin .7s linear infinite",
            }}
          />
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && items.length === 0 && (
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
          No context snippets yet. Add one above.
        </div>
      )}

      {/* ── List ── */}
      {!isLoading &&
        items.map((item, i) => {
          const deleting = deletingId === item._id;
          return (
            <div
              key={item._id}
              style={{
                position: "relative",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,.05)",
                overflow: "hidden",
                opacity: deleting ? 0.5 : 1,
                transition: "opacity .2s",
              }}
            >
              {deleting && (
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

              {/* Index badge */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {i + 1}
              </div>

              <p
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: "#374151",
                  lineHeight: 1.6,
                  margin: 0,
                  wordBreak: "break-word",
                }}
              >
                {item.text}
              </p>

              <button
                onClick={() => handleDelete(item._id)}
                disabled={!!deletingId}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                  e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9ca3af";
                }}
                style={{
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: "#9ca3af",
                  cursor: deletingId ? "default" : "pointer",
                  flexShrink: 0,
                  transition: "all .15s",
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
    </div>
  );
}
