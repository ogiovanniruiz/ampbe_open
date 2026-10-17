# Live election results scraper — headless Chrome (disabled)

The live election results feature (Home → **Live election results**, `components/home/homeDialogs/liveElectionResults`) pulls results from three sources:

| Source | Service | Needs a browser? | Status |
|---|---|---|---|
| San Bernardino County | `services/amp/getLiveSBResults.js` | No — `axios` + `cheerio` | **Working** |
| CA Secretary of State | `services/amp/getLiveSOSResults.js` | No — plain HTTP | **Working** |
| Riverside County | `services/amp/getLiveRiversideResults.js` | **Yes** — the page is built by JavaScript, so it's loaded in headless Chrome via `puppeteer` | **Disabled** |

Endpoints: `POST /api/getLiveSBResults`, `/api/getLiveRiversideResults`, `/api/getLiveElectionResults` (all three combined).

## What was removed, and why

Headless Chrome made every Heroku deploy slow: the build downloaded a full Chrome (hundreds of MB) through an npm `postinstall` script, and a Chrome buildpack added another one. Only the Riverside scraper used it.

Removed:

| Piece | Where it was |
|---|---|
| `puppeteer` `^25.11.0` (pulls in `puppeteer-core` and its Chrome download) | `amp3server/package.json` dependencies |
| `"postinstall": "npx puppeteer browsers install chrome"` | `amp3server/package.json` scripts |
| Buildpack `heroku-community/chrome-for-testing` (was position 2, after `heroku/nodejs`) | Heroku app `secret-beach-04450` |
| Config vars `PUPPETEER_CACHE_DIR=/app/.cache/puppeteer` and `PUPPETEER_EXECUTABLE_PATH=/app/.chrome-for-testing/chrome-linux64/chrome` | Heroku app config (optional to remove) |
| `pdf-parse` `^2.4.5` — not used by any code; removed at the same time | `amp3server/package.json` dependencies |

Kept: `cheerio` (San Bernardino scraper **and** `services/organization/getTerms.js`, the Terms of Use page).

While disabled, `getLiveRiversideResults` loads puppeteer lazily, logs
`Live Riverside results are disabled (puppeteer not installed)` and returns `[]`. The server starts normally, and the combined endpoint still returns San Bernardino and Secretary of State results.

## Bringing it back

From `amp3server/`:

1. Install puppeteer:
   ```bash
   npm install puppeteer@^25.11.0
   ```
2. Re-add the Chrome download to `package.json` → `"scripts"`:
   ```json
   "postinstall": "npx puppeteer browsers install chrome"
   ```
3. Add the Chrome buildpack back after Node:
   ```bash
   heroku buildpacks:add -i 2 heroku-community/chrome-for-testing -a secret-beach-04450
   ```
4. Point puppeteer at that Chrome:
   ```bash
   heroku config:set PUPPETEER_CACHE_DIR=/app/.cache/puppeteer PUPPETEER_EXECUTABLE_PATH=/app/.chrome-for-testing/chrome-linux64/chrome -a secret-beach-04450
   ```
5. Deploy, then check `POST /api/getLiveRiversideResults` returns races instead of `[]`.
6. Update the race names (`RACES`) and the results page `URL` in `getLiveRiversideResults.js` for the new election.

No code change is needed: the lazy `require("puppeteer")` picks it up once installed. (Optionally move it back to a top-level `require`.)

If a PDF scraper is ever added: `npm install pdf-parse@^2.4.5`.

## Local development

Locally, puppeteer launches its own downloaded Chrome when `PUPPETEER_EXECUTABLE_PATH` isn't set. While the feature is disabled, the downloaded Chrome cache can be deleted to free ~1.3 GB:

```bash
rm -rf ~/.cache/puppeteer
```
