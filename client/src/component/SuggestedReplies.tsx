import React, { useEffect, useState } from "react";
import type { EmailType } from "../types/emailType";
import ReplyModal from "./ReplyModal";
import { fetchSuggestedReplies } from "../services/emailService";

const SuggestedReplies = ({ email }: { email: EmailType }) => {
  const [replies, setReplies] = useState<string[]>([]);
  const [selectedReply, setSelectedReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email?.id) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadReplies = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchSuggestedReplies(email.id, controller.signal);

        if (isMounted) {
          setReplies(res);
        }
      } catch (err: any) {
        if (isMounted && err.code !== "ERR_CANCELED") {
          console.error("Failed to fetch suggested replies:", err);
          setError("Failed to generate replies. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReplies();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [email.id]);

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          AI Suggested Replies
        </h2>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">
              Generating intelligent replies...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && replies.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">🤔</div>
          <p className="text-sm text-gray-600">
            No suggested replies available
          </p>
        </div>
      )}

      {/* Replies List */}
      {!loading && !error && replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((reply, idx) => (
            <button
              key={idx}
              className="group w-full text-left px-4 py-3 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => setSelectedReply(reply)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-700">
                      {idx + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-3">
                    {reply}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedReply && (
        <ReplyModal
          email={email}
          suggestedReply={selectedReply}
          onClose={() => setSelectedReply(null)}
        />
      )}
    </div>
  );
};

export default SuggestedReplies;
