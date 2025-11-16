import { useMemo } from "react";
import type { SidebarProps } from "../types/sidebarProps";

const Sidebar = ({
  emails,
  query,
  setQuery,
  selectedAccount,
  setSelectedAccount,
  selectedFolder,
  setSelectedFolder,
}: SidebarProps) => {
  const accounts = useMemo(
    () => Array.from(new Set(emails.map((e) => e.account))),
    [emails]
  );
  const folders = useMemo(
    () => Array.from(new Set(emails.map((e) => e.folder))),
    [emails]
  );
  return (
    <aside className="col-span-3 border-r pr-4">
      <h2 className="text-xl font-semibold mb-4">Onebox</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Search</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subject, from, snippet..."
          className="mt-2 w-full rounded p-2 border focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Account</label>
        <select
          className="mt-2 w-full rounded p-2 border"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value as any)}
        >
          <option value="all">All accounts</option>
          {accounts.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Folder</label>
        <select
          className="mt-2 w-full rounded p-2 border"
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value as any)}
        >
          <option value="all">All folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm text-gray-600">
        <p>Mock UI: Replace with Elasticsearch results and backend APIs.</p>
        <p className="mt-2">
          Next: Connect to /api/emails and wire real-time updates.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
