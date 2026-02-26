// import { elasticClient } from "../services/elasticSearch";

// interface EmailDoc {
//   account: string;
//   folder: string;
//   envelope: {
//     subject: string;
//   };
// }

// export const logAllEmailsSimple = async () => {
//   try {
//     const result = await elasticClient.search<EmailDoc>({
//       index: "emails",
//       size: 50, // adjust how many emails you want to see
//       query: {
//         match_all: {},
//       },
//     });

//     const hits = result.hits.hits;
//     console.log(`Total emails fetched: ${hits.length}`);
//     hits.forEach((hit) => {
//       console.log("hit:", hit);
//     });
//   } catch (err: any) {
//     console.error("Error fetching emails:", err.message);
//   }
// };

// // Usage:
