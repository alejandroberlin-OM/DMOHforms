# DMOH Clinical Form Assistant — CBCRP
**Department of Medical Oncology and Hematology**  
University Health Network · Princess Margaret Cancer Centre

> **Personal Productivity Tool** — Not an official UHN product.  
> AI-generated content must be verified by the treating physician before submission.

---

## What This Does

A web tool that helps DMOH physicians fill out the Ontario Health **Case-by-Case Review Program (CBCRP)** request form. Physicians paste de-identified clinical notes, the AI extracts all relevant clinical fields, and a print-ready form is generated — with Section 2 (patient PHI) intentionally left blank for manual completion.

**Privacy design:**
- PHI (patient name, DOB, OHIN) never enters the AI
- Notes processed by Anthropic API under a Business Associate Agreement (BAA)
- No patient data stored by this application
- Admin PIN required to manage the provider list

---

## Prerequisites

You need accounts at three places:

| Service | URL | Cost |
|---|---|---|
| GitHub | github.com | Free (you have this) |
| Vercel | vercel.com | Free tier |
| Anthropic API | platform.anthropic.com | Pay-per-use (~$0.02/form) |

---

## Step-by-Step Setup

### 1. Push to GitHub

```bash
# In the project folder
git init
git add .
git commit -m "Initial commit — DMOH CBCRP Assistant"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dmoh-cbcrp.git
git push -u origin main
```

> **⚠ Never commit a `.env` file.** The `.gitignore` already excludes it.

---

### 2. Create Vercel Account & Deploy

1. Go to [vercel.com](https://vercel.com) → **Sign Up with GitHub**
2. Click **Add New Project** → Import your `dmoh-cbcrp` repository
3. Vercel auto-detects Vite — just click **Deploy**
4. Your site will be live at `https://dmoh-cbcrp.vercel.app` (or similar)

---

### 3. Set Up Vercel KV (Provider Database)

The provider list is stored in Vercel KV (a key-value database).

1. In your Vercel project dashboard → click **Storage** tab
2. Click **Create Database** → choose **KV**
3. Name it `dmoh-providers` → click **Create**
4. Vercel automatically adds the required environment variables to your project

---

### 4. Get Your Anthropic API Key

1. Go to [platform.anthropic.com](https://platform.anthropic.com)
2. Create an account (separate from claude.ai)
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Add $10–20 in credits to start (~$0.02/form = thousands of forms per dollar)

> **BAA Note:** For PHIPA compliance, contact Anthropic to sign a Business Associate Agreement before going live with real patient notes. See: https://www.anthropic.com/legal/hipaa

---

### 5. Add Environment Variables to Vercel

In your Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-your-key-here` | From platform.anthropic.com |
| `ADMIN_PIN` | `choose-a-pin` | Used to add/edit providers |

> The `KV_REST_API_URL` and `KV_REST_API_TOKEN` variables are added **automatically** by Vercel KV — do not set these manually.

After adding variables, go to **Deployments** → **Redeploy** (required for env vars to take effect).

---

### 6. Restrict Access (Recommended for MVP)

Since this is an internal tool, add Vercel password protection:

1. Vercel project → **Settings** → **Deployment Protection**
2. Enable **Vercel Authentication** (free on hobby plan) or set a **shared password**
3. Only people with the password can access the site

---

## Adding Providers

Providers are managed through the app (requires admin PIN):

1. Go to your deployed site
2. On Step 1 (Provider Selection) → click **+ Add Provider**
3. Enter the **Admin PIN** you set in Vercel environment variables
4. Fill in provider details → **Save**

The provider list is stored in Vercel KV and shared across all users.

---

## Local Development

```bash
npm install
npm install -g vercel   # Install Vercel CLI (one time)
vercel link             # Link to your Vercel project (pulls env vars)
npm run dev:full        # Runs Vite + API routes with your Vercel env vars
```

For UI-only development (API calls won't work):
```bash
npm run dev
```

---

## File Structure

```
dmoh-cbcrp/
├── api/
│   ├── extract.js         ← LLM extraction (Anthropic API call)
│   ├── providers.js       ← Provider CRUD (Vercel KV)
│   └── verify-pin.js      ← Admin PIN validation
├── src/
│   ├── components/
│   │   ├── DisclaimerModal.jsx
│   │   ├── Header.jsx
│   │   ├── StepBar.jsx
│   │   ├── StepProviders.jsx
│   │   ├── ProviderModal.jsx
│   │   ├── StepNotes.jsx
│   │   └── StepReview.jsx
│   ├── utils/
│   │   ├── api.js          ← Frontend API call helpers
│   │   └── printHTML.js    ← Generates printable form
│   ├── constants.js        ← Colours, shared state
│   ├── App.jsx             ← Main orchestrator
│   └── main.jsx            ← React entry point
├── index.html
├── vite.config.js
├── vercel.json
├── package.json
├── .env.example            ← Template (copy to .env for local dev)
└── README.md
```

---

## How the Tool Works

1. **Provider selects themselves** from the central list → auto-fills Section 1
2. **Paste de-identified clinical notes** (no patient name/DOB/OHIN)
3. **Claude Sonnet** extracts and maps clinical info to all form fields
4. **Physician reviews and edits** every field before downloading
5. **Print/Save PDF** → complete Section 2 (patient PHI) by hand → submit via eClaims

---

## Cost Estimate

| Usage | Monthly API Cost |
|---|---|
| 50 forms/month | ~$1.00 |
| 200 forms/month | ~$4.00 |
| 500 forms/month | ~$10.00 |

Model: `claude-sonnet-4-6` · ~2,000–2,500 tokens per form extraction

---

## Disclaimers

- This tool is a **personal productivity aid** — not a clinical decision support system
- **Not an official product** of UHN, Princess Margaret Cancer Centre, or Ontario Health
- AI-generated content may be **incomplete or inaccurate** — the treating physician must review all fields
- The treating physician is **solely responsible** for the accuracy of any submitted CBCRP form
- Patient PHI must **never** be entered into the clinical notes field
- For PHIPA compliance, ensure a BAA is signed with Anthropic before clinical use

---

## Support

For issues with the tool, contact the DMOH admin who set it up.  
For CBCRP program questions: **OH-CCO_cbcrp@ontariohealth.ca**  
Submit forms via eClaims: [cancercareontario.ca](https://www.cancercareontario.ca/en/Funding/Case-by-Case_Review_Program)
