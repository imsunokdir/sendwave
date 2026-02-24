import { useState } from "react";
import { Power, Trash2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Campaign } from "../../services/campaignService";
import {
  setCampaignStatusService,
  deleteCampaignService,
} from "../../services/campaignService";

const statusStyle: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  active: { bg: "#dcfce7", color: "#16a34a", label: "Active" },
  paused: { bg: "#fef9c3", color: "#ca8a04", label: "Paused" },
  draft: { bg: "#f3f4f6", color: "#6b7280", label: "Draft" },
  completed: { bg: "#eff6ff", color: "#3b82f6", label: "Completed" },
};

interface CampaignCardProps {
  campaign: Campaign;
  onUpdate: () => void;
}

export default function CampaignCard({
  campaign,
  onUpdate,
}: CampaignCardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const s = statusStyle[campaign.status] ?? statusStyle.draft;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const next = campaign.status === "active" ? "paused" : "active";
      await setCampaignStatusService(campaign._id, next);
      onUpdate();
    } catch {
      console.error("Failed to toggle campaign status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    setLoading(true);
    try {
      await deleteCampaignService(campaign._id);
      onUpdate();
    } catch {
      console.error("Failed to delete campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() =>
        navigate(`/campaigns/${campaign._id}`, {
          state: { fromTab: "outreach" },
        })
      }
      style={{
        position: "relative",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
        cursor: "pointer",
        overflow: "hidden",
        transition: "border-color .15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
    >
      {/* Busy overlay */}
      {loading && (
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

      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 7, color: s.color }}>●</span>
        <span
          style={{ fontWeight: 600, fontSize: 14, color: "#111827", flex: 1 }}
        >
          {campaign.name}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 9px",
            borderRadius: 99,
            background: s.bg,
            color: s.color,
          }}
        >
          {s.label}
        </span>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {(
          [
            ["Leads", campaign.stats.totalLeads],
            ["Sent", campaign.stats.sent],
            ["Replies", campaign.stats.replied],
            ["Steps", campaign.steps?.length ?? 0],
          ] as [string, number][]
        ).map(([label, val]) => (
          <div
            key={label}
            style={{
              background: "#f9fafb",
              borderRadius: 9,
              padding: "8px 10px",
            }}
          >
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>
              {label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Toggle active/paused */}
        {campaign.status !== "completed" && campaign.status !== "draft" && (
          <button
            onClick={handleToggle}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#f9fafb",
              color: campaign.status === "active" ? "#f59e0b" : "#22c55e",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f9fafb")}
          >
            <Power size={12} />{" "}
            {campaign.status === "active" ? "Pause" : "Resume"}
          </button>
        )}
        {campaign.status === "draft" && (
          <button
            onClick={handleToggle}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              border: "none",
              borderRadius: 8,
              background: "#6366f1",
              color: "#fff",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Power size={12} /> Launch
          </button>
        )}
        <button
          onClick={handleDelete}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#f9fafb",
            color: "#9ca3af",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.borderColor = "#fecaca";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9ca3af";
            e.currentTarget.style.borderColor = "#e5e7eb";
          }}
        >
          <Trash2 size={12} />
        </button>
        <div style={{ marginLeft: "auto", color: "#9ca3af" }}>
          <ChevronRight size={15} />
        </div>
      </div>
    </div>
  );
}
