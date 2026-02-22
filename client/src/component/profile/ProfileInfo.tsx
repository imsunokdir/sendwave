import { Mail, User } from "lucide-react";

interface ProfileInfoProps {
  name: string;
  email: string;
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 18px",
      }}
    >
      <div style={{ color: "#9ca3af", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function ProfileInfo({ name, email }: ProfileInfoProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
        overflow: "hidden",
      }}
    >
      <Field icon={<User size={14} />} label="Full name" value={name || "—"} />
      <div style={{ height: 1, background: "#f3f4f6" }} />
      <Field icon={<Mail size={14} />} label="Email" value={email || "—"} />
    </div>
  );
}
