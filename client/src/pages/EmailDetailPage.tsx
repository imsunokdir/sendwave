import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchEmailById } from "../services/emailService"; // create this function
import type { EmailType } from "../types/emailType";
import SuggestedReplies from "../component/SuggestedReplies";

export default function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const decodedId = id ? decodeURIComponent(id) : "";
  const [email, setEmail] = useState<EmailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (decodedId) {
      fetchEmailById(decodedId).then((data) => {
        setEmail(data);
        setLoading(false);
      });
    }
  }, [decodedId]);

  useEffect(() => {
    if (email) {
      console.log("email:", email);
    }
  }, [email]);

  if (loading) return <div>Loading email…</div>;
  if (!email) return <div>Email not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow-md">
      {/* Email Header */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold mb-1">{email.subject}</h1>
        <p className="text-gray-600 text-sm">
          <span className="font-semibold">From:</span> {email.from} <br />
          <span className="font-semibold">To:</span>{" "}
          {email.to?.split(",")[0].trim()}
          {email.to?.includes(",")
            ? ` +${email.to.split(",").length - 1} more`
            : ""}{" "}
          <br />
          {new Date(email.date).toLocaleString()}
        </p>
      </div>

      {/* Email Body */}
      <div className="border rounded p-4 mb-6 bg-gray-50 whitespace-pre-wrap">
        {email.html ? (
          <div dangerouslySetInnerHTML={{ __html: email.html }} />
        ) : (
          <pre>{email.text}</pre>
        )}
      </div>

      {/* AI Suggested Replies */}
      <SuggestedReplies email={email} />
    </div>
  );
}
