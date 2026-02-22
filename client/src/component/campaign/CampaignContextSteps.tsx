import { useState } from "react";
import { Plus, Trash2, Brain } from "lucide-react";

export interface ContextSnippet {
  id: string;
  text: string;
}

interface CampaignContextStepProps {
  snippets: ContextSnippet[];
  onChange: (snippets: ContextSnippet[]) => void;
}

export default function CampaignContextStep({
  snippets,
  onChange,
}: CampaignContextStepProps) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onChange([...snippets, { id: crypto.randomUUID(), text: trimmed }]);
    setText("");
  };

  const handleDelete = (id: string) => {
    onChange(snippets.filter((s) => s.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Info */}
      <div
        style={{
          background: "#f5f3ff",
          border: "1px solid #e0e7ff",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <Brain
          size={14}
          color="#6366f1"
          style={{ flexShrink: 0, marginTop: 1 }}
        />
        <p
          style={{ fontSize: 12, color: "#4f46e5", margin: 0, lineHeight: 1.6 }}
        >
          Add context snippets for this campaign. The AI will use these when
          suggesting replies to leads who respond — for example your booking
          link, pricing, or key selling points.
        </p>
      </div>

      {/* Input */}
      <div>
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            ⌘ + Enter to add
          </span>
          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              border: "none",
              borderRadius: 9,
              background: text.trim() ? "#6366f1" : "#e5e7eb",
              color: text.trim() ? "#fff" : "#9ca3af",
              fontSize: 12,
              fontWeight: 500,
              cursor: text.trim() ? "pointer" : "default",
              transition: "all .15s",
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {/* Snippets list */}
      {snippets.length === 0 && (
        <div
          style={{
            border: "1px dashed #d1d5db",
            borderRadius: 10,
            padding: "24px 16px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 13,
          }}
        >
          No context added yet. You can skip this step or add snippets above.
        </div>
      )}

      {snippets.map((snippet, i) => (
        <div
          key={snippet.id}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
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
            {snippet.text}
          </p>
          <button
            onClick={() => handleDelete(snippet.id)}
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 7,
              border: "none",
              background: "transparent",
              color: "#9ca3af",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fef2f2";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
