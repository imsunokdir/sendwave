import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmailPaginationProps {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export default function EmailPagination({
  page,
  totalPages,
  isFetching,
  onPageChange,
}: EmailPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
      }}
    >
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "7px 14px",
          border: "1px solid #e5e7eb",
          borderRadius: 9,
          fontSize: 13,
          fontWeight: 500,
          background: page === 1 ? "#f9fafb" : "#fff",
          color: page === 1 ? "#d1d5db" : "#374151",
          cursor: page === 1 ? "default" : "pointer",
          transition: "all .15s",
        }}
        onMouseEnter={(e) => {
          if (page !== 1) e.currentTarget.style.borderColor = "#6366f1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
      >
        <ChevronLeft size={14} /> Prev
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          Page <strong style={{ color: "#111827" }}>{page}</strong> of{" "}
          <strong style={{ color: "#111827" }}>{totalPages}</strong>
        </span>
        {isFetching && (
          <div
            style={{
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

      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "7px 14px",
          border: "1px solid #e5e7eb",
          borderRadius: 9,
          fontSize: 13,
          fontWeight: 500,
          background: page >= totalPages ? "#f9fafb" : "#fff",
          color: page >= totalPages ? "#d1d5db" : "#374151",
          cursor: page >= totalPages ? "default" : "pointer",
          transition: "all .15s",
        }}
        onMouseEnter={(e) => {
          if (page < totalPages) e.currentTarget.style.borderColor = "#6366f1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}
