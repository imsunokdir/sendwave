import { useMemo } from "react";
import type { EmailListProps } from "../types/emailListProps";

const EmailList = ({
  emails,
  query,
  selectedAccount,
  selectedFolder,
  selectedEmailId,
  setSelectedEmailId,
}: EmailListProps) => {
  const filtered = useMemo(() => {
    return emails.filter((e) => {
      if (selectedAccount !== "all" && e.account !== selectedAccount)
        return false;
      if (selectedFolder !== "all" && e.folder !== selectedFolder) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        e.subject.toLowerCase().includes(q) ||
        e.from.toLowerCase().includes(q) ||
        e.snippet?.toLowerCase().includes(q)
      );
    });
  }, [emails, query, selectedAccount, selectedFolder]);
  return (
    <section className="col-span-4 border-r pr-4">
      <h3 className="text-lg font-medium mb-2">Emails ({filtered.length})</h3>
      <ul className="space-y-2 max-h-[70vh] overflow-auto">
        {filtered.map((e) => (
          <li
            key={e.id}
            onClick={() => setSelectedEmailId(e.id)}
            className={`p-3 rounded cursor-pointer hover:bg-gray-50 flex justify-between items-start ${
              selectedEmailId === e.id ? "bg-gray-100" : ""
            }`}
          >
            <div>
              <div className="text-sm text-gray-500">{e.from}</div>
              <div className="font-medium">{e.subject}</div>
              <div className="text-xs text-gray-600">{e.snippet}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {new Date(e.date).toLocaleString()}
              </div>
              <div className="mt-2">
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {e.aiLabel}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default EmailList;
