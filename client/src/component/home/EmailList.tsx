import { useNavigate } from "react-router-dom";
import { EmailCard } from "../EmailCard";
import type { EmailType } from "../../types/emailType";

interface EmailListProps {
  emails: EmailType[];
  isLoading: boolean;
}

export default function EmailList({ emails, isLoading }: EmailListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 0",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #e5e7eb",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin .7s linear infinite",
          }}
        />
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
          Loading emails…
        </p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: "48px 20px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,.05)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <p
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: "#111827",
            margin: "0 0 4px 0",
          }}
        >
          No emails found
        </p>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          onClick={() => navigate(`/email/${encodeURIComponent(email.id)}`)}
        />
      ))}
    </div>
  );
}
