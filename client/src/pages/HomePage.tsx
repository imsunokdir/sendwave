import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Send,
  MessageSquare,
  Zap,
  Plus,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../services/api";

interface CampaignSummary {
  _id: string;
  name: string;
  status: string;
  stats: { totalLeads: number; sent: number; replied: number; failed: number };
  createdAt: string;
}

interface RecentReply {
  email: string;
  campaignId: string;
  campaignName: string;
  repliedAt: string;
}

interface ByStatus {
  pending: number;
  contacted: number;
  replied: number;
  responded: number;
  "opted-out": number;
  failed: number;
}

const statusDot: Record<string, string> = {
  active: "#22c55e",
  paused: "#eab308",
  draft: "#9ca3af",
  completed: "#6366f1",
};

const statusBadge: Record<string, { bg: string; color: string }> = {
  active: { bg: "#dcfce7", color: "#16a34a" },
  paused: { bg: "#fef9c3", color: "#ca8a04" },
  draft: { bg: "#f3f4f6", color: "#6b7280" },
  completed: { bg: "#eff6ff", color: "#6366f1" },
};

const LEAD_COLORS: Record<string, string> = {
  pending: "#e0e7ff",
  contacted: "#6366f1",
  replied: "#22c55e",
  responded: "#3b82f6",
  "opted-out": "#f59e0b",
  failed: "#ef4444",
};

const LEAD_LABELS: Record<string, string> = {
  pending: "Pending",
  contacted: "Contacted",
  replied: "Replied",
  responded: "Responded",
  "opted-out": "Opted Out",
  failed: "Failed",
};

