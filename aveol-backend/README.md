# AVEOL Backend — Production API

Complete Node.js/Express backend for the [AVEOL AI Automation Agency](https://aveol.netlify.app) platform.

---

## Architecture Overview

```
aveol-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── auditController.js   # Audit form + AI analysis
│   │   ├── adminController.js   # Lead management dashboard
│   │   └── webhookController.js # Calendly integration
│   ├── middleware/
│   │   ├── auth.js              # JWT protection
│   │   ├── validation.js        # Input validation
│   │   └── rateLimiter.js       # Rate limiting + spam protection
│   ├── models/
│   │   ├── Client.js            # Client + lead schema
│   │   ├── AuditResponse.js     # Audit data + AI analysis
│   │   └── BookedCall.js        # Consultations + Admin
│   ├── routes/
│   │   ├── auditRoutes.js
│   │   ├── adminRoutes.js
│   │   └── webhookRoutes.js
│   ├── services/
│   │   ├── aiAnalysisService.js # OpenAI GPT-4o analysis
│   │   ├── pdfService.js        # Branded PDF generation
│   │   ├── emailService.js      # All email templates
│   │   └── slackService.js      # Slack notifications
│   ├── utils/
│   │   ├── logger.js            # Winston logger
│   │   └── followUpScheduler.js # Automated follow-up emails
│   ├── app.js                   # Express app setup
│   └── server.js                # Entry point
├── .env.example
├── render.yaml                  # Render deployment config
├── Procfile                     # Railway/Heroku
└── package.json
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- OpenAI API key
- Gmail account (for SMTP)

### 1. Clone & Install

```bash
git clone <your-repo>
cd aveol-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Run in Development

```bash
npm run dev
# Server starts at http://localhost:5000
# Health check: http://localhost:5000/health
```

---

## API Reference

### Public Endpoints

#### Submit Audit Form
```
POST /api/audit/submit
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@techcorp.in",
  "companyName": "TechCorp India",
  "industry": "SaaS",
  "teamSize": "6-20",
  "companyRole": "Business Owner / CEO",
  "currentTools": ["HubSpot", "Slack", "Google Workspace"],
  "biggestBottlenecks": "Manual lead follow-up taking 3hrs/day",
  "repetitiveTasks": "Data entry, report generation, email responses",
  "salesProblems": "Leads go cold after first contact",
  "customerSupportProblems": "Response time too slow, team overwhelmed",
  "leadGenIssues": "No automated outreach pipeline",
  "crmIssues": "CRM not updated, deals fall through",
  "operationsTasks": "Invoice processing, onboarding docs",
  "monthlyBusinessVolume": "₹20L–₹1Cr/month",
  "budgetRange": "₹75,000–₹2,00,000",
  "automationGoals": "Automate lead follow-up and support",
  "timeline": "Within 1 month",
  "previousAutomationExperience": "Basic (Zapier/Make)",
  "_honey": ""
}
```
**Response (202):**
```json
{
  "success": true,
  "message": "Audit submitted. Report will be emailed within minutes.",
  "data": {
    "clientId": "...",
    "auditId": "...",
    "submissionToken": "uuid-token"
  }
}
```

#### Poll Audit Status
```
GET /api/audit/status/:token
```

#### Join Waitlist
```
POST /api/audit/waitlist
Body: { "email": "...", "companyRole": "...", "_honey": "" }
```

---

### Admin Endpoints (JWT Required)

All admin endpoints require:
```
Authorization: Bearer <jwt_token>
```

#### Login
```
POST /api/admin/login
Body: { "email": "...", "password": "..." }
```

#### Dashboard Metrics
```
GET /api/admin/dashboard
```

#### Get All Leads
```
GET /api/admin/leads?page=1&limit=20&industry=SaaS&priority=hot&sortBy=leadScore&sortOrder=desc
```
Query params: `page`, `limit`, `industry`, `status`, `priority`, `minScore`, `maxScore`, `sortBy`, `sortOrder`, `search`

#### Get Lead Detail
```
GET /api/admin/leads/:id
```

#### Update Lead Status
```
PATCH /api/admin/leads/:id/status
Body: { "status": "consultation_booked", "priority": "hot", "leadScore": 85 }
```

#### Add Note
```
POST /api/admin/leads/:id/notes
Body: { "note": "Spoke to CEO — very interested, budget confirmed" }
```

#### Trigger Follow-up Email
```
POST /api/admin/leads/:id/followup
Body: { "type": "followup1" }   // or "followup2"
```

#### Export CSV
```
GET /api/admin/leads/export/csv
```

#### Booked Calls
```
GET /api/admin/calls
```

---

### Webhook Endpoints

#### Calendly Webhook
```
POST /api/webhooks/calendly
```
Configure in Calendly → Integrations → Webhooks:
- URL: `https://your-backend.onrender.com/api/webhooks/calendly`
- Events: `invitee.created`, `invitee.canceled`

---

## Deployment Guide

### Option A: Render (Recommended — Free tier available)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — all config is pre-set
5. Add environment variables in Render dashboard
6. Deploy — your URL: `https://aveol-backend.onrender.com`

### Option B: Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```
Set all env vars in Railway dashboard.

### Option C: AWS (EC2 + PM2)

```bash
# On your EC2 instance (Ubuntu)
sudo apt update && sudo apt install -y nodejs npm nginx
npm install -g pm2

git clone <your-repo> /home/ubuntu/aveol-backend
cd /home/ubuntu/aveol-backend
npm install --production
cp .env.example .env && nano .env   # fill in values

pm2 start src/server.js --name aveol-backend
pm2 startup && pm2 save

# Nginx reverse proxy
sudo nano /etc/nginx/sites-available/aveol
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.aveol.ai;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/aveol /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# Then get SSL: sudo certbot --nginx -d api.aveol.ai
```

---

## Frontend Integration (Netlify)

Add this to your Netlify site's audit form page:

```javascript
// ─────────────────────────────────────────────────────────────────
// AVEOL Audit Form — Frontend Integration
// ─────────────────────────────────────────────────────────────────

const BACKEND_URL = 'https://aveol-backend.onrender.com'; // your deployed URL

// Step 1: Submit the audit form
async function submitAuditForm(formData) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/audit/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        _honey: document.getElementById('_honey').value, // honeypot field
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token to poll status
      localStorage.setItem('aveol_audit_token', data.data.submissionToken);
      showSuccessScreen();
      pollAuditStatus(data.data.submissionToken);
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('Network error. Please try again.');
    console.error('Audit submission error:', error);
  }
}

// Step 2: Poll for audit completion
async function pollAuditStatus(token) {
  const maxAttempts = 20;
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;
    if (attempts > maxAttempts) {
      clearInterval(interval);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/audit/status/${token}`);
      const data = await res.json();

      if (data.data.status === 'completed') {
        clearInterval(interval);
        showAuditScore(data.data.auditScore, data.data.readinessLevel);
      } else if (data.data.status === 'failed') {
        clearInterval(interval);
        console.error('Audit analysis failed');
      }
    } catch (err) {
      // silently retry
    }
  }, 15000); // poll every 15 seconds
}

