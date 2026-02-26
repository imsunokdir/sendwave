// import { useEffect, useState } from "react";
// import type { EmailType } from "../types/emailType";
// import { fetchEmails } from "../services/emailService";
// import Sidebar from "./Sidebar";
// import EmailList from "./EmailList";
// import EmailViewer from "./EmailViewer";

// const Onebox = () => {
//   const [emails, setEmails] = useState<EmailType[]>([]);
//   const [query, setQuery] = useState("");
//   const [selectedAccount, setSelectedAccount] = useState<string | "all">("all");
//   const [selectedFolder, setSelectedFolder] = useState<string | "all">("all");
//   const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

//   useEffect(() => {
//     fetchEmails().then((data) => {
//       setEmails(data);
//       setSelectedEmailId(data[0]?.id ?? null);
//     });
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-4 grid grid-cols-12 gap-4">
//         <Sidebar
//           emails={emails}
//           query={query}
//           setQuery={setQuery}
//           selectedAccount={selectedAccount}
//           setSelectedAccount={setSelectedAccount}
//           selectedFolder={selectedFolder}
//           setSelectedFolder={setSelectedFolder}
//         />

//         <EmailList
//           emails={emails}
//           query={query}
//           selectedAccount={selectedAccount}
//           selectedFolder={selectedFolder}
//           selectedEmailId={selectedEmailId}
//           setSelectedEmailId={setSelectedEmailId}
//         />

//         <EmailViewer emails={emails} selectedEmailId={selectedEmailId} />
//       </div>
//     </div>
//   );
// };

// export default Onebox;
