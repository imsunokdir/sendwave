import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { ICampaignCategory } from "../../services/campaignService";

const SUGGESTED = [
  { name: "Interested", emoji: "✅" },
  { name: "Meeting Booked", emoji: "📅" },
  { name: "Not Interested", emoji: "❌" },
  { name: "Out of Office", emoji: "🏖️" },
  { name: "Spam", emoji: "🚫" },
];

interface Props {
  categories: ICampaignCategory[];
  onChange: (categories: ICampaignCategory[]) => void;
}

export default function CampaignCategories({ categories, onChange }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addSuggested = (name: string) => {
    if (categories.find((c) => c.name === name)) return;
    onChange([...categories, { name, stopSequence: false }]);
  };

  const addCustom = () => {
    onChange([...categories, { name: "", stopSequence: false }]);
    setExpandedIndex(categories.length);
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
    onChange(categories.filter((_, i) => i !== index));
    setExpandedIndex(null);
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
          Quick add
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
          No categories yet — used for labeling replies and stopping sequences
        </div>
      )}

      {categories.map((cat, i) => {
        const expanded = expandedIndex === i;
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

            {expanded && (
              <div
                style={{ padding: "12px 14px", borderTop: "1px solid #f3f4f6" }}
              >
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
