import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useAccounts } from "../context/AccountsContext";
import StepBuilder from "../component/campaign/StepBuilder";
import LeadUploader from "../component/campaign/LeadUploader";
import SchedulePicker from "../component/campaign/SchedulePicker";

import {
  createCampaignService,
  uploadLeadsService,
  saveCampaignContextService,
} from "../services/campaignService";
import type {
  CampaignStep,
  CampaignSchedule,
} from "../services/campaignService";
import type { ContextSnippet } from "../component/campaign/CampaignContextSteps";
import CampaignContextStep from "../component/campaign/CampaignContextSteps";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  name: string;
  emailAccount: string;
  steps: CampaignStep[];
  schedule: CampaignSchedule;
}

const STEPS = ["Basics", "Context", "Sequence", "Leads", "Schedule", "Review"];

const defaultSchedule: CampaignSchedule = {
  timezone: "UTC",
  sendHour: 9,
  sendMinute: 0, // ← add this
  sendDays: [1, 2, 3, 4, 5],
};

const defaultStep: CampaignStep = {
  order: 0,
  delayDays: 0,
  subject: "",
  body: "",
};

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        marginBottom: 28,
      }}
    >
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < STEPS.length - 1 ? 1 : undefined,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: done || active ? "#6366f1" : "#e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .2s",
                }}
              >
                {done ? (
                  <Check size={13} color="#fff" />
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: active ? "#fff" : "#9ca3af",
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 600 : 400,
                  color: active || done ? "#6366f1" : "#9ca3af",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: done ? "#6366f1" : "#e5e7eb",
                  margin: "0 6px",
                  marginBottom: 18,
                  transition: "background .2s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function NewCampaignPage() {
  const navigate = useNavigate();
  const { accounts } = useAccounts();

  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    name: "",
    emailAccount: accounts[0]?._id ?? "",
    steps: [{ ...defaultStep }],
    schedule: defaultSchedule,
  });

  const [contextSnippets, setContextSnippets] = useState<ContextSnippet[]>([]);

  const [leadsRaw, setLeadsRaw] = useState("");
  const [leadsType, setLeadsType] = useState<"raw" | "csv">("raw");
  const [leadCount, setLeadCount] = useState(0);

  const handleLeadsParsed = (raw: string, type: "raw" | "csv") => {
    setLeadsRaw(raw);
    setLeadsType(type);
    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    const matches = raw.match(emailRegex) ?? [];
    setLeadCount([...new Set(matches)].length);
  };

  const canProceed = (): boolean => {
    if (current === 0) return !!form.name.trim() && !!form.emailAccount;
    if (current === 1) return true; // context is optional
    if (current === 2)
      return form.steps.every((s) => s.subject.trim() && s.body.trim());
    if (current === 3) return leadCount > 0;
    if (current === 4) return form.schedule.sendDays.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      // 1. Create campaign
      const campaign = await createCampaignService({
        name: form.name,
        emailAccount: form.emailAccount,
        steps: form.steps,
        schedule: form.schedule,
      });

      // 2. Upload context snippets to Pinecone tagged with campaignId
      for (const snippet of contextSnippets) {
        await saveCampaignContextService(campaign._id, snippet.text);
      }

      // 3. Upload leads
      if (leadsRaw) {
        await uploadLeadsService(campaign._id, {
          [leadsType === "csv" ? "csv" : "raw"]: leadsRaw,
        });
      }

      navigate(`/campaigns/${campaign._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 9,
    fontSize: 13,
    color: "#111827",
    background: "#f9fafb",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4ff 0%, #f9fafb 60%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ width: "100%", maxWidth: 600 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🚀
            </div>
            <h1
              style={{
                fontSize: 23,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              New Campaign
            </h1>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#9ca3af",
              margin: 0,
              marginLeft: 50,
            }}
          >
            Set up your outreach sequence.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={current} />

        {/* Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,.05)",
            marginBottom: 12,
          }}
        >
          {error && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 12px 0" }}>
              {error}
            </p>
          )}

          {/* Step 0 — Basics */}
          {current === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Campaign name</label>
                <input
                  type="text"
                  placeholder="e.g. Cold Intro — Q3 SaaS"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                <label style={labelStyle}>Send from account</label>
                <select
                  value={form.emailAccount}
                  onChange={(e) =>
                    setForm({ ...form, emailAccount: e.target.value })
                  }
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#6366f1")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#e5e7eb")
                  }
                >
                  {accounts.length === 0 && (
                    <option value="">No accounts connected</option>
                  )}
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.email}
                    </option>
                  ))}
                </select>
                {accounts.length === 0 && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#f59e0b",
                      margin: "6px 0 0 0",
                    }}
                  >
                    ⚠️ Connect an email account in Hub first.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 1 — Context */}
          {current === 1 && (
            <CampaignContextStep
              snippets={contextSnippets}
              onChange={setContextSnippets}
            />
          )}

          {/* Step 2 — Sequence */}
          {current === 2 && (
            <StepBuilder
              steps={form.steps}
              onChange={(steps) => setForm({ ...form, steps })}
            />
          )}

          {/* Step 3 — Leads */}
          {current === 3 && (
            <LeadUploader
              onLeadsParsed={handleLeadsParsed}
              leadCount={leadCount}
            />
          )}

          {/* Step 4 — Schedule */}
          {current === 4 && (
            <SchedulePicker
              schedule={form.schedule}
              onChange={(schedule) => setForm({ ...form, schedule })}
            />
          )}

          {/* Step 5 — Review */}
          {current === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(
                [
                  ["Campaign", form.name],
                  [
                    "Sending from",
                    accounts.find((a) => a._id === form.emailAccount)?.email ??
                      "—",
                  ],
                  [
                    "Context",
                    `${contextSnippets.length} snippet${contextSnippets.length !== 1 ? "s" : ""}`,
                  ],
                  [
                    "Sequence",
                    `${form.steps.length} email${form.steps.length !== 1 ? "s" : ""}`,
                  ],
                  ["Leads", `${leadCount} contacts`],
                  [
                    "Schedule",
                    `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].filter((_, i) => form.schedule.sendDays.includes(i)).join(", ")} at ${form.schedule.sendHour}:00 UTC`,
                  ],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "#f9fafb",
                    borderRadius: 9,
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}
                  >
                    {label}
                  </span>
                  <span
                    style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
        >
          <button
            onClick={() =>
              current === 0 ? navigate("/hub") : setCurrent(current - 1)
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 18px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              background: "#fff",
              color: "#374151",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={14} /> {current === 0 ? "Cancel" : "Back"}
          </button>

          {current < STEPS.length - 1 ? (
            <button
              onClick={() => setCurrent(current + 1)}
              disabled={!canProceed()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                border: "none",
                borderRadius: 10,
                background: canProceed() ? "#6366f1" : "#e5e7eb",
                color: canProceed() ? "#fff" : "#9ca3af",
                fontSize: 13,
                fontWeight: 600,
                cursor: canProceed() ? "pointer" : "default",
                transition: "all .15s",
              }}
            >
              {current === 1 && contextSnippets.length === 0
                ? "Skip"
                : "Continue"}{" "}
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                border: "none",
                borderRadius: 10,
                background: submitting ? "#e5e7eb" : "#6366f1",
                color: submitting ? "#9ca3af" : "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? "default" : "pointer",
                transition: "all .15s",
              }}
            >
              {submitting ? (
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
                  Creating…
                </>
              ) : (
                <>
                  <Check size={14} /> Launch campaign
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
