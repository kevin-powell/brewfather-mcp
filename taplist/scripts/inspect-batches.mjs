// Dumps the raw Brewfather response the tap list sees, so you can check field names and colour units.
// Usage: npm run inspect            (Completed batches)
//        npm run inspect Conditioning
const { BREWFATHER_API_USER_ID: user, BREWFATHER_API_KEY: key } = process.env;
if (!user || !key) {
  console.error("Set BREWFATHER_API_USER_ID and BREWFATHER_API_KEY (e.g. in taplist/.env).");
  process.exit(1);
}

const status = process.argv[2] ?? "Completed";
const include =
  "recipe.style,recipe.abv,recipe.ibu,recipe.color,recipe.teaser,measuredAbv,estimatedIbu,estimatedColor,bottlingDate,tasteNotes";
const res = await fetch(
  `https://api.brewfather.app/v2/batches?${new URLSearchParams({ status, include, limit: "50" })}`,
  { headers: { Authorization: `Basic ${Buffer.from(`${user}:${key}`).toString("base64")}` } },
);

console.log(res.status, res.statusText);
console.log(JSON.stringify(await res.json(), null, 2));
