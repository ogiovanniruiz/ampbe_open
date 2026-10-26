# Amplify (backend)

Amplify is an organizing platform for campaigns and community organizations. Organizations build target groups from the voter file and their own membership. They then run outreach activities on them, such as door canvassing, phonebanking, texting and petitions, and track the results in reports and campaign summaries. A hotline module handles incidents and rapid response.

This folder is the API: an Express 5 and Mongoose 9 server on Node 24, currently **version 3.8.0** (set at the top of `app.js`). The Angular web client lives in [`ampfe_open`](https://github.com/ogiovanniruiz/ampfe_open).

## Requirements

- Node.js 24 and npm 11 (`engines` in `package.json`)
- A MongoDB database
- Accounts for the integrations you use: SignalWire (calling, texting, hotline), Twilio (older calling and texting accounts), Geocodio (address geocoding), a Gmail account for outgoing email, and a Google Cloud service account for the BigQuery and Google Sheets sync

## Development server

```bash
npm install

# Create .env.development (see Configuration below), then:
npm run devstart
```

`devstart` runs `bin/www` with nodemon and `NODE_ENV=development`, so `app.js` loads `.env.development`. The API listens on port 3000 unless `PORT` is set. The server refuses to start if `jwtSecret` is missing.

Start the client from `../ampfe_open` with `ng serve`; it calls the API at `http://localhost:3000`.

## Configuration

Settings come from environment variables. Locally they're read from `.env.development`; in production, set them in your host's environment. Neither `.env.*` files nor `service_accounts/` are tracked by git, so never commit keys to the repo.

| Variable | Purpose |
|---|---|
| `mongoDB` | MongoDB connection string |
| `jwtSecret` | Signs and verifies login tokens (required) |
| `fe` | The client's URL. Used as the CORS origin and in links sent by email. |
| `be` | The API's public URL. Used for the SignalWire and Twilio webhook addresses. |
| `signalWireMainProjectID` | SignalWire main project ID |
| `signalWireAPIToken` | SignalWire API token |
| `signalWireToken` | SignalWire Basic auth credentials, used for the 10DLC brand lookup |
| `signalWireSpaceURL` | SignalWire space host, without `https://` |
| `twilioAccountSid` | Twilio main account SID |
| `twilioAuthToken` | Twilio main account auth token |
| `geocodioAPIKey` | Geocodio API key |
| `googleMapsKey` | Google Maps key handed to the client by `/api/getClientConfig` |
| `contactEmail` | Gmail address used to send email (password resets, support messages) |
| `contactEmailPassword` | App password for `contactEmail` |
| `devEmails` | Comma-separated recipients of the in-app "contact developers" form |
| `vapidSubject` | Web push contact, as `mailto:you@example.org` |
| `vapidPublicKey` | Web push VAPID public key (the client uses the same one) |
| `vapidPrivateKey` | Web push VAPID private key |
| `testCallingNumber` | Demo builds only: a number the client can use for test calls. Never set it in production. |
| `NODE_ENV` | `development` or `production`. `npm start` and `npm run devstart` set it for you. |
| `PORT` | Port to listen on (default 3000; most hosts set it) |

The `version` variable is set by `app.js` itself, not by the environment.

**Google service accounts:** the Google Sheets and BigQuery syncs (`services/summary/syncFunctions/`) use the service-account JSON key uploaded to the organization in Edit Organization (stored in the `orgserviceaccounts` collection, never sent to the browser). An org without a key gets a message that the sync isn't set up. Users must share a sheet as Editor with the email shown in Edit Organization before it can be synced. The BigQuery one-offs use the key of the org that runs them.

## How it's organized

| Path | What's there |
|---|---|
| `bin/www` | Starts the HTTP server |
| `app.js` | Loads config, connects to MongoDB, and sets up CORS, body parsing and the routers |
| `routes/api/<area>/` | One file per endpoint. `routes/createRouter.js` mounts every router it finds under `/api`, so a new file is picked up automatically. |
| `services/<area>/` | The logic behind each endpoint |
| `models/` | Mongoose schemas |
| `middleware/requireAuth.js` | JWT check for `/api` |
| `routes/media/` | Serves texting images under `/media` (no login) |
| `config/` | Static content, such as the terms of use |
| `docs/` | Notes on specific features |

The areas follow the app's features: `activity`, `amp`, `campaign`, `canvass`, `contactRecord`, `group`, `hotline`, `membership`, `organization`, `people`, `petition`, `phonebank`, `shape`, `summary`, `survey`, `texting` and `user`.

One-off data maintenance scripts are kept in `scripts/` locally and aren't tracked in git.

## Authentication

Every `/api` request needs an `Authorization: Bearer <token>` header with a JWT signed by `jwtSecret`. The exceptions are listed in `PUBLIC_ROUTES` in `middleware/requireAuth.js`: login, signup, password reset, version check, the contact form, and the Twilio and SignalWire webhooks.

## Deploy

- `npm start` runs `bin/www` with `NODE_ENV=production` and a larger memory limit. The `Procfile` (`web: npm start`) is there for hosts that read one.
- Optional static IP: if `QGTUNNEL_CONFIG` is set, `npm start` runs the app through a QuotaGuard static-IP tunnel (`bin/qgtunnel`), so the database can allow-list a fixed address. The `build` script downloads it. Without the variable the app runs directly.

Before you deploy:

1. **Add new environment variables first.** If the code reads a new environment variable, set it in your host's environment before you deploy.
2. **Keep versions in sync.** When you bump the version, change it in both `app.js` and `ampfe_open/src/environments/version.ts`. The client sends its version to `/api/checkVersion` on every protected route, and a mismatch logs the user out.

## Further reading

- [`docs/LIVE_ELECTION_SCRAPER.md`](docs/LIVE_ELECTION_SCRAPER.md): the live election results sources, and why the Riverside scraper is disabled

## License

GNU Affero General Public License v3.0. See [`LICENSE`](LICENSE).
