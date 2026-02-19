import { algoliasearch } from "algoliasearch";
import dotenv from "dotenv";

dotenv.config();

export const client = algoliasearch(
  process.env.ALGOLIA_APP_ID as string,
  process.env.ALGOLIA_ADMIN_KEY as string,
);
