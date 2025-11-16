import type { EmailType } from "../types/emailType";

type Props = {
  email: EmailType;
  onClick?: () => void;
};

export const EmailCard = ({ email, onClick }: Props) => {
  return (
    <div
      className="group bg-white border border-gray-200 rounded-md p-2 hover:shadow-sm cursor-pointer transition-all hover:border-blue-300"
      onClick={onClick}
    >
      {/* Top Row: From + Date */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
            {email.from.charAt(0).toUpperCase()}
          </div>
          <p className="font-medium text-xs text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {email.from}
          </p>
        </div>
        <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
          {new Date(email.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Subject */}
      <h2 className="font-semibold text-xs text-gray-900 mb-0.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
        {email.subject || "(No Subject)"}
      </h2>

      {/* Snippet */}
      <p className="text-gray-600 text-[11px] line-clamp-1 mb-1">
        {email.snippet}
      </p>

      {/* Category Badge */}
      {email.category && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 text-[10px] font-medium rounded border border-purple-200">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 7H7v6h6V7z" />
            <path
              fillRule="evenodd"
              d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
              clipRule="evenodd"
            />
          </svg>
          AI: {email.category}
        </span>
      )}
    </div>
  );
};
