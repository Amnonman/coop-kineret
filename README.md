# Coop Kineret — Google Apps Script Quiz + Registration

This directory contains a Google Apps Script web app that serves:
- Welcome landing page
- Quiz (multiple choice, graded server-side)
- Token-gated registration page (only accessible after passing)

All storage is in Google Sheets (tab `Responses`).

## Files
- `apps-script/Code.gs` — server-side logic (doGet, grade, token gate)
- `apps-script/Welcome.html` — landing page
- `apps-script/Index.html` — quiz UI
- `apps-script/Register.html` — gated registration page
- `apps-script/appsscript.json` — Apps Script manifest
- `.clasp.json` — clasp config (script binding)
- `.github/workflows/deploy-apps-script.yml` — CI workflow to deploy on push

## Setup
1) Create a Google Sheet and copy its ID (the string between `/d/` and `/edit` in the URL).
2) In `apps-script/Code.gs`, set:
   - `SHEET_ID = 'YOUR_SHEET_ID'`
   - Update `ANSWERS` and `PASS_THRESHOLD` as needed.

## Deploy to Apps Script
Two options:

### A) Manually copy-paste
1. In Google Drive → New → Google Apps Script.
2. Create files: `Code.gs`, `Welcome.html`, `Index.html`, `Register.html`.
3. Paste contents from this repo into each file.
4. In the editor: Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone (or Anyone with the link)
   - Deploy and open the `/exec?p=welcome` URL.

### B) Using `clasp` (optional)
```
npm i -g @google/clasp
clasp login
clasp create --type webapp --rootDir apps-script --title "Coop Kineret Quiz"
clasp push
clasp deploy
```

## First-run authorization
Run `gradeDryRun` once from the Apps Script editor (Run → `gradeDryRun`) and approve permissions. Confirm a test row appears in the `Responses` sheet.

## Live URLs
- Welcome: `.../exec?p=welcome`
- Quiz: `.../exec?p=quiz`
- Register (gated): `.../exec?p=register&token=...` (redirected after passing)

## Notes
- The register page is token-gated via `CacheService`; tokens expire after 15 minutes and are consumed on first use.
- Add headers to the `Responses` sheet (optional): `Timestamp | Email | Score | AnswersJSON`.

## CI deploy (GitHub Actions)
This repo includes a workflow that deploys to Google Apps Script whenever you push to `main`.

Secrets required in the GitHub repo (Settings → Secrets and variables → Actions):
- `GOOGLE_CLIENT_ID` — From your Google Cloud OAuth credentials
- `GOOGLE_CLIENT_SECRET` — From your Google Cloud OAuth credentials
- `GOOGLE_REFRESH_TOKEN` — Your refresh token (from a `clasp login` you did locally)
- `GAS_SCRIPT_ID` — Apps Script Project Script ID (from the Script Editor: Project Settings → Script ID)
- `GAS_DEPLOYMENT_ID` (optional) — Existing Web App deployment ID to update. If omitted, the workflow will create a new deployment each run.

How to obtain a refresh token:
1. Install clasp locally: `npm i -g @google/clasp`
2. In this repo root, run: `clasp login` and complete the OAuth flow
3. Open `~/.clasprc.json` and copy `oauth2ClientSettings.clientId`, `oauth2ClientSettings.clientSecret`, and `token.refresh_token` into the GitHub secrets above.

How it works:
- The workflow writes `~/.clasprc.json` from the provided secrets
- It writes `.clasp.json` from `GAS_SCRIPT_ID`
- Runs `clasp push -f` to upload sources from `apps-script/`
- Runs `clasp deploy`:
  - If `GAS_DEPLOYMENT_ID` is set: updates that deployment
  - Otherwise: creates a new deployment

Important:
- Make sure your Apps Script project is a standalone project (not only container-bound) and you have permissions to deploy Web Apps.
- After the first deploy, in the Script Editor → Deployments, set the Web App access (“Execute as” and “Who has access”) as needed.