const formatTimeAgo = (d: string) => {
  if (!d) return "recently";
  const diff = Date.now() - new Date(d).getTime();
  if (isNaN(diff)) return "recently";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "7px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        fontSize: 12,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <span style={{ fontWeight: 600, color: "#111827" }}>{name}</span>
      <span style={{ color: "#9ca3af", marginLeft: 8 }}>{value} leads</span>
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    totalLeads: number;
    totalSent: number;
    totalReplied: number;
    activeCampaigns: number;
    campaigns: CampaignSummary[];
    recentReplies: RecentReply[];
  } | null>(null);
  const [byStatus, setByStatus] = useState<ByStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [campaignsRes, statsRes] = await Promise.all([
          api.get("/campaigns"),
          api.get("/campaigns/stats"),
        ]);

        const campaigns: CampaignSummary[] = campaignsRes.data;
        setByStatus(statsRes.data.byStatus);

        const totalLeads = campaigns.reduce(
          (s, c) => s + (c.stats?.totalLeads ?? 0),
          0,
        );
        const totalSent = campaigns.reduce(
          (s, c) => s + (c.stats?.sent ?? 0),
          0,
        );
        const totalReplied = campaigns.reduce(
          (s, c) => s + (c.stats?.replied ?? 0),
          0,
        );
        const activeCampaigns = campaigns.filter(
          (c) => c.status === "active",
        ).length;

        let recentReplies: RecentReply[] = [];
        for (const campaign of campaigns
          .filter((c) => c.status === "active")
          .slice(0, 3)) {
          try {
            const r = await api.get(`/campaigns/${campaign._id}/leads`, {
              params: { status: "replied", limit: 3, page: 1 },
            });
            for (const lead of r.data.leads ?? []) {
              recentReplies.push({
                email: lead.email,
                campaignId: campaign._id,
                campaignName: campaign.name,
                repliedAt:
                  lead.repliedAt ??
                  lead.lastContactedAt ??
                  new Date().toISOString(),
              });
            }
          } catch {
            /* skip */
          }
        }

        recentReplies = recentReplies
          .filter((r) => !!r.email)
          .sort((a, b) => {
            const ta = a.repliedAt ? new Date(a.repliedAt).getTime() : 0;
            const tb = b.repliedAt ? new Date(b.repliedAt).getTime() : 0;
            return tb - ta;
          })
          .slice(0, 5);

        setData({
          totalLeads,
          totalSent,
          totalReplied,
          activeCampaigns,
          campaigns,
          recentReplies,
        });
      } catch {
        /* fail */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const replyRate =
    data && (data.totalSent ?? 0) > 0
      ? Math.round(((data.totalReplied ?? 0) / data.totalSent) * 100)
      : 0;

  const pieData = byStatus
    ? Object.entries(byStatus)
        .filter(([, v]) => v != null && v > 0)
        .map(([key, value]) => ({ name: LEAD_LABELS[key] ?? key, value, key }))
    : [];

  const totalLeadsInPie = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4ff 0%, #f9fafb 60%)",
        padding: "40px 16px",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        .dash-row:hover   { background: #f5f3ff !important; }
        .camp-row:hover   { background: #f5f3ff !important; }
        .new-btn:hover    { background: #4f46e5 !important; box-shadow: 0 4px 20px rgba(99,102,241,.35) !important; }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: -100,
          left: -60,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          position: "relative",
          animation: "fadeUp .4s ease-out",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "pulse 2s infinite",
                  boxShadow: "0 0 6px #22c55e",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#22c55e",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Live
              </span>
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#111827",
                margin: "0 0 5px 0",
                letterSpacing: "-0.02em",
              }}
            >
              Outreach Dashboard
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
              {data?.activeCampaigns ?? 0} active campaign
              {(data?.activeCampaigns ?? 0) !== 1 ? "s" : ""} running
            </p>
          </div>
          <button
            className="new-btn"
            onClick={() => navigate("/hub?tab=outreach")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 20px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(99,102,241,.25)",
              transition: "all .2s",
            }}
          >
            <Plus size={14} /> New Campaign
          </button>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px 0",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                border: "3px solid #e5e7eb",
                borderTopColor: "#6366f1",
                borderRadius: "50%",
                animation: "spin .7s linear infinite",
              }}
            />
          </div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {[
                {
                  icon: <Users size={15} />,
                  label: "Total Leads",
                  value: data?.totalLeads ?? 0,
                  color: "#6366f1",
                  glow: "#f5f3ff",
                  border: "#e0e7ff",
                },
                {
                  icon: <Send size={15} />,
                  label: "Emails Sent",
                  value: data?.totalSent ?? 0,
                  color: "#3b82f6",
                  glow: "#eff6ff",
                  border: "#dbeafe",
                },
                {
                  icon: <MessageSquare size={15} />,
                  label: "Replies",
                  value: data?.totalReplied ?? 0,
                  color: "#22c55e",
                  glow: "#f0fdf4",
                  border: "#bbf7d0",
                },
                {
                  icon: <Zap size={15} />,
                  label: "Reply Rate",
                  value: `${replyRate}%`,
                  color: "#f59e0b",
                  glow: "#fffbeb",
                  border: "#fde68a",
                },
              ].map(({ icon, label, value, color, glow, border }) => (
                <div
                  key={label}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: "16px 14px",
                    boxShadow: "0 1px 3px rgba(0,0,0,.05)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
                    }}
                  />
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: glow,
                      border: `1px solid ${border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color,
                      marginBottom: 10,
                    }}
                  >
                    {icon}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: "#111827",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      marginTop: 4,
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Donut chart + recent replies ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              {/* Donut chart */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,.05)",
                }}
              >
                <div
                  style={{
                    padding: "12px 18px",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Activity size={13} color="#6366f1" />
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
                  >
                    Lead Funnel
                  </span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    ({totalLeadsInPie} total)
                  </span>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  {pieData.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "24px 0",
                        color: "#9ca3af",
                        fontSize: 12,
                      }}
                    >
                      No lead data yet
                    </div>
                  ) : (
                    <>
                      <div style={{ position: "relative", height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={72}
                              paddingAngle={2}
                              dataKey="value"
                              strokeWidth={0}
                            >
                              {pieData.map((entry) => (
                                <Cell
                                  key={entry.key}
                                  fill={LEAD_COLORS[entry.key] ?? "#e5e7eb"}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Center label */}
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%,-50%)",
                            textAlign: "center",
                            pointerEvents: "none",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: "#111827",
                              lineHeight: 1,
                            }}
                          >
                            {totalLeadsInPie}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "#9ca3af",
                              marginTop: 2,
                              fontWeight: 500,
                            }}
                          >
                            leads
                          </div>
                        </div>
                      </div>

                      {/* Legend */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "6px 12px",
                          marginTop: 12,
                        }}
                      >
                        {pieData.map((entry) => (
                          <div
                            key={entry.key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: LEAD_COLORS[entry.key] ?? "#e5e7eb",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 11,
                                color: "#6b7280",
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {entry.name}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#111827",
                              }}
                            >
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Recent replies / Campaign health */}
              {data!.recentReplies.length > 0 ? (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,.05)",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle size={13} color="#22c55e" />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Recent Replies
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: "#dcfce7",
                        color: "#16a34a",
                      }}
                    >
                      {data!.recentReplies.length} new
                    </span>
                  </div>
                  {data!.recentReplies.map((reply, i) => (
                    <div
                      key={reply.email + i}
                      className="dash-row"
                      onClick={() =>
                        navigate(
                          `/campaigns/${reply.campaignId}?openLead=${encodeURIComponent(reply.email)}`,
                        )
                      }
                      style={{
                        padding: "10px 16px",
                        borderBottom:
                          i < data!.recentReplies.length - 1
                            ? "1px solid #f9fafb"
                            : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        transition: "background .15s",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background:
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {reply.email[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#111827",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {reply.email}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {reply.campaignName}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>
                          {formatTimeAgo(reply.repliedAt)}
                        </span>
                        <ArrowRight size={11} color="#d1d5db" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,.05)",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Activity size={13} color="#6366f1" />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Campaign Health
                    </span>
                  </div>
                  <div
                    style={{
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 11,
                    }}
                  >
                    {[
                      {
                        label: "Active",
                        value: data!.campaigns.filter(
                          (c) => c.status === "active",
                        ).length,
                        color: "#22c55e",
                      },
                      {
                        label: "Paused",
                        value: data!.campaigns.filter(
                          (c) => c.status === "paused",
                        ).length,
                        color: "#ca8a04",
                      },
                      {
                        label: "Draft",
                        value: data!.campaigns.filter(
                          (c) => c.status === "draft",
                        ).length,
                        color: "#9ca3af",
                      },
                      {
                        label: "Completed",
                        value: data!.campaigns.filter(
                          (c) => c.status === "completed",
                        ).length,
                        color: "#6366f1",
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            flex: 1,
                            fontWeight: 500,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {value}
                        </span>
                        <div
                          style={{
                            width: 56,
                            height: 4,
                            background: "#f3f4f6",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${data!.campaigns.length > 0 ? (value / data!.campaigns.length) * 100 : 0}%`,
                              background: color,
                              borderRadius: 99,
                              transition: "width .4s",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Campaigns list ── */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,.05)",
              }}
            >
              <div
                style={{
                  padding: "12px 18px",
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <TrendingUp size={13} color="#6366f1" />
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
                >
                  All Campaigns
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  ({data!.campaigns.length})
                </span>
                <button
                  onClick={() => navigate("/hub?tab=outreach")}
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    color: "#6366f1",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Manage →
                </button>
              </div>

              {data!.campaigns.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      margin: "0 0 14px 0",
                    }}
                  >
                    No campaigns yet
                  </p>
                  <button
                    onClick={() => navigate("/hub")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 18px",
                      background: "#6366f1",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={13} /> Create first campaign
                  </button>
                </div>
              ) : (
                data!.campaigns.slice(0, 8).map((campaign, i) => {
                  const badge =
                    statusBadge[campaign.status] ?? statusBadge.draft;
                  const dot = statusDot[campaign.status] ?? "#9ca3af";
                  const rate =
                    campaign.stats.sent > 0
                      ? Math.round(
                          (campaign.stats.replied / campaign.stats.sent) * 100,
                        )
                      : 0;
                  const progress =
                    campaign.stats.totalLeads > 0
                      ? Math.round(
                          (campaign.stats.sent / campaign.stats.totalLeads) *
                            100,
                        )
                      : 0;

                  return (
                    <div
                      key={campaign._id}
                      className="camp-row"
                      onClick={() => navigate(`/campaigns/${campaign._id}`)}
                      style={{
                        padding: "12px 18px",
                        borderBottom:
                          i < Math.min(data!.campaigns.length, 8) - 1
                            ? "1px solid #f9fafb"
                            : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        cursor: "pointer",
                        transition: "background .15s",
                      }}
                    >
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: dot,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 5,
                          }}
                        >
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
                            {campaign.name}
                          </p>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "2px 7px",
                              borderRadius: 99,
                              background: badge.bg,
                              color: badge.color,
                              flexShrink: 0,
                              textTransform: "capitalize",
                            }}
                          >
                            {campaign.status}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: 3,
                              background: "#f3f4f6",
                              borderRadius: 99,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${progress}%`,
                                background:
                                  "linear-gradient(90deg, #6366f1, #8b5cf6)",
                                borderRadius: 99,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              color: "#9ca3af",
                              flexShrink: 0,
                              fontWeight: 500,
                            }}
                          >
                            {campaign.stats.sent}/{campaign.stats.totalLeads}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: rate > 0 ? "#22c55e" : "#e5e7eb",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {rate}%
                        </div>
                        <div style={{ fontSize: 10, color: "#9ca3af" }}>
                          reply rate
                        </div>
                      </div>
                      <ArrowRight size={12} color="#d1d5db" />
                    </div>
                  );
                })
              )}
            </div>

            {/* No active hint */}
            {data!.activeCampaigns === 0 && data!.campaigns.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  padding: "13px 18px",
                  background: "#f5f3ff",
                  border: "1px solid #e0e7ff",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Clock size={14} color="#6366f1" />
                <p style={{ fontSize: 12, color: "#6366f1", margin: 0 }}>
                  No active campaigns —{" "}
                  <span
                    style={{
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => navigate("/hub")}
                  >
                    launch one
                  </span>{" "}
                  to start sending.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
