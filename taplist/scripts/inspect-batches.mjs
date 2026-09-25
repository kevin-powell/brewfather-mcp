// Dumps the raw Brewfather response the tap list sees, so you can check field names and colour units.
// Usage: npm run inspect            (Completed batches)
//        npm run inspect Conditioning
import { basicAuth, fetchBatchesByStatus } from "../src/lib/brewfather-query.mjs";

const { BREWFATHER_API_USER_ID: user, BREWFATHER_API_KEY: key } = process.env;
if (!user || !key) {
  console.error("Set BREWFATHER_API_USER_ID and BREWFATHER_API_KEY (e.g. in taplist/.env).");
  process.exit(1);
}

const status = process.argv[2] ?? "Completed";
const batches = await fetchBatchesByStatus(status, basicAuth(user, key));
console.log(JSON.stringify(batches, null, 2));
