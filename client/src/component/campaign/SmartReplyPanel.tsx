import { useState } from "react";
import { Zap, Bot, Send, X, Check, RefreshCw } from "lucide-react";
import { api } from "../../services/api";

interface SmartReplyPanelProps {
  campaignId: string;
  repliedLeads: { email: string; status: string }[];
  onDone: () => void; // refresh campaign after actions
}

interface DraftReply {
  leadEmail: string;
  draft: string;
  subject: string;
  category: string;
  editing: boolean;
}

export default function SmartReplyPanel({
  campaignId,
  repliedLeads,
  onDone,
}: SmartReplyPanelProps) {
  const [mode, setMode] = useState<"idle" | "auto" | "one-by-one">("idle");
  const [loading, setLoading] = useState(false);
  const [autoResult, setAutoResult] = useState<{
    sent: number;
    failed: number;
  } | null>(null);
  const [drafts, setDrafts] = useState<DraftReply[]>([]);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [sendingFor, setSendingFor] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

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
  };

  // ── Auto reply all Interested ──────────────────────────────────────────────
  const handleAutoReply = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post(`/campaigns/${campaignId}/auto-reply`);
      setAutoResult(res.data);
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.message || "Auto-reply failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Generate draft for one lead ────────────────────────────────────────────
  const handleGenerateDraft = async (leadEmail: string) => {
    setGeneratingFor(leadEmail);
    setError("");
    try {
      const res = await api.get(`/campaigns/${campaignId}/draft-reply`, {
        params: { leadEmail },
      });
      setDrafts((p) => {
        const exists = p.find((d) => d.leadEmail === leadEmail);
        if (exists)
          return p.map((d) =>
            d.leadEmail === leadEmail
              ? { ...d, ...res.data, editing: false }
              : d,
          );
        return [...p, { leadEmail, ...res.data, editing: false }];
      });
    } catch {
      setError(`Could not generate draft for ${leadEmail}`);
    } finally {
      setGeneratingFor(null);
    }
  };

  // ── Send single reply ──────────────────────────────────────────────────────
  const handleSendReply = async (draft: DraftReply) => {
    setSendingFor(draft.leadEmail);
    try {
      await api.post(`/campaigns/${campaignId}/send-reply`, {
        leadEmail: draft.leadEmail,
        subject: draft.subject,
        body: draft.draft,
      });
      setDrafts((p) => p.filter((d) => d.leadEmail !== draft.leadEmail));
      onDone();
    } catch {
      setError(`Failed to send reply to ${draft.leadEmail}`);
    } finally {
      setSendingFor(null);
    }
  };

  // ── Bulk mark ──────────────────────────────────────────────────────────────
  const handleBulkMark = async (
    category: string,
    status: "opted-out" | "contacted",
  ) => {
    setBulkLoading(category);
    try {
      await api.post(`/campaigns/${campaignId}/bulk-mark`, {
        category,
        status,
      });
      onDone();
    } catch {
      setError("Bulk mark failed");
    } finally {
      setBulkLoading(null);
    }
  };

  if (repliedLeads.length === 0) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 18px",
          borderBottom: "1px solid #f3f4f6",
          background: "#f5f3ff",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Bot size={14} color="#6366f1" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>
          Smart Reply
        </span>
        <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 2 }}>
          ({repliedLeads.length} replied lead
          {repliedLeads.length !== 1 ? "s" : ""})
        </span>
      </div>

      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {error && (
          <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>
        )}

        {/* Mode selector */}
        {mode === "idle" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                setMode("auto");
                setAutoResult(null);
              }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "14px 12px",
                border: "1.5px solid #e0e7ff",
                borderRadius: 12,
                background: "#f5f3ff",
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.background = "#ede9fe";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e0e7ff";
                e.currentTarget.style.background = "#f5f3ff";
              }}
            >
              <Zap size={20} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>
                Auto reply
              </span>
              <span
                style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}
              >
                AI replies to all Interested leads at once
              </span>
            </button>

            <button
              onClick={() => setMode("one-by-one")}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "14px 12px",
                border: "1.5px solid #e5e7eb",
                borderRadius: 12,
                background: "#f9fafb",
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.background = "#f5f3ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.background = "#f9fafb";
              }}
            >
              <Bot size={20} color="#6b7280" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                One by one
              </span>
              <span
                style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}
              >
                Review & edit AI drafts per lead
              </span>
            </button>
          </div>
        )}

        {/* ── Auto reply mode ── */}
        {mode === "auto" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 9,
                padding: "10px 14px",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "#92400e",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                ⚡ This will automatically send AI-generated replies to all
                leads categorized as <strong>Interested</strong>. They will be
                marked as opted-out after reply.
              </p>
            </div>

            {autoResult ? (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 9,
                  padding: "12px 14px",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "#16a34a",
                    margin: "0 0 4px 0",
                    fontWeight: 600,
                  }}
                >
                  ✓ Auto-reply complete
                </p>
                <p style={{ fontSize: 12, color: "#15803d", margin: 0 }}>
                  {autoResult.sent} sent · {autoResult.failed} failed
                </p>
              </div>
            ) : (
              <button
                onClick={handleAutoReply}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 18px",
                  background: loading ? "#e5e7eb" : "#6366f1",
                  color: loading ? "#9ca3af" : "#fff",
                  border: "none",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid #a5b4fc",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                      }}
                    />{" "}
                    Sending…
                  </>
                ) : (
                  <>
                    <Zap size={14} /> Send AI replies to Interested leads
                  </>
                )}
              </button>
            )}

            {/* Bulk actions for other categories */}
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
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
                Bulk actions for other categories
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleBulkMark("Not Interested", "opted-out")}
                  disabled={!!bulkLoading}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    background: "#fff",
                    color: "#ef4444",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {bulkLoading === "Not Interested"
                    ? "…"
                    : "Mark Not Interested → Opt out"}
                </button>
                <button
                  onClick={() => handleBulkMark("Out of Office", "opted-out")}
                  disabled={!!bulkLoading}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    background: "#fff",
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {bulkLoading === "Out of Office"
                    ? "…"
                    : "Mark Out of Office → Opt out"}
                </button>
              </div>
            </div>

            <button
              onClick={() => setMode("idle")}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <X size={12} /> Back
            </button>
          </div>
        )}

        {/* ── One by one mode ── */}
        {mode === "one-by-one" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {repliedLeads.map((lead) => {
              const draft = drafts.find((d) => d.leadEmail === lead.email);
              const isGenerating = generatingFor === lead.email;
              const isSending = sendingFor === lead.email;

              return (
                <div
                  key={lead.email}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {/* Lead row */}
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#f9fafb",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {lead.email[0].toUpperCase()}
                    </div>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lead.email}
                    </span>

                    {!draft && (
                      <button
                        onClick={() => handleGenerateDraft(lead.email)}
                        disabled={isGenerating}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          background: "#6366f1",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: isGenerating ? "default" : "pointer",
                        }}
                      >
                        {isGenerating ? (
                          <>
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                border: "2px solid #a5b4fc",
                                borderTopColor: "#fff",
                                borderRadius: "50%",
                                animation: "spin .7s linear infinite",
                              }}
                            />{" "}
                            Generating…
                          </>
                        ) : (
                          <>
                            <Bot size={12} /> Draft reply
                          </>
                        )}
                      </button>
                    )}

                    {draft && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleGenerateDraft(lead.email)}
                          title="Regenerate"
                          style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #e5e7eb",
                            borderRadius: 7,
                            background: "#fff",
                            color: "#9ca3af",
                            cursor: "pointer",
                          }}
                        >
                          <RefreshCw size={12} />
                        </button>
                        <button
                          onClick={() =>
                            setDrafts((p) =>
                              p.map((d) =>
                                d.leadEmail === lead.email
                                  ? { ...d, editing: !d.editing }
                                  : d,
                              ),
                            )
                          }
                          style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #e5e7eb",
                            borderRadius: 7,
                            background: "#fff",
                            color: "#9ca3af",
                            cursor: "pointer",
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleSendReply(draft)}
                          disabled={isSending}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 12px",
                            background: "#22c55e",
                            color: "#fff",
                            border: "none",
                            borderRadius: 7,
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: isSending ? "default" : "pointer",
                          }}
                        >
                          {isSending ? (
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                border: "2px solid #bbf7d0",
                                borderTopColor: "#fff",
                                borderRadius: "50%",
                                animation: "spin .7s linear infinite",
                              }}
                            />
                          ) : (
                            <>
                              <Send size={12} /> Send
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Draft */}
                  {draft && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderTop: "1px solid #f3f4f6",
                      }}
                    >
                      {draft.category && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 99,
                            background:
                              draft.category === "Interested"
                                ? "#dcfce7"
                                : "#f3f4f6",
                            color:
                              draft.category === "Interested"
                                ? "#16a34a"
                                : "#6b7280",
                            display: "inline-block",
                            marginBottom: 8,
                          }}
                        >
                          {draft.category}
                        </span>
                      )}
                      {draft.editing ? (
                        <textarea
                          value={draft.draft}
                          onChange={(e) =>
                            setDrafts((p) =>
                              p.map((d) =>
                                d.leadEmail === lead.email
                                  ? { ...d, draft: e.target.value }
                                  : d,
                              ),
                            )
                          }
                          rows={4}
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
                      ) : (
                        <p
                          style={{
                            fontSize: 13,
                            color: "#374151",
                            margin: 0,
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {draft.draft}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setMode("idle")}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <X size={12} /> Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
