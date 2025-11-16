import React, { useState } from "react";
import type { EmailViewerProps } from "../types/emailViewerProps";
import SuggestedReplies from "./SuggestedReplies";

const EmailViewer = ({ emails, selectedEmailId }: EmailViewerProps) => {
  const [showSuggested, setShowSuggested] = useState(false);
  const selectedEmail = emails.find((e) => e.id === selectedEmailId) ?? null;
  if (!selectedEmail)
    return <div className="text-gray-500">Select an email to view details</div>;
  return (
    <main className="col-span-5 pl-4">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-500">
              From: {selectedEmail.from}
            </div>
            <h1 className="text-2xl font-semibold">{selectedEmail.subject}</h1>
            <div className="text-sm text-gray-500 mt-1">
              Account: {selectedEmail.account} • Folder: {selectedEmail.folder}
            </div>
          </div>
          <div className="space-x-2">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50"
              onClick={() => setShowSuggested((s) => !s)}
            >
              Suggested Replies
            </button>
            <button className="px-3 py-1 bg-green-600 text-white rounded">
              Mark Interested
            </button>
          </div>
        </div>

        <div className="mt-6 prose max-w-none">
          <p>{selectedEmail.snippet}</p>
          <p className="text-xs text-gray-500">
            (Full email body would render here — fetch via API)
          </p>
        </div>

        {showSuggested && <SuggestedReplies email={selectedEmail} />}
      </div>
    </main>
  );
};

export default EmailViewer;
