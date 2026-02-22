interface ProfileAvatarProps {
  name: string;
}

export default function ProfileAvatar({ name }: ProfileAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "24px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
          {name || "—"}
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>
          Free plan
        </div>
      </div>
    </div>
  );
}
