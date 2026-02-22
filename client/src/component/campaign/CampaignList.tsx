import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCampaignsService } from "../../services/campaignService";
import type { Campaign } from "../../services/campaignService";
import CampaignCard from "./CampaignCard";

export default function CampaignList() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getCampaignsService();
      setCampaigns(data);
    } catch {
      setError("Failed to load campaigns.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}
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
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {error && (
        <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>
      )}

      {campaigns.length === 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px dashed #d1d5db",
            borderRadius: 14,
            padding: "40px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>🚀</div>
          <p
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "#111827",
              margin: "0 0 4px 0",
            }}
          >
            No campaigns yet
          </p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 16px 0" }}>
            Create your first outreach sequence
          </p>
          <button
            onClick={() => navigate("/campaigns/new")}
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
            <Plus size={14} /> New campaign
          </button>
        </div>
      )}

      {campaigns.map((c) => (
        <CampaignCard key={c._id} campaign={c} onUpdate={load} />
      ))}

      {campaigns.length > 0 && (
        <button
          onClick={() => navigate("/campaigns/new")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 16px",
            border: "1.5px dashed #d1d5db",
            borderRadius: 14,
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
          <Plus size={14} /> New campaign
        </button>
      )}
    </div>
  );
}
