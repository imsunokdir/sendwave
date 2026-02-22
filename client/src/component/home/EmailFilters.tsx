import { Filter } from "lucide-react";
import type { Account } from "../../context/AccountsContext";

const FOLDER_OPTIONS = [
  { label: "Inbox", value: "INBOX" },
  { label: "Sent Mail", value: "sent" },
  { label: "Spam", value: "spam" },
];

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "all" },
  { label: "Interested", value: "Interested" },
  { label: "Meeting Booked", value: "Meeting Booked" },
  { label: "Not Interested", value: "Not Interested" },
  { label: "Spam", value: "Spam" },
  { label: "Out of Office", value: "Out of Office" },
];

interface EmailFiltersProps {
  account: string;
  folder: string;
  category: string;
  accounts: Account[];
  onAccountChange: (val: string) => void;
  onFolderChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 9,
  fontSize: 13,
  color: "#111827",
  background: "#f9fafb",
  outline: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "border-color .15s",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
  display: "block",
};

export default function EmailFilters({
  account,
  folder,
  category,
  accounts,
  onAccountChange,
  onFolderChange,
  onCategoryChange,
}: EmailFiltersProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        }}
      >
        <Filter size={13} color="#9ca3af" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af" }}>
          Filters
        </span>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}
      >
        {/* Account */}
        <div>
          <label style={labelStyle}>Account</label>
          <select
            value={account}
            onChange={(e) => onAccountChange(e.target.value)}
            style={selectStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            <option value="all">All accounts</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc.email}>
                {acc.email}
              </option>
            ))}
          </select>
        </div>

        {/* Folder */}
        <div>
          <label style={labelStyle}>Folder</label>
          <select
            value={folder}
            onChange={(e) => onFolderChange(e.target.value)}
            style={selectStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            <option value="all">All folders</option>
            {FOLDER_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>AI Category</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={selectStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
