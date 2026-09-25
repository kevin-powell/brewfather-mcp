// Prints a fingerprint of everything the tap list displays from Brewfather.
// The refresh GitHub Action compares it with the last run and only triggers
// a Netlify build when it changes, so unchanged hours cost no build credits.
// Usage: npm run hash
import { createHash } from "node:crypto";
import { basicAuth, fetchTapBatches } from "../src/lib/brewfather-query.mjs";

const { BREWFATHER_API_USER_ID: user, BREWFATHER_API_KEY: key } = process.env;
if (!user || !key) {
  console.error("Set BREWFATHER_API_USER_ID and BREWFATHER_API_KEY.");
  process.exit(1);
}

// Sort keys and batches so the same data always produces the same hash.
const canonical = (value) =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === "object"
      ? Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonical(value[k])]))
      : value;

const batches = (await fetchTapBatches(basicAuth(user, key))).sort((a, b) => a._id.localeCompare(b._id));
const hash = createHash("sha256").update(JSON.stringify(canonical(batches))).digest("hex");

console.log(hash);
