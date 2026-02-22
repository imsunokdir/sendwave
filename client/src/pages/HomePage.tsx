import { useEmails } from "../hooks/useEmails";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAccounts } from "../context/AccountsContext";
import type { EmailType } from "../types/emailType";
import SearchBar from "../component/SearchBar";
import EmailFilters from "../component/home/EmailFilters";
import EmailList from "../component/home/EmailList";
import EmailPagination from "../component/home/EmailPagination";

const LIMIT = 5;

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { accounts } = useAccounts();

  const account = searchParams.get("account") || "all";
  const folder = searchParams.get("folder") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "all";

  const { data, isLoading, isFetching } = useEmails({
    account,
    folder,
    page,
    query,
    limit: LIMIT,
    category: category === "all" ? undefined : category,
  });

  const emails: EmailType[] = data?.emails || [];
  const totalPages = Math.ceil((data?.total || 0) / LIMIT);

  const updateParams = (
    updates: Record<string, string | number | undefined>,
  ) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== "all") {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
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

      <div style={{ width: "100%", maxWidth: 680 }}>
        {/* ── Header ── */}
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
              📬
            </div>
            <h1
              style={{
                fontSize: 23,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              Inbox
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
            Manage your emails effortlessly.
          </p>
        </div>

        {/* ── Content ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SearchBar onSearch={(q) => updateParams({ query: q, page: 1 })} />

          <EmailFilters
            account={account}
            folder={folder}
            category={category}
            accounts={accounts}
            onAccountChange={(val) => updateParams({ account: val, page: 1 })}
            onFolderChange={(val) => updateParams({ folder: val, page: 1 })}
            onCategoryChange={(val) => updateParams({ category: val, page: 1 })}
          />

          <EmailList emails={emails} isLoading={isLoading} />

          {!isLoading && emails.length > 0 && (
            <EmailPagination
              page={page}
              totalPages={totalPages}
              isFetching={isFetching}
              onPageChange={(p) => updateParams({ page: p })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
