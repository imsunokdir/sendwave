import { useState, useRef } from "react";
import { Upload, ClipboardPaste, FileText, X } from "lucide-react";

interface LeadUploaderProps {
  onLeadsParsed: (raw: string, type: "raw" | "csv") => void;
  leadCount: number;
}

type Mode = "paste" | "csv" | "txt";

export default function LeadUploader({
  onLeadsParsed,
  leadCount,
}: LeadUploaderProps) {
  const [mode, setMode] = useState<Mode>("paste");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (val: string) => {
    setText(val);
    onLeadsParsed(val, "raw");
  };

  const handleFile = (file: File) => {
    const isCsv = file.name.endsWith(".csv");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      onLeadsParsed(content, isCsv ? "csv" : "raw");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setText("");
    setFileName("");
    onLeadsParsed("", "raw");
    if (fileRef.current) fileRef.current.value = "";
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "8px 10px",
    border: "none",
    borderRadius: 9,
    fontSize: 12,
    fontWeight: active ? 600 : 500,
    background: active ? "#fff" : "transparent",
    color: active ? "#111827" : "#6b7280",
    cursor: "pointer",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,.08)" : "none",
    transition: "all .15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Mode tabs */}
      <div
        style={{
          display: "flex",
          gap: 3,
          background: "#e5e7eb",
          borderRadius: 11,
          padding: 3,
        }}
      >
        <button
          style={tabStyle(mode === "paste")}
          onClick={() => setMode("paste")}
        >
          <ClipboardPaste size={13} /> Paste emails
        </button>
        <button style={tabStyle(mode === "csv")} onClick={() => setMode("csv")}>
          <FileText size={13} /> Upload CSV
        </button>
        <button style={tabStyle(mode === "txt")} onClick={() => setMode("txt")}>
          <Upload size={13} /> Upload TXT
        </button>
      </div>

      {/* Paste mode */}
      {mode === "paste" && (
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
            One email per line
          </label>
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={"john@example.com\njane@company.com\nbob@startup.io"}
            rows={6}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: 9,
              fontSize: 13,
              color: "#111827",
              background: "#f9fafb",
              outline: "none",
              resize: "vertical",
              fontFamily: "monospace",
              boxSizing: "border-box",
              lineHeight: 1.8,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          />
        </div>
      )}

      {/* File upload mode */}
      {(mode === "csv" || mode === "txt") && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          style={{
            border: "2px dashed #d1d5db",
            borderRadius: 12,
            padding: "32px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: "#f9fafb",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#6366f1";
            e.currentTarget.style.background = "#f5f3ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.background = "#f9fafb";
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept={mode === "csv" ? ".csv" : ".txt"}
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {fileName ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <FileText size={16} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>
                {fileName}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload
                size={22}
                color="#9ca3af"
                style={{ margin: "0 auto 8px" }}
              />
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#6b7280",
                  margin: "0 0 4px 0",
                }}
              >
                Drop your {mode.toUpperCase()} here or click to browse
              </p>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                {mode === "csv"
                  ? "First column or column named 'email' will be used"
                  : "One email address per line"}
              </p>
            </>
          )}
        </div>
      )}

      {/* Lead count badge */}
      {leadCount > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 9,
          }}
        >
          <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
            ✓ {leadCount} valid email{leadCount !== 1 ? "s" : ""} found
          </span>
          <button
            onClick={clear}
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
