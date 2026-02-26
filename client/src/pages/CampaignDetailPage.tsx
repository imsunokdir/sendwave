import {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
  // useRef,
} from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Power,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Send,
  MessageSquare,
  Zap,
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  Brain,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getCampaignService,
  setCampaignStatusService,
  updateCampaignService,
  uploadLeadsService,
  getCampaignContextService,
  saveCampaignContextService,
  deleteCampaignContextService,
  getCampaignLeadsService,
  // updateReplyRulesService,
  // triggerAutoReplyService,
  // updateCategoriesService,
  // triggerCategoryReplyService,
  updateCampaignAutoReplyService,
} from "../services/campaignService";
import type {
  Campaign,
  Lead,
  CampaignContextItem,
  // ICampaignCategory,
} from "../services/campaignService";
import StepBuilder from "../component/campaign/StepBuilder";
import SchedulePicker from "../component/campaign/SchedulePicker";
import LeadUploader from "../component/campaign/LeadUploader";
// import CampaignCategories from "../component/campaign/CampaignCategories";

// Lazy loaded — only rendered when needed
const SmartReplyPanel = lazy(
  () => import("../component/campaign/SmartReplyPanel"),
);
const LeadThreadPanel = lazy(
  () => import("../component/campaign/LeadThreadPanel"),
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusStyle: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  active: { bg: "#dcfce7", color: "#16a34a", label: "Active" },
  paused: { bg: "#fef9c3", color: "#ca8a04", label: "Paused" },
  draft: { bg: "#f3f4f6", color: "#6b7280", label: "Draft" },
  completed: { bg: "#eff6ff", color: "#3b82f6", label: "Completed" },
};

const leadStatusIcon: Record<string, React.ReactNode> = {
  pending: <Clock size={13} color="#9ca3af" />,
  contacted: <Send size={13} color="#6366f1" />,
  replied: <CheckCircle size={13} color="#22c55e" />,
  responded: <CheckCircle size={13} color="#3b82f6" />,
  "opted-out": <XCircle size={13} color="#f59e0b" />,
  failed: <AlertCircle size={13} color="#ef4444" />,
};

