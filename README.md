# Project Tracker & Admin Console (FastAPI + Tailscale Funnel)

A full-stack **Project Developments Tracker, Interactive Gantt Studio, and Role-Based Admin Console** built on **FastAPI**, **SQLAlchemy (SQLite)**, and vanilla HTML5/ES6+, packaged in a single Docker container with **Tailscale Funnel** for public HTTPS access at:

👉 **`https://project-tracker.ratfish-regulus.ts.net`**

---

## 1. Architecture Overview

| Component | Technology / Path | Purpose |
| :--- | :--- | :--- |
| **Backend API & Static Server** | [`app.py`](app.py) (FastAPI + Uvicorn) | Serves all REST API endpoints (`/api/*`) and static frontend pages on port `8000` |
| **Database** | `instance/rest_api.db` (SQLite WAL) | Persists users, sessions, audit logs, projects, section progress, update logs, and Gantt schedules |
| **Frontend UI** | [`frontend/`](frontend/) | Responsive dark-slate UI (`login.html`, `admin_dashboard.html`, `user_index.html`, `gantt_chart_creator.html`, section managers) |
| **Tailscale + Funnel** | [`docker-entrypoint.sh`](docker-entrypoint.sh) | Runs `tailscaled` inside the container as hostname **`project-tracker`** on tailnet **`ratfish-regulus.ts.net`** and exposes port `8000` via **Tailscale Funnel** on port `443` |
| **API Key Generator** | [`api_key_generator.py`](api_key_generator.py) | Generates the `.env` `API_KEY` used for direct CLI (`curl` / `Invoke-RestMethod`) queries |

---

## 2. Project Structure

```text
.
├── app.py                     # FastAPI application, SQLAlchemy models & REST endpoints
├── api_key_generator.py       # Generates a 256-bit API_KEY in .env
├── requirements.txt           # Pinned Python dependencies
├── Dockerfile                 # Multi-stage image bundling Python 3.12 + official Tailscale binaries
├── docker-compose.yml         # Container orchestration, volumes, and TUN capabilities
├── docker-entrypoint.sh       # Container startup script (tailscaled + Funnel + Uvicorn)
├── .dockerignore              # Excludes local venvs, caches, and DB files from build context
├── .gitignore                 # Excludes .env, venvs, and runtime SQLite files from Git
├── .env                       # Stores API_KEY (and optional TS_AUTHKEY)
├── instance/
│   └── rest_api.db            # SQLite database (persisted via Docker volume)
└── frontend/
    ├── login.html             # Web sign-in page (Username/Email + Password)
    ├── admin_dashboard.html   # Admin Console (User CRUD, Password Reset, Projects, Audit Trail)
    ├── user_index.html        # Project & Section Progress Dashboard
    ├── gantt_chart_creator.html # Interactive Gantt Chart Studio (Drag-and-drop, PDF/PNG export)
    ├── state.js               # Shared API client, RBAC session manager & section definitions
    └── *_manage_subitems.html # Discipline sub-item progress & template managers
```

---

## 3. Tailscale Prerequisites (One-Time Setup)

