import type { Config } from "@netlify/functions";

// Brewfather has no webhooks, so rebuild on a schedule to pick up status changes.
// Needs a build hook: Site configuration → Build & deploy → Build hooks,
// then save its URL as the BUILD_HOOK_URL environment variable.
export default async () => {
  const hook = process.env.BUILD_HOOK_URL;
  if (!hook) {
    console.error("BUILD_HOOK_URL is not set; skipping rebuild.");
    return;
  }

  const res = await fetch(`${hook}?trigger_title=Scheduled+tap+list+refresh`, { method: "POST" });
  console.log(`Triggered rebuild: ${res.status}`);
};

export const config: Config = {
  // Every 6 hours (UTC). Each build is a few seconds of build minutes.
  schedule: "0 */6 * * *",
};