const leadStatusColor: Record<string, string> = {
  pending: "#9ca3af",
  contacted: "#6366f1",
  replied: "#22c55e",
  responded: "#3b82f6",
  "opted-out": "#f59e0b",
  failed: "#ef4444",
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function StatCard({
  icon,
  label,
  value,
  color = "#6366f1",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,.04)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

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

const LEADS_PER_PAGE = 50;

// const CATEGORIES = [
//   { key: "Interested", emoji: "✅", color: "#22c55e", canSend: true },
//   { key: "Meeting Booked", emoji: "📅", color: "#3b82f6", canSend: true },
//   { key: "Out of Office", emoji: "🏖️", color: "#f59e0b", canSend: true },
//   { key: "Not Interested", emoji: "❌", color: "#9ca3af", canSend: false },
//   { key: "Spam", emoji: "🚫", color: "#ef4444", canSend: false },
// ];

// function ReplyRulesPanel({
//   campaignId,
//   replyRules,
//   onUpdate,
// }: {
//   campaignId: string;
//   replyRules: Record<string, boolean>;
//   onUpdate: () => void;
// }) {
//   const [togglingKey, setTogglingKey] = useState<string | null>(null);
//   const [sendingKey, setSendingKey] = useState<string | null>(null);
//   const [sentKey, setSentKey] = useState<string | null>(null);

//   const handleToggle = async (category: string, current: boolean) => {
//     setTogglingKey(category);
//     try {
//       await updateReplyRulesService(campaignId, category, !current);
//       onUpdate();
//     } catch {
//       console.error("Failed to update reply rule");
//     } finally {
//       setTogglingKey(null);
//     }
//   };

//   const handleSendNow = async (category: string) => {
//     setSendingKey(category);
//     try {
//       await triggerAutoReplyService(campaignId, category);
//       setSentKey(category);
//       setTimeout(() => setSentKey(null), 3000);
//     } catch {
//       console.error("Failed to trigger auto reply");
//     } finally {
//       setSendingKey(null);
//     }
//   };

//   return (
//     <div
//       style={{
//         background: "#fff",
//         border: "1px solid #e5e7eb",
//         borderRadius: 14,
//         overflow: "hidden",
//         marginBottom: 12,
//         boxShadow: "0 1px 3px rgba(0,0,0,.05)",
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           padding: "12px 18px",
//           borderBottom: "1px solid #f3f4f6",
//           display: "flex",
//           alignItems: "center",
//           gap: 8,
//         }}
//       >
//         <Zap size={13} color="#6366f1" />
//         <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
//           Auto Reply Rules
//         </span>
//         <span style={{ fontSize: 11, color: "#9ca3af" }}>per category</span>
//       </div>

//       {/* Rows */}
//       <div style={{ padding: "8px 0" }}>
//         {CATEGORIES.map((cat) => {
//           const enabled = replyRules?.[cat.key] ?? false;
//           const toggling = togglingKey === cat.key;
//           const sending = sendingKey === cat.key;
//           const sent = sentKey === cat.key;

//           return (
//             <div
//               key={cat.key}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 12,
//                 padding: "10px 18px",
//                 borderBottom: "1px solid #f9fafb",
//               }}
//             >
//               {/* Category label */}
//               <span style={{ fontSize: 15 }}>{cat.emoji}</span>
//               <span
//                 style={{
//                   flex: 1,
//                   fontSize: 13,
//                   fontWeight: 500,
//                   color: "#374151",
//                 }}
//               >
//                 {cat.key}
//               </span>

//               {/* Send now button */}
//               {cat.canSend && (
//                 <button
//                   onClick={() => handleSendNow(cat.key)}
//                   disabled={sending || !!sendingKey}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 5,
//                     padding: "5px 12px",
//                     border: `1px solid ${sent ? "#bbf7d0" : "#e5e7eb"}`,
//                     borderRadius: 7,
//                     background: sent ? "#f0fdf4" : "#f9fafb",
//                     color: sent ? "#16a34a" : "#6b7280",
//                     fontSize: 11,
//                     fontWeight: 500,
//                     cursor: sending || !!sendingKey ? "default" : "pointer",
//                     transition: "all .15s",
//                   }}
//                   onMouseEnter={(e) => {
//                     if (!sending && !sent) {
//                       e.currentTarget.style.borderColor = "#6366f1";
//                       e.currentTarget.style.color = "#6366f1";
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (!sent) {
//                       e.currentTarget.style.borderColor = "#e5e7eb";
//                       e.currentTarget.style.color = "#6b7280";
//                     }
//                   }}
//                 >
//                   {sending ? (
//                     <div
//                       style={{
//                         width: 11,
//                         height: 11,
//                         border: "2px solid #d1d5db",
//                         borderTopColor: "#6366f1",
//                         borderRadius: "50%",
//                         animation: "spin .7s linear infinite",
//                       }}
//                     />
//                   ) : sent ? (
//                     <Check size={11} />
//                   ) : (
//                     <Send size={11} />
//                   )}
//                   {sent ? "Sent!" : "Send now"}
//                 </button>
//               )}

//               {/* Toggle */}
//               <button
//                 onClick={() => handleToggle(cat.key, enabled)}
//                 disabled={toggling}
//                 style={{
//                   width: 38,
//                   height: 22,
//                   borderRadius: 99,
//                   border: "none",
//                   background: enabled ? "#6366f1" : "#e5e7eb",
//                   position: "relative",
//                   cursor: toggling ? "default" : "pointer",
//                   transition: "background .2s",
//                   flexShrink: 0,
//                   opacity: toggling ? 0.6 : 1,
//                 }}
//               >
//                 <div
//                   style={{
//                     position: "absolute",
//                     top: 3,
//                     left: enabled ? 19 : 3,
//                     width: 16,
//                     height: 16,
//                     borderRadius: "50%",
//                     background: "#fff",
//                     boxShadow: "0 1px 3px rgba(0,0,0,.2)",
//                     transition: "left .2s",
//                   }}
//                 />
//               </button>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const [threadLead, setThreadLead] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [leadsTotalPages, setLeadsTotalPages] = useState(1);
  const [leadFilter, setLeadFilter] = useState("all");

  const [editingDetails, setEditingDetails] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSteps, setEditSteps] = useState<Campaign["steps"]>([]);
  const [editSchedule, setEditSchedule] = useState<Campaign["schedule"]>({
    timezone: "UTC",
    sendHour: 9,
    sendMinute: 0,
    sendDays: [1, 2, 3, 4, 5],
  });
  const [savingDetails, setSavingDetails] = useState(false);

  const [contextItems, setContextItems] = useState<CampaignContextItem[]>([]);
  const [contextLoading, setContextLoading] = useState(true);
  const [contextText, setContextText] = useState("");
  const [savingContext, setSavingContext] = useState(false);
  const [deletingCtx, setDeletingCtx] = useState<string | null>(null);

  const [showAddLeads, setShowAddLeads] = useState(false);
  const [leadsRaw, setLeadsRaw] = useState("");
  const [leadsType, setLeadsType] = useState<"raw" | "csv">("raw");
  const [leadCount, setLeadCount] = useState(0);
  const [uploadingLeads, setUploadingLeads] = useState(false);
  // const [savingCategories, setSavingCategories] = useState(false);

  const [leadsResult, setLeadsResult] = useState<{
    added: number;
    skipped: number;
  } | null>(null);

  const [togglingAutoReply, setTogglingAutoReply] = useState(false);

  // Auto-open thread from dashboard ?openLead= param
  useEffect(() => {
    const openLead = searchParams.get("openLead");
    if (openLead) setThreadLead(openLead);
  }, [searchParams]);

  const load = async () => {
    try {
      const data = await getCampaignService(id!);
      setCampaign(data);
      setEditName(data.name);
      setEditSteps(data.steps);
      setEditSchedule(data.schedule);
    } catch {
      setError("Failed to load campaign.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoReplyToggle = async () => {
    if (!campaign) return;
    setTogglingAutoReply(true);
    try {
      const updated = await updateCampaignAutoReplyService(
        campaign._id,
        !campaign.autoReply,
      );
      setCampaign(updated);
    } catch {
      setError("Failed to update auto-reply.");
    } finally {
      setTogglingAutoReply(false);
    }
  };

  // const handleCategoriesChange = async (categories: ICampaignCategory[]) => {
  //   if (!campaign) return; //  guard
  //   setSavingCategories(true);
  //   try {
  //     await updateCategoriesService(campaign._id, categories);
  //     setCampaign({ ...campaign, categories });
  //   } catch {
  //     setError("Failed to save categories.");
  //   } finally {
  //     setSavingCategories(false);
  //   }
  // };
  // const categoriesSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(
  //   null,
  // );

  // const handleCategoriesChange = (categories: ICampaignCategory[]) => {
  //   if (!campaign) return;
  //   setCampaign({ ...campaign, categories });
  //   if (categoriesSaveTimer.current) clearTimeout(categoriesSaveTimer.current);
  //   categoriesSaveTimer.current = setTimeout(async () => {
  //     setSavingCategories(true);
  //     try {
  //       await updateCategoriesService(campaign._id, categories);
  //     } catch {
  //       setError("Failed to save categories.");
  //     } finally {
  //       setSavingCategories(false);
  //     }
  //   }, 800);
  // };
  // const handleTriggerCategory = async (categoryName: string) => {
  //   if (!campaign) return;
  //   await triggerCategoryReplyService(campaign._id, categoryName);
  // };

  const loadLeads = useCallback(
    async (page: number, status: string) => {
      setLeadsLoading(true);
      try {
        const data = await getCampaignLeadsService(
          id!,
          page,
          LEADS_PER_PAGE,
          status,
        );
        setLeads(data.leads);
        setLeadsTotal(data.total);
        setLeadsTotalPages(data.totalPages);
      } catch {
        /* fail silently */
      } finally {
        setLeadsLoading(false);
      }
    },
    [id],
  );

  const loadContext = async () => {
    setContextLoading(true);
    try {
      const data = await getCampaignContextService(id!);
      setContextItems(data);
    } catch {
      /* fail silently */
    } finally {
      setContextLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadContext();
  }, [id]);
  useEffect(() => {
    loadLeads(leadsPage, leadFilter);
  }, [leadsPage, leadFilter, loadLeads]);

  const handleFilterChange = (f: string) => {
    setLeadFilter(f);
    setLeadsPage(1);
  };

  const handleToggle = async () => {
    if (!campaign) return;
    setToggling(true);
    try {
      const next =
        campaign.status === "active"
          ? "paused"
          : campaign.status === "paused"
            ? "active"
            : "active";
      const updated = await setCampaignStatusService(campaign._id, next);
      setCampaign(updated);
    } catch {
      setError("Failed to update status.");
    } finally {
      setToggling(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!campaign) return;
    setSavingDetails(true);
    try {
      const updated = await updateCampaignService(campaign._id, {
        name: editName,
        steps: editSteps,
        schedule: editSchedule,
      });
      setCampaign(updated);
      setEditingDetails(false);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleAddContext = async () => {
    const trimmed = contextText.trim();
    if (!trimmed) return;
    setSavingContext(true);
    try {
      await saveCampaignContextService(id!, trimmed);
      setContextText("");
      await loadContext();
    } catch {
      setError("Failed to save context.");
    } finally {
      setSavingContext(false);
    }
  };

  const handleDeleteContext = async (ctxId: string) => {
    setDeletingCtx(ctxId);
    try {
      await deleteCampaignContextService(id!, ctxId);
      setContextItems((p) => p.filter((c) => c._id !== ctxId));
    } catch {
      setError("Failed to delete context.");
    } finally {
      setDeletingCtx(null);
    }
  };

  const handleLeadsParsed = (raw: string, type: "raw" | "csv") => {
    setLeadsRaw(raw);
    setLeadsType(type);
    const matches =
      raw.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) ?? [];
    setLeadCount([...new Set(matches)].length);
  };

  const handleUploadLeads = async () => {
    if (!leadsRaw) return;
    setUploadingLeads(true);
    try {
      const result = await uploadLeadsService(id!, {
        [leadsType === "csv" ? "csv" : "raw"]: leadsRaw,
      });
      setLeadsResult(result);
      setLeadsRaw("");
      setLeadCount(0);
      await load();
      await loadLeads(1, leadFilter);
      setLeadsPage(1);
    } catch {
      setError("Failed to upload leads.");
    } finally {
      setUploadingLeads(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f4ff 0%, #f9fafb 60%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid #e5e7eb",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin .7s linear infinite",
          }}
        />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f4ff 0%, #f9fafb 60%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444", marginBottom: 12 }}>
            {error || "Campaign not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "8px 16px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  const s = statusStyle[campaign.status] ?? statusStyle.draft;
  const replyRate =
    campaign.stats.sent > 0
      ? Math.round((campaign.stats.replied / campaign.stats.sent) * 100)
      : 0;
  const repliedLeads = leads.filter((l) => l.status === "replied");

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f4ff 0%, #f9fafb 60%)",
          padding: "40px 16px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>

        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
              background: "none",
              border: "none",
              color: "#9ca3af",
              fontSize: 13,
              cursor: "pointer",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            <ArrowLeft size={14} /> Back to Hub
          </button>

          {/* Header */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: "18px 20px",
              marginBottom: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,.05)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <h1
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {campaign.name}
                </h1>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 99,
                    background: s.bg,
                    color: s.color,
                    flexShrink: 0,
                  }}
                >
                  {s.label}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                {campaign.steps.length} step
                {campaign.steps.length !== 1 ? "s" : ""} ·{" "}
                {campaign.schedule.sendDays.length} send day
                {campaign.schedule.sendDays.length !== 1 ? "s" : ""} ·{" "}
                {campaign.schedule.sendHour}:
                {String(campaign.schedule.sendMinute ?? 0).padStart(2, "0")}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setEditingDetails(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 13px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 9,
                  background: "#f9fafb",
                  color: "#6b7280",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.color = "#6366f1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.color = "#6b7280";
                }}
              >
                <Pencil size={12} /> Edit
              </button>
              {campaign.status !== "completed" && (
                <button
                  onClick={handleToggle}
                  disabled={toggling}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: 9,
                    background:
                      campaign.status === "active" ? "#fef9c3" : "#6366f1",
                    color: campaign.status === "active" ? "#ca8a04" : "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: toggling ? "default" : "pointer",
                  }}
                >
                  {toggling ? (
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        border: "2px solid currentColor",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                      }}
                    />
                  ) : (
                    <Power size={12} />
                  )}
                  {campaign.status === "active"
                    ? "Pause"
                    : campaign.status === "paused"
                      ? "Resume"
                      : "Launch"}
                </button>
              )}
            </div>
          </div>

          {/* Edit panel */}
          {editingDetails && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #6366f1",
                borderRadius: 14,
                padding: "18px 20px",
                marginBottom: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                >
                  Edit campaign
                </span>
                <button
                  onClick={() => setEditingDetails(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    display: "flex",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={{ marginBottom: 14 }}>
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
                  Campaign name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#6366f1")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#e5e7eb")
                  }
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Schedule
                </label>
                <SchedulePicker
                  schedule={editSchedule}
                  onChange={setEditSchedule}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Sequence
                </label>
                <StepBuilder steps={editSteps} onChange={setEditSteps} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleSaveDetails}
                  disabled={savingDetails || !editName.trim()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    background: savingDetails ? "#e5e7eb" : "#6366f1",
                    color: savingDetails ? "#9ca3af" : "#fff",
                    border: "none",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: savingDetails ? "default" : "pointer",
                  }}
                >
                  {savingDetails ? (
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
                      />{" "}
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Save changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditingDetails(false)}
                  style={{
                    padding: "9px 16px",
                    background: "#f3f4f6",
                    color: "#6b7280",
                    border: "none",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <StatCard
              icon={<Users size={16} />}
              label="Total leads"
              value={campaign.stats.totalLeads}
              color="#6366f1"
            />
            <StatCard
              icon={<Send size={16} />}
              label="Sent"
              value={campaign.stats.sent}
              color="#3b82f6"
            />
            <StatCard
              icon={<MessageSquare size={16} />}
              label="Replies"
              value={campaign.stats.replied}
              color="#22c55e"
            />
            <StatCard
              icon={<Zap size={16} />}
              label="Reply rate"
              value={replyRate}
              color="#f59e0b"
            />
          </div>

          {/* Context */}
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
            <div
              style={{
                padding: "12px 18px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Brain size={13} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                AI Context
              </span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                ({contextItems.length})
              </span>
            </div>
            <div
              style={{
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                    handleAddContext();
                }}
                placeholder="Add context for AI replies e.g. booking link, pricing, key points..."
                rows={2}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  ⌘ + Enter to add
                </span>
                <button
                  onClick={handleAddContext}
                  disabled={!contextText.trim() || savingContext}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "7px 14px",
                    background:
                      contextText.trim() && !savingContext
                        ? "#6366f1"
                        : "#e5e7eb",
                    color:
                      contextText.trim() && !savingContext ? "#fff" : "#9ca3af",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor:
                      contextText.trim() && !savingContext
                        ? "pointer"
                        : "default",
                  }}
                >
                  {savingContext ? (
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        border: "2px solid #a5b4fc",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                      }}
                    />
                  ) : (
                    <Plus size={12} />
                  )}
                  Add
                </button>
              </div>
              {contextLoading && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "12px 0",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid #e5e7eb",
                      borderTopColor: "#6366f1",
                      borderRadius: "50%",
                      animation: "spin .7s linear infinite",
                    }}
                  />
                </div>
              )}
              {!contextLoading && contextItems.length === 0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  No context snippets yet.
                </p>
              )}
              {!contextLoading &&
                contextItems.map((item, i) => {
                  const deleting = deletingCtx === item._id;
                  return (
                    <div
                      key={item._id}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "10px 12px",
                        background: "#f9fafb",
                        borderRadius: 9,
                        overflow: "hidden",
                      }}
                    >
                      {deleting && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(243,244,246,.8)",
                            backdropFilter: "blur(3px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 9,
                          }}
                        >
                          <div
                            style={{
                              width: 14,
                              height: 14,
                              border: "2px solid #d1d5db",
                              borderTopColor: "#6b7280",
                              borderRadius: "50%",
                              animation: "spin .7s linear infinite",
                            }}
                          />
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#9ca3af",
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <p
                        style={{
                          flex: 1,
                          fontSize: 12,
                          color: "#374151",
                          margin: 0,
                          lineHeight: 1.6,
                          wordBreak: "break-word",
                        }}
                      >
                        {item.text}
                      </p>
                      <button
                        onClick={() => handleDeleteContext(item._id)}
                        disabled={!!deletingCtx}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#9ca3af",
                          display: "flex",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#ef4444")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#9ca3af")
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Categories */}
          {/* <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 12,
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
              <Zap size={13} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Reply Categories
              </span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                ({campaign.categories?.length ?? 0})
              </span>
              {savingCategories && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: 14,
                    height: 14,
                    border: "2px solid #e5e7eb",
                    borderTopColor: "#6366f1",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                  }}
                />
              )}
            </div>
            <div style={{ padding: "14px 18px" }}>
              <CampaignCategories
                categories={campaign.categories ?? []}
                onChange={handleCategoriesChange}
                campaignId={campaign._id}
                onTrigger={handleTriggerCategory}
              />
            </div>
          </div> */}

          {/* AI Auto Reply */}
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
            <div
              style={{
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Zap size={13} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                AI Auto Reply
              </span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                Automatically reply to leads using your knowledge base
              </span>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {togglingAutoReply && (
                  <div
                    style={{
                      width: 13,
                      height: 13,
                      border: "2px solid #e5e7eb",
                      borderTopColor: "#6366f1",
                      borderRadius: "50%",
                      animation: "spin .7s linear infinite",
                    }}
                  />
                )}
                <button
                  onClick={handleAutoReplyToggle}
                  disabled={togglingAutoReply}
                  style={{
                    width: 38,
                    height: 22,
                    borderRadius: 99,
                    border: "none",
                    background: campaign.autoReply ? "#6366f1" : "#e5e7eb",
                    position: "relative",
                    cursor: togglingAutoReply ? "default" : "pointer",
                    transition: "background .2s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: campaign.autoReply ? 19 : 3,
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
            </div>
          </div>

          {/* Reply Categories — for labeling + stop sequence only */}
          {/* <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 12,
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
              <Brain size={13} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Reply Categories
              </span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                ({campaign.categories?.length ?? 0}) — for labeling & stop
                sequence
              </span>
              {savingCategories && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: 14,
                    height: 14,
                    border: "2px solid #e5e7eb",
                    borderTopColor: "#6366f1",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                  }}
                />
              )}
            </div>
            <div style={{ padding: "14px 18px" }}>
              <CampaignCategories
                categories={campaign.categories ?? []}
                onChange={handleCategoriesChange}
              />
            </div>
          </div> */}

          {/* Sequence */}
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
            <div
              style={{
                padding: "12px 18px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Mail size={13} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Sequence
              </span>
            </div>
            {campaign.steps.map((step, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 18px",
                  borderBottom:
                    i < campaign.steps.length - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: "#f5f3ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6366f1",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111827",
                      margin: "0 0 2px 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.subject}
                  </p>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                    {i === 0
                      ? "Sent immediately"
                      : `Wait ${step.delayDays} day${step.delayDays !== 1 ? "s" : ""} after previous`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add leads */}
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
            <div
              onClick={() => {
                setShowAddLeads(!showAddLeads);
                setLeadsResult(null);
              }}
              style={{
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <Plus size={13} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Add more leads
              </span>
              <span
                style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}
              >
                {showAddLeads ? "▲ collapse" : "▼ expand"}
              </span>
            </div>
            {showAddLeads && (
              <div
                style={{
                  padding: "0 18px 16px",
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <div style={{ paddingTop: 14 }}>
                  <LeadUploader
                    onLeadsParsed={handleLeadsParsed}
                    leadCount={leadCount}
                  />
                </div>
                {leadsResult && (
                  <div
                    style={{
                      margin: "10px 0",
                      padding: "10px 14px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 9,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "#16a34a",
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      ✓ {leadsResult.added} lead
                      {leadsResult.added !== 1 ? "s" : ""} added,{" "}
                      {leadsResult.skipped} skipped (duplicates)
                    </p>
                  </div>
                )}
                <button
                  onClick={handleUploadLeads}
                  disabled={leadCount === 0 || uploadingLeads}
                  style={{
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    background:
                      leadCount > 0 && !uploadingLeads ? "#6366f1" : "#e5e7eb",
                    color:
                      leadCount > 0 && !uploadingLeads ? "#fff" : "#9ca3af",
                    border: "none",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor:
                      leadCount > 0 && !uploadingLeads ? "pointer" : "default",
                  }}
                >
                  {uploadingLeads ? (
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
                      />{" "}
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Plus size={13} /> Upload {leadCount > 0 ? leadCount : ""}{" "}
                      leads
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Smart reply — lazy loaded */}
          <Suspense fallback={null}>
            <SmartReplyPanel
              campaignId={campaign._id}
              repliedLeads={repliedLeads}
              onDone={() => {
                load();
                loadLeads(leadsPage, leadFilter);
              }}
            />
            {/* <ReplyRulesPanel
              campaignId={campaign._id}
              replyRules={campaign.replyRules ?? {}}
              onUpdate={load}
            /> */}
          </Suspense>

          {/* Leads */}
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
                gap: 10,
              }}
            >
              <Users size={13} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Leads
              </span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                ({leadsTotal})
              </span>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: 4,
                  background: "#f3f4f6",
                  borderRadius: 8,
                  padding: 3,
                }}
              >
                {[
                  "all",
                  "pending",
                  "contacted",
                  "replied",
                  "responded",
                  "failed",
                ].map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
                    style={{
                      padding: "4px 10px",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: leadFilter === f ? 600 : 400,
                      background: leadFilter === f ? "#fff" : "transparent",
                      color: leadFilter === f ? "#111827" : "#9ca3af",
                      cursor: "pointer",
                      textTransform: "capitalize",
                      boxShadow:
                        leadFilter === f ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                      transition: "all .15s",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {leadsLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "32px 0",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    border: "3px solid #e5e7eb",
                    borderTopColor: "#6366f1",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                  }}
                />
              </div>
            ) : leads.length === 0 ? (
              <div
                style={{
                  padding: "32px 20px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 13,
                }}
              >
                No leads with status "{leadFilter}"
              </div>
            ) : (
              leads.map((lead: Lead, i: number) => (
                <div
                  key={lead._id ?? lead.email}
                  onClick={() => setThreadLead(lead.email)}
                  style={{
                    padding: "11px 18px",
                    borderBottom:
                      i < leads.length - 1 ? "1px solid #f9fafb" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {lead.email[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#111827",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lead.email}
                    </p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                      Step {lead.currentStep + 1} · Last contact{" "}
                      {formatDate(lead.lastContactedAt)}
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
                    {leadStatusIcon[lead.status]}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: leadStatusColor[lead.status],
                        textTransform: "capitalize",
                      }}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))
            )}

            {leadsTotalPages > 1 && (
              <div
                style={{
                  padding: "12px 18px",
                  borderTop: "1px solid #f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  Page {leadsPage} of {leadsTotalPages} · {leadsTotal} total
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setLeadsPage((p) => Math.max(1, p - 1))}
                    disabled={leadsPage === 1}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      background: leadsPage === 1 ? "#f9fafb" : "#fff",
                      color: leadsPage === 1 ? "#d1d5db" : "#374151",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: leadsPage === 1 ? "default" : "pointer",
                    }}
                  >
                    <ChevronLeft size={13} /> Prev
                  </button>
                  <button
                    onClick={() =>
                      setLeadsPage((p) => Math.min(leadsTotalPages, p + 1))
                    }
                    disabled={leadsPage === leadsTotalPages}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      background:
                        leadsPage === leadsTotalPages ? "#f9fafb" : "#fff",
                      color:
                        leadsPage === leadsTotalPages ? "#d1d5db" : "#374151",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor:
                        leadsPage === leadsTotalPages ? "default" : "pointer",
                    }}
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thread panel — lazy loaded, only mounts when a lead is clicked */}
      <Suspense fallback={null}>
        {threadLead && (
          <LeadThreadPanel
            campaignId={campaign._id}
            leadEmail={threadLead}
            onClose={() => setThreadLead(null)}
            onReply={() => setThreadLead(null)}
          />
        )}
      </Suspense>
    </>
  );
}
