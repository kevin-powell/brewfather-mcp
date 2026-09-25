# Tap list

A static Astro page showing what's on tap, pulled from Brewfather at build time.

- **On tap**: batches with status `Completed`
- **Coming soon**: batches with status `Conditioning` or `Fermenting`, closest-to-ready first. Each card gets a status pill; fermenting beers get a hazy glass with rising bubbles (paused for `prefers-reduced-motion`).
- When a keg kicks, set the batch to `Archived` in Brewfather and it drops off on the next rebuild.

No API keys reach the browser; the page is plain HTML and CSS (CUBE CSS, cascade layers, no framework).

## Local development

Needs Node 22.12 or newer.

```bash
cd taplist
npm install
cp .env.example .env   # add your Brewfather API user ID + key (optional)
npm run dev
```

Without credentials it renders sample beers with a yellow banner, so you can work on the design offline.

`npm run inspect` (or `npm run inspect Conditioning` / `npm run inspect Fermenting`) prints the raw API response. Use it once to confirm:

- the fields are coming through (style, ABV, IBU, colour, kegging date), and
- whether colour is SRM or EBC — compare a beer's number to the Brewfather app and set `colorUnit` in `src/config.ts`.

## Shopping list

`/shopping` is an unlisted page (not linked from the tap list, `noindex`) listing ingredients to buy for upcoming brews. Tick items off on your phone; ticks are saved in that browser only.

It renders `src/data/shopping-list.json`, which Claude writes when you plan a recipe with the **brew-shopping-list** skill: it checks the recipe against your Brewfather inventory and adds a list for that brew. Commit and push the file to publish it. See `src/data/shopping-list.example.json` for the format; delete a brew's entry once you've shopped.

## Customising

| File | What it's for |
| --- | --- |
| `src/config.ts` | Site name, tagline, colour unit, batch number display |
| `src/data/tap-notes.json` | Per-batch overrides keyed by batch number |
| `src/data/shopping-list.json` | Shopping lists for upcoming brews (written by Claude) |
| `src/styles/` | `global.css`, `compositions.css`, `utilities.css`, `blocks/*` |

Example `tap-notes.json`:

```json
{
  "23": { "tap": 1, "description": "Bright, citrusy, dangerously drinkable." },
  "19": { "hidden": true }
}
```

Beers with a `tap` number are listed first, in tap order. Descriptions fall back to the batch's **Taste notes** in Brewfather.

## Deploying to Netlify

1. Push this repo to your own GitHub (see `../HOMEBREW-SETUP.md`), then **Add new site → Import from Git**.
2. **Base directory:** `taplist` (build command and publish dir come from `netlify.toml`).
3. **Environment variables:** `BREWFATHER_API_USER_ID`, `BREWFATHER_API_KEY`. A separate read-only Brewfather key is a good idea here.
4. Deploy. The build fails rather than publishing sample data if the keys are missing.

### Auto-refresh

Brewfather has no webhooks, so `.github/workflows/taplist-refresh.yml` checks for changes every hour on GitHub Actions (free for public repos). It fingerprints the batch data the page shows (`npm run hash`) and only calls the Netlify build hook when that fingerprint changes, so quiet hours use no Netlify credits.

1. Netlify: **Site configuration → Build & deploy → Build hooks → Add build hook**.
2. GitHub: **Settings → Secrets and variables → Actions**, add `BREWFATHER_API_USER_ID`, `BREWFATHER_API_KEY` and `NETLIFY_BUILD_HOOK_URL`.
3. GitHub: **Actions** tab, enable workflows for the fork, then run **Tap list refresh** once by hand.

Pushes that touch `taplist/` (e.g. shopping lists) still build straight away; Netlify skips pushes that don't change `taplist/`. To force a refresh, run the workflow with **Rebuild even if nothing changed** ticked.
