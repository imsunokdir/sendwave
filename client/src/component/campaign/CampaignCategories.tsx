import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send,
  Check,
} from "lucide-react";
import type { ICampaignCategory } from "../../services/campaignService";

const SUGGESTED = [
  { name: "Interested", emoji: "✅" },
  { name: "Meeting Booked", emoji: "📅" },
  { name: "Not Interested", emoji: "❌" },
  { name: "Out of Office", emoji: "🏖️" },
  { name: "Spam", emoji: "🚫" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 13,
  color: "#111827",
  background: "#fff",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

interface Props {
  categories: ICampaignCategory[];
  onChange: (categories: ICampaignCategory[]) => void;
  // For campaign detail page — pass campaignId + onTrigger to enable "Send now"
  campaignId?: string;
  onTrigger?: (categoryName: string) => Promise<void>;
}

export default function CampaignCategories({
  categories,
  onChange,
  campaignId,
  onTrigger,
}: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [sendingKey, setSendingKey] = useState<string | null>(null);
  const [sentKey, setSentKey] = useState<string | null>(null);

  const addSuggested = (name: string) => {
    if (categories.find((c) => c.name === name)) return; // already added
    onChange([
      ...categories,
      { name, context: "", autoReply: false, stopSequence: false },
    ]);
  };

  const addCustom = () => {
    const newCategory: ICampaignCategory = {
      name: "",
      context: "",
      autoReply: false,
      stopSequence: false,
    };
    onChange([...categories, newCategory]);
    setExpandedIndex(categories.length); // auto expand new one
  };

  const update = (
    index: number,
    field: keyof ICampaignCategory,
    value: any,
  ) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const remove = (index: number) => {
    const updated = categories.filter((_, i) => i !== index);
    onChange(updated);
    setExpandedIndex(null);
  };

  const handleSendNow = async (categoryName: string) => {
    if (!onTrigger) return;
    setSendingKey(categoryName);
    try {
      await onTrigger(categoryName);
      setSentKey(categoryName);
      setTimeout(() => setSentKey(null), 3000);
    } catch {
      console.error("Failed to trigger reply");
    } finally {
      setSendingKey(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Suggestions */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: "0 0 8px 0",
          }}
        >
          Quick add suggestions
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SUGGESTED.map((s) => {
            const already = !!categories.find((c) => c.name === s.name);
            return (
              <button
                key={s.name}
                onClick={() => addSuggested(s.name)}
                disabled={already}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  border: `1px solid ${already ? "#e5e7eb" : "#d1d5db"}`,
                  borderRadius: 99,
                  background: already ? "#f9fafb" : "#fff",
                  color: already ? "#d1d5db" : "#374151",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: already ? "default" : "pointer",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                  if (!already) {
                    e.currentTarget.style.borderColor = "#6366f1";
                    e.currentTarget.style.color = "#6366f1";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!already) {
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.color = "#374151";
                  }
                }}
              >
                {s.emoji} {s.name} {already && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category list */}
      {categories.length === 0 && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 13,
            border: "1px dashed #e5e7eb",
            borderRadius: 10,
          }}
        >
          No categories yet — add from suggestions or create custom ones
        </div>
      )}

      {categories.map((cat, i) => {
        const expanded = expandedIndex === i;
        const sent = sentKey === cat.name;
        const sending = sendingKey === cat.name;

        return (
          <div
            key={i}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                cursor: "pointer",
                background: expanded ? "#f9fafb" : "#fff",
              }}
              onClick={() => setExpandedIndex(expanded ? null : i)}
            >
              <input
                type="text"
                placeholder="Category name"
                value={cat.name}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => update(i, "name", e.target.value)}
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#111827",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "inherit",
                }}
              />

              {/* Send now — only on detail page */}
              {onTrigger && cat.name && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendNow(cat.name);
                  }}
                  disabled={sending || !!sendingKey}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 10px",
                    border: `1px solid ${sent ? "#bbf7d0" : "#e5e7eb"}`,
                    borderRadius: 7,
                    background: sent ? "#f0fdf4" : "#f9fafb",
                    color: sent ? "#16a34a" : "#6b7280",
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: sending ? "default" : "pointer",
                  }}
                >
                  {sending ? (
                    <div
                      style={{
                        width: 11,
                        height: 11,
                        border: "2px solid #d1d5db",
                        borderTopColor: "#6366f1",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                      }}
                    />
                  ) : sent ? (
                    <Check size={11} />
                  ) : (
                    <Send size={11} />
                  )}
                  {sent ? "Sent!" : "Send now"}
                </button>
              )}

              {/* Auto-reply toggle */}
              <div
                style={{ display: "flex", alignItems: "center", gap: 5 }}
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ fontSize: 11, color: "#9ca3af" }}>Auto</span>
                <button
                  onClick={() => update(i, "autoReply", !cat.autoReply)}
                  style={{
                    width: 34,
                    height: 20,
                    borderRadius: 99,
                    border: "none",
                    background: cat.autoReply ? "#6366f1" : "#e5e7eb",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background .2s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: cat.autoReply ? 16 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                      transition: "left .2s",
                    }}
                  />
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(i);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              >
                <Trash2 size={14} />
              </button>

              {expanded ? (
                <ChevronUp size={14} color="#9ca3af" />
              ) : (
                <ChevronDown size={14} color="#9ca3af" />
              )}
            </div>

            {/* Expanded settings */}
            {expanded && (
              <div
                style={{
                  padding: "12px 14px",
                  borderTop: "1px solid #f3f4f6",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    AI Reply Instructions
                  </label>
                  <textarea
                    placeholder="e.g. Reply with our pricing page link and mention the free trial..."
                    value={cat.context}
                    onChange={(e) => update(i, "context", e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#6366f1")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#e5e7eb")
                    }
                  />
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={cat.stopSequence}
                    onChange={(e) =>
                      update(i, "stopSequence", e.target.checked)
                    }
                    style={{ width: 14, height: 14, accentColor: "#6366f1" }}
                  />
                  <span style={{ fontSize: 13, color: "#374151" }}>
                    Stop email sequence when this category is detected
                  </span>
                </label>
              </div>
            )}
          </div>
        );
      })}

      {/* Add custom */}
      <button
        onClick={addCustom}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 16px",
          border: "1.5px dashed #d1d5db",
          borderRadius: 10,
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
        <Plus size={14} /> Add custom category
      </button>
    </div>
  );
}