To make the container publicly accessible at **`https://project-tracker.ratfish-regulus.ts.net`**, verify the following in your [Tailscale Admin Console](https://login.tailscale.com/admin):

### Step 3.1 — Enable MagicDNS & HTTPS Certificates
1. Open **[DNS Settings](https://login.tailscale.com/admin/dns)**.
2. Ensure your Tailnet name is **`ratfish-regulus.ts.net`** and **MagicDNS** is **Enabled**.
3. Scroll down to **HTTPS Certificates** and click **Enable HTTPS**.

### Step 3.2 — Allow Funnel in Tailscale ACL Policy
1. Open **[Access Controls (ACLs)](https://login.tailscale.com/admin/acls/file)**.
2. Ensure the `funnel` node attribute is present in `nodeAttrs` (this is included by default on most tailnets):
   ```json
   "nodeAttrs": [
     {
       "target": ["autogroup:member", "tag:container"],
       "attr": ["funnel"]
     }
   ]
   ```

### Step 3.3 — Generate a Tailscale Auth Key
1. Open **[Settings → Keys](https://login.tailscale.com/admin/settings/keys)**.
2. Click **Generate auth key...**
   - **Reusable**: Optional (recommended if redeploying frequently)
   - **Ephemeral**: **Off** (keep off so the node identity persists in the `tailscale-state` Docker volume)
3. Copy the generated key (`tskey-auth-...`).

---

## 4. Environment Configuration (`.env`)

1. If you do not already have an `API_KEY` in `.env`, generate one:
   ```bash
   python3 api_key_generator.py
   ```
2. Add your `TS_AUTHKEY` to `.env` (or pass it in your shell environment):
   ```ini
   API_KEY=sk_live_your_generated_api_key_here
   TS_AUTHKEY=tskey-auth-xxxxxxxxxxxxxxxxxxxx-yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   TS_HOSTNAME=project-tracker
   TS_TAILNET=ratfish-regulus.ts.net
   ```

> **Note:** If you leave `TS_AUTHKEY` blank, the container will still start and print an interactive login URL in `docker logs project-tracker` that you can open in your browser to authorize the `project-tracker` node once.

---

## 5. Building & Deploying with Docker Compose

### Step 5.1 — Build and Start the Container
From the project root directory, run:

```bash
docker compose up -d --build
```

### Step 5.2 — Verify Container & Tailscale Funnel Status
Check the container startup logs:

```bash
docker compose logs -f project-tracker
```

You should see output similar to:
```text
[entrypoint] Starting tailscaled daemon (hostname=project-tracker, tailnet=ratfish-regulus.ts.net)...
[entrypoint] Running tailscale up...
[entrypoint] Tailscale is connected.
[entrypoint] Configuring Tailscale Funnel for https://project-tracker.ratfish-regulus.ts.net -> http://127.0.0.1:8000...
https://project-tracker.ratfish-regulus.ts.net (Funnel on)
|-- / proxy http://127.0.0.1:8000
[entrypoint] Starting FastAPI server on 0.0.0.0:8000...
```

### Step 5.3 — Manual / Interactive Tailscale Authorization (If Not Using `TS_AUTHKEY`)
If you deployed without setting `TS_AUTHKEY` in `.env`, run these commands once after starting the container:

```bash
# 1. Authenticate the node as 'project-tracker'
docker exec -it project-tracker tailscale up --hostname=project-tracker

# 2. Enable Tailscale Funnel on HTTPS port 443 -> local port 8000
docker exec -it project-tracker tailscale funnel --bg 8000

# 3. Verify Funnel status
docker exec -it project-tracker tailscale funnel status
```

---

## 6. Accessing the Web Application

Once deployed, the application is accessible at:

- **Public Tailscale Funnel URL**:  
  **[`https://project-tracker.ratfish-regulus.ts.net`](https://project-tracker.ratfish-regulus.ts.net)**
- **Local / Host URL**:  
  **`http://127.0.0.1:8000`**
- **Interactive OpenAPI Docs**:  
  **`https://project-tracker.ratfish-regulus.ts.net/docs`**

### Default Seeded Accounts (Web Login)
Web users sign in at `/login.html` using **Username/Email + Password** only (no API Key required in the browser):

| Role | Username | Default Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123` | Full User Management (Create/Edit/Soft & Permanent Delete/Password Reset), Audit Logs, plus all Project & Gantt features |
| **Regular User** | `engineer` | `User@123` | Self-service password change, Project CRUD & status updates, Section sub-item progress, and Interactive Gantt Studio (PDF/PNG export) |

> **Security Tip:** Sign in as `admin` immediately after first deployment and change the default password using the **🔑 Change Password** button in the top navigation bar.

---

## 7. Direct CLI / API Queries (`X-API-KEY`)

While browser users authenticate via session tokens issued at `/api/auth/login`, direct command-line queries (`curl` or PowerShell `Invoke-RestMethod`) authenticate using the `X-API-KEY` header matching `API_KEY` in `.env`.

### PowerShell (`Invoke-RestMethod`)

**Against Tailscale Funnel URL:**
```powershell
Invoke-RestMethod -Uri "https://project-tracker.ratfish-regulus.ts.net/api/admin/users" -Headers @{ "X-API-KEY" = (Get-Content 'D:\alex-api-key-project\.env' | Select-String "API_KEY").ToString().Split("=")[1] }
```

**Against Localhost:**
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin/users" -Headers @{ "X-API-KEY" = (Get-Content 'D:\alex-api-key-project\.env' | Select-String "API_KEY").ToString().Split("=")[1] }
```

### Bash (`curl`)

**Against Tailscale Funnel URL:**
```bash
curl -sS -H "X-API-KEY: $(grep '^API_KEY=' .env | cut -d= -f2)" \
  https://project-tracker.ratfish-regulus.ts.net/api/admin/users
```

**Health Check (Public):**
```bash
curl -sS https://project-tracker.ratfish-regulus.ts.net/api/health
```

---

## 8. Operations, Persistence & Troubleshooting

### Data Persistence
The `docker-compose.yml` mounts four persistent paths so your data and Tailscale identity survive container rebuilds and restarts:
1. `./instance:/app/instance` — SQLite database (`rest_api.db`).
2. `./frontend:/app/frontend` — Frontend assets and `state.js` template definitions.
3. `./.env:/app/.env` — Persistent `API_KEY`.
4. `tailscale-state:/var/lib/tailscale` — Named Docker volume storing the `project-tracker` machine key and Let's Encrypt TLS certificates for `project-tracker.ratfish-regulus.ts.net`.

### Common Maintenance Commands

```bash
# Check container health and status
docker compose ps

# View real-time FastAPI & Tailscale logs
docker compose logs -f

# Check Tailscale IP and peer status inside the container
docker exec -it project-tracker tailscale status

# Check Tailscale Funnel configuration
docker exec -it project-tracker tailscale funnel status

# Restart the container
docker compose restart

# Rebuild after code changes
docker compose up -d --build

# Stop the container (preserves SQLite DB and Tailscale state volume)
docker compose down
```

### Troubleshooting
- **Hostname shows `project-tracker-1` in Tailscale Admin Console**:  
  This happens if an old machine named `project-tracker` already exists in your Tailnet. Delete the old node in the [Tailscale Machines Console](https://login.tailscale.com/admin/machines) and rename the current node to `project-tracker`.
- **First request to `https://project-tracker.ratfish-regulus.ts.net` takes 10–20 seconds**:  
  On the very first HTTPS request, `tailscaled` automatically provisions a Let's Encrypt TLS certificate for `project-tracker.ratfish-regulus.ts.net` and caches it in the `tailscale-state` volume. Subsequent requests are instant.
- **`/dev/net/tun` not available on restricted VPS**:  
  [`docker-entrypoint.sh`](docker-entrypoint.sh) automatically detects if `/dev/net/tun` is missing and falls back to `--tun=userspace-networking`.
