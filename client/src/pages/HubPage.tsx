import { useState, lazy, Suspense } from "react";
import { Mail, Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";

// Lazy loaded — only loads when tab is active
const EmailAccounts = lazy(() => import("../component/hub/EmailAccounts"));
const CampaignList = lazy(() => import("../component/campaign/CampaignList"));

const TABS = [
  { id: "accounts", label: "Email Accounts", icon: <Mail size={15} /> },
  { id: "outreach", label: "Outreach", icon: <Send size={15} /> },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabLoader() {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}
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
  );
}

export default function HubPage() {
  // const [activeTab, setActiveTab] = useState<TabId>("accounts");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "accounts"; // default to emails

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
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
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .hub-fade { animation: fadeIn .2s ease-out; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 580 }}>
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
              🗂️
            </div>
            <h1
              style={{
                fontSize: 23,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              Hub
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
            Manage your email accounts and outreach campaigns.
          </p>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "#e5e7eb",
            borderRadius: 14,
            padding: 4,
            marginBottom: 20,
          }}
        >
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "9px 10px",
                  border: "none",
                  borderRadius: 11,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  background: active ? "#fff" : "transparent",
                  color: active ? "#111827" : "#6b7280",
                  cursor: "pointer",
                  boxShadow: active ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                  transition: "all .18s",
                }}
              >
                <span style={{ color: active ? "#6366f1" : "#9ca3af" }}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div key={activeTab} className="hub-fade">
          <Suspense fallback={<TabLoader />}>
            {activeTab === "accounts" && <EmailAccounts />}
            {activeTab === "outreach" && <CampaignList />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
