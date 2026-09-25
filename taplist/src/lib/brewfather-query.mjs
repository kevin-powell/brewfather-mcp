// Shared Brewfather query used by the site build, `npm run inspect`,
// and the GitHub Action that decides whether the site needs rebuilding.
// Plain JS so Node scripts can import it without a build step.

export const API = "https://api.brewfather.app/v2";

// Batch statuses the site shows: Completed = on tap, Conditioning/Fermenting = coming soon.
export const STATUSES = ["Completed", "Conditioning", "Fermenting"];

// Extra fields to ask for on the batch list endpoint (it only returns the basics by default).
// Anything the page displays must come from here, so the change check sees it too.
export const INCLUDE = [
  "recipe.style",
  "recipe.abv",
  "recipe.ibu",
  "recipe.color",
  "recipe.teaser",
  "measuredAbv",
  "estimatedIbu",
  "estimatedColor",
  "bottlingDate",
  "tasteNotes",
].join(",");

export function basicAuth(userId, apiKey) {
  return Buffer.from(`${userId}:${apiKey}`).toString("base64");
}

/** All batches with one status, following the API's 50-per-page limit. */
export async function fetchBatchesByStatus(status, auth) {
  const batches = [];
  let startAfter;

  do {
    const params = new URLSearchParams({ status, include: INCLUDE, limit: "50" });
    if (startAfter) params.set("start_after", startAfter);

    const res = await fetch(`${API}/batches?${params}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) {
      throw new Error(`Brewfather API ${res.status} ${res.statusText} fetching ${status} batches`);
    }

    const page = await res.json();
    batches.push(...page);
    startAfter = page.length === 50 ? page.at(-1)?._id : undefined;
  } while (startAfter);

  return batches;
}

/** Every batch the tap list could show. */
export async function fetchTapBatches(auth) {
  const results = await Promise.all(STATUSES.map((status) => fetchBatchesByStatus(status, auth)));
  return results.flat();
}
