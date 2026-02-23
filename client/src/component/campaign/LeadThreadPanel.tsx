import { useState, useEffect } from "react";
import { X, Send, Bot, Clock, CheckCircle, Mail } from "lucide-react";
import { api } from "../../services/api";

interface ReplyEmail {
  subject: string;
  text: string;
  snippet: string;
  category: string;
  date: string;
}

interface ThreadData {
  lead: {
    email: string;
    status: string;
    currentStep: number;
    lastContactedAt?: string;
    repliedAt?: string;
  };
  sentEmail: {
    subject: string;
    body: string;
    sentAt?: string;
  } | null;
  replies: ReplyEmail[];
}

interface LeadThreadPanelProps {
  campaignId: string;
  leadEmail: string;
  onClose: () => void;
  onReply: (leadEmail: string) => void;
}

const categoryColor: Record<string, { bg: string; color: string }> = {
  Interested: { bg: "#dcfce7", color: "#16a34a" },
  "Not Interested": { bg: "#fee2e2", color: "#ef4444" },
  "Out of Office": { bg: "#fef9c3", color: "#ca8a04" },
  "Meeting Booked": { bg: "#eff6ff", color: "#3b82f6" },
  Uncategorized: { bg: "#f3f4f6", color: "#6b7280" },
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function LeadThreadPanel({
  campaignId,
  leadEmail,
  onClose,
  onReply,
}: LeadThreadPanelProps) {
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/campaigns/${campaignId}/thread`, {
          params: { leadEmail },
        });
        console.log("Res:", res);
        setThread(res.data);
      } catch {
        setError("Failed to load thread.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campaignId, leadEmail]);

  const latestReply = thread?.replies?.[thread.replies.length - 1];
  const latestCat = latestReply?.category;
  const catStyle = latestCat
    ? (categoryColor[latestCat] ?? categoryColor["Uncategorized"])
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.25)",
          backdropFilter: "blur(2px)",
          zIndex: 40,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          boxShadow: "-4px 0 24px rgba(0,0,0,.1)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', sans-serif",
          animation: "slideIn .2s ease-out",
        }}
      >
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes spin    { to   { transform: rotate(360deg); } }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {leadEmail[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {leadEmail}
            </p>
            {thread && (
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                {thread.replies.length} repl
                {thread.replies.length !== 1 ? "ies" : "y"} · Last{" "}
                {formatDate(thread.lead.repliedAt)}
              </p>
            )}
          </div>
          {catStyle && latestCat && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 9px",
                borderRadius: 99,
                background: catStyle.bg,
                color: catStyle.color,
                flexShrink: 0,
              }}
            >
              {latestCat}
            </span>
          )}
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: "none",
              background: "#f3f4f6",
              color: "#6b7280",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px 0",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  border: "3px solid #e5e7eb",
                  borderTopColor: "#6366f1",
                  borderRadius: "50%",
                  animation: "spin .7s linear infinite",
                }}
              />
            </div>
          )}

          {error && (
            <p style={{ fontSize: 13, color: "#ef4444", textAlign: "center" }}>
              {error}
            </p>
          )}

          {!loading && thread && (
            <>
              {/* Sent email */}
              {thread.sentEmail ? (
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#f5f3ff",
                      borderBottom: "1px solid #e0e7ff",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Send size={12} color="#6366f1" />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#4f46e5",
                      }}
                    >
                      You sent
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginLeft: "auto",
                      }}
                    >
                      {formatDate(thread.sentEmail.sentAt)}
                    </span>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111827",
                        margin: "0 0 8px 0",
                      }}
                    >
                      {thread.sentEmail.subject}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        margin: 0,
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {thread.sentEmail.body}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "12px 14px",
                    background: "#f9fafb",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Mail size={14} color="#9ca3af" />
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                    No sent email found for this lead yet.
                  </p>
                </div>
              )}

              {/* All replies */}
              {thread.replies.length === 0 && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: "#f9fafb",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Clock size={14} color="#9ca3af" />
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                    No replies indexed yet — check back in a moment.
                  </p>
                </div>
              )}

              {thread.replies.map((reply, i) => {
                const cs =
                  categoryColor[reply.category] ??
                  categoryColor["Uncategorized"];
                return (
                  <div key={i}>
                    {/* Thread connector */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 2,
                          height: 16,
                          background: "#e5e7eb",
                          borderRadius: 1,
                        }}
                      />
                    </div>

                    <div
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "10px 14px",
                          background: "#f0fdf4",
                          borderBottom: "1px solid #bbf7d0",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <CheckCircle size={12} color="#22c55e" />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#16a34a",
                          }}
                        >
                          Reply {thread.replies.length > 1 ? `${i + 1}` : ""}
                        </span>
                        {reply.category && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "2px 7px",
                              borderRadius: 99,
                              background: cs.bg,
                              color: cs.color,
                              marginLeft: 4,
                            }}
                          >
                            {reply.category}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginLeft: "auto",
                          }}
                        >
                          {formatDate(reply.date)}
                        </span>
                      </div>
                      <div style={{ padding: "12px 14px" }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#111827",
                            margin: "0 0 8px 0",
                          }}
                        >
                          {reply.subject}
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            color: "#374151",
                            margin: 0,
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {reply.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer — reply button */}
        {thread && thread.replies.length > 0 && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #f3f4f6" }}>
            <button
              onClick={() => {
                onClose();
                onReply(leadEmail);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "11px 16px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Bot size={14} /> Draft AI reply
            </button>
          </div>
        )}
      </div>
    </>
  );
}
