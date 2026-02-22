import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { CampaignStep } from "../../services/campaignService";

interface StepBuilderProps {
  steps: CampaignStep[];
  onChange: (steps: CampaignStep[]) => void;
}

export default function StepBuilder({ steps, onChange }: StepBuilderProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  const addStep = () => {
    const newStep: CampaignStep = {
      order: steps.length,
      delayDays: steps.length === 0 ? 0 : 3,
      subject: "",
      body: "",
    };
    onChange([...steps, newStep]);
    setExpanded(steps.length);
  };

  const removeStep = (index: number) => {
    const updated = steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i }));
    onChange(updated);
    setExpanded(null);
  };

  const updateStep = (
    index: number,
    field: keyof CampaignStep,
    value: string | number,
  ) => {
    const updated = steps.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    );
    onChange(updated);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 9,
    fontSize: 13,
    color: "#111827",
    background: "#f9fafb",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color .15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {steps.map((step, i) => {
        const isOpen = expanded === i;
        const isFirst = i === 0;

        return (
          <div
            key={i}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {/* Step header */}
            <div
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                cursor: "pointer",
                background: isOpen ? "#f5f3ff" : "#fff",
                transition: "background .15s",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  background: isOpen ? "#6366f1" : "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: isOpen ? "#fff" : "#6b7280",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}
                >
                  {step.subject || `Email ${i + 1}`}
                </span>
                {!isFirst && (
                  <span
                    style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8 }}
                  >
                    · Wait {step.delayDays} day{step.delayDays !== 1 ? "s" : ""}
                  </span>
                )}
                {isFirst && (
                  <span
                    style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8 }}
                  >
                    · Send immediately
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {steps.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStep(i);
                    }}
                    style={{
                      width: 26,
                      height: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      border: "none",
                      background: "transparent",
                      color: "#9ca3af",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ef4444";
                      e.currentTarget.style.background = "#fef2f2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#9ca3af";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                {isOpen ? (
                  <ChevronUp size={14} color="#9ca3af" />
                ) : (
                  <ChevronDown size={14} color="#9ca3af" />
                )}
              </div>
            </div>

            {/* Step body */}
            {isOpen && (
              <div
                style={{
                  padding: "14px",
                  borderTop: "1px solid #f3f4f6",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {!isFirst && (
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
                      Wait (days after previous email)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={step.delayDays}
                      onChange={(e) =>
                        updateStep(
                          i,
                          "delayDays",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      style={{ ...inputStyle, width: 80 }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#6366f1")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = "#e5e7eb")
                      }
                    />
                  </div>
                )}
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
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Email subject line"
                    value={step.subject}
                    onChange={(e) => updateStep(i, "subject", e.target.value)}
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#6366f1")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#e5e7eb")
                    }
                  />
                </div>
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
                    Body
                  </label>
                  <textarea
                    placeholder="Write your email..."
                    value={step.body}
                    rows={5}
                    onChange={(e) => updateStep(i, "body", e.target.value)}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#6366f1")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#e5e7eb")
                    }
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add step */}
      <button
        onClick={addStep}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "11px 16px",
          border: "1.5px dashed #d1d5db",
          borderRadius: 12,
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
        <Plus size={14} /> Add follow-up email
      </button>
    </div>
  );
}