// Step 3: Waitlist form (from landing page)
async function submitWaitlist(email, companyRole) {
  const res = await fetch(`${BACKEND_URL}/api/audit/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, companyRole, _honey: '' }),
  });
  const data = await res.json();
  return data;
}

// Helpers
function showSuccessScreen() {
  document.getElementById('form-container').style.display = 'none';
  document.getElementById('success-screen').style.display = 'block';
}

function showAuditScore(score, level) {
  document.getElementById('audit-score').textContent = score;
  document.getElementById('readiness-level').textContent = level;
  document.getElementById('score-screen').style.display = 'block';
}

function showError(message) {
  document.getElementById('error-msg').textContent = message;
  document.getElementById('error-msg').style.display = 'block';
}
```

**Add a honeypot field to your HTML form:**
```html
<!-- Hidden honeypot — spam bots fill this, humans don't see it -->
<input
  type="text"
  id="_honey"
  name="_honey"
  style="display:none; visibility:hidden; position:absolute;"
  tabindex="-1"
  autocomplete="off"
>
```

---

## Lead Status Flow

```
new → audit_submitted → report_sent → follow_up_1 → follow_up_2
                                   ↘ consultation_booked → converted
                                                         ↘ lost
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Min 32 char random string |
| `OPENAI_API_KEY` | ✅ | GPT-4o API key |
| `SMTP_HOST` | ✅ | SMTP server (smtp.gmail.com) |
| `SMTP_PORT` | ✅ | 587 for TLS |
| `SMTP_USER` | ✅ | Your email address |
| `SMTP_PASS` | ✅ | Gmail App Password (not login password) |
| `ADMIN_EMAIL` | ✅ | Where admin notifications go |
| `CALENDLY_BOOKING_URL` | ✅ | Your Calendly link |
| `CALENDLY_WEBHOOK_SECRET` | ⚠️ | For production signature verification |
| `SLACK_WEBHOOK_URL` | Optional | Slack notifications |
| `ADMIN_REGISTRATION_CODE` | ✅ | Secret code to create admin accounts |

**Gmail App Password setup:**
1. Google Account → Security → 2-Step Verification → App Passwords
2. Select "Mail" → Generate → use that 16-char password as `SMTP_PASS`

---

## Security Features

- **Helmet.js** — Secure HTTP headers
- **CORS** — Locked to `aveol.netlify.app`
- **Rate Limiting** — 3 audit submissions/IP/hour; 10 login attempts/15min
- **Honeypot** — Silent spam detection
- **Input Validation** — express-validator on all inputs
- **JWT** — Signed tokens for admin routes
- **bcrypt** — Password hashing (12 rounds)
- **Calendly signature verification** — HMAC-SHA256
- **10kb body limit** — Prevents large payload attacks
- **Winston logging** — All events logged to files

---

## Automated Follow-up Schedule

| Day | Action |
|---|---|
| Submission | AI analysis → PDF → Report email |
| Day 3 | Follow-up 1 — "Did you review your audit?" |
| Day 7 | Follow-up 2 — "Founding client spots filling up" |

Follow-ups only sent if: no call booked + not unsubscribed + not spam.

---

## MongoDB Collections

| Collection | Purpose |
|---|---|
| `clients` | Lead profiles, scores, status, notes |
| `auditresponses` | Full audit data + AI analysis + PDF path |
| `bookedcalls` | Calendly booking details |
| `admins` | Admin users (hashed passwords) |

---

Built for AVEOL — Autonomous Intelligence. Infinite Scale.
