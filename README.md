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


