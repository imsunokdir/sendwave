import { useEffect, useState } from "react";
import { useEmails } from "../hooks/useEmails";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { EmailType } from "../types/emailType";
import { EmailCard } from "../component/EmailCard";
import SearchBar from "../component/SearchBar";
import { fetchAllEmailAccounts } from "../services/emailService";

const FOLDER_OPTIONS: { label: string; value: string }[] = [
  { label: "Inbox", value: "INBOX" },
  { label: "Sent Mail", value: "[Gmail]/Sent Mail" },
  { label: "Spam", value: "[Gmail]/Spam" },
  { label: "All Folder", value: "all" },
];

const CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { label: "All Categories", value: "all" },
  { label: "Interested", value: "Interested" },
  { label: "Meeting Booked", value: "Meeting Booked" },
  { label: "Not Interested", value: "Not Interested" },
  { label: "Spam", value: "Spam" },
  { label: "Out of Office", value: "Out of Office" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const account = searchParams.get("account") || "all";
  const folder = searchParams.get("folder") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "all";

  const [accountsList, setAccountsList] = useState<string[]>([]);
  const limit = 5;

  const { data, isLoading, isFetching } = useEmails({
    account,
    folder,
    page,
    limit,
    query,
    category: category === "all" ? undefined : category,
  });

  const emails: EmailType[] = data?.emails || [];

  // Fetch all email accounts on mount
  useEffect(() => {
    const getAccounts = async () => {
      try {
        const accounts = await fetchAllEmailAccounts();
        setAccountsList(accounts);
      } catch (err) {
        console.error("Failed to fetch email accounts:", err);
      }
    };
    getAccounts();
  }, []);

  const updateParams = (updates: Record<string, string | number>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearch = (q: string) => {
    updateParams({ query: q, page: 1 });
  };

  const handleAccountChange = (acc: string) => {
    updateParams({ account: acc, page: 1 });
  };

  const handleFolderChange = (fld: string) => {
    updateParams({ folder: fld, page: 1 });
  };

  const handleCategoryChange = (cat: string) => {
    updateParams({ category: cat, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <span className="text-5xl">📬</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inbox
            </span>
          </h1>
          <p className="text-gray-600 ml-16">Manage your emails effortlessly</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Account Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account
              </label>
              <select
                value={account}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 cursor-pointer hover:border-gray-400"
              >
                <option value="all">All Accounts</option>
                {accountsList.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>

            {/* Folder Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder
              </label>
              <select
                value={folder}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 cursor-pointer hover:border-gray-400"
              >
                <option value="all">All Folders</option>
                {FOLDER_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 cursor-pointer hover:border-gray-400"
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading emails...</p>
            </div>
          </div>
        )}

        {/* Email List */}
        {!isLoading && (
          <div className="space-y-1 mb-8">
            {emails.map((email: EmailType) => (
              <EmailCard
                key={email.id}
                email={email}
                onClick={() =>
                  navigate(`/email/${encodeURIComponent(email.id)}`)
                }
              />
            ))}

            {emails.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No emails found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && emails.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium transition-all hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm hover:shadow-md"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">
                  Page <span className="text-blue-600 font-bold">{page}</span>
                </span>
                {isFetching && (
                  <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                )}
              </div>

              <button
                disabled={emails.length < limit}
                onClick={() => handlePageChange(page + 1)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium transition-all hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm hover:shadow-md"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
