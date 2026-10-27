#!/usr/bin/env bash
set -euo pipefail

APP_PORT="${PORT:-8000}"
TS_HOSTNAME="${TS_HOSTNAME:-project-tracker}"
TS_TAILNET="${TS_TAILNET:-ratfish-regulus.ts.net}"
TS_STATE_DIR="${TS_STATE_DIR:-/var/lib/tailscale}"
TS_SOCKET="${TS_SOCKET:-/var/run/tailscale/tailscaled.sock}"

mkdir -p "${TS_STATE_DIR}" /var/run/tailscale /app/instance

# 1. Ensure .env / API_KEY exists
if [ -z "${API_KEY:-}" ] && [ ! -f "/app/.env" ]; then
    echo "[entrypoint] Generating initial .env file with API_KEY..."
    python /app/api_key_generator.py
fi

# 2. Start tailscaled daemon inside the container
if command -v tailscaled >/dev/null 2>&1; then
    echo "[entrypoint] Starting tailscaled daemon (hostname=${TS_HOSTNAME}, tailnet=${TS_TAILNET})..."
    TUN_FLAG=""
    if [ ! -e /dev/net/tun ]; then
        echo "[entrypoint] /dev/net/tun not found; using userspace-networking mode."
        TUN_FLAG="--tun=userspace-networking"
    fi

    tailscaled \
        --state="${TS_STATE_DIR}/tailscaled.state" \
        --socket="${TS_SOCKET}" \
        ${TUN_FLAG} \
        ${TS_DAEMON_EXTRA_ARGS:-} &

    # Wait up to 15s for tailscaled socket
    for i in $(seq 1 30); do
        if [ -S "${TS_SOCKET}" ]; then
            break
        fi
        sleep 0.5
    done

    # 3. Authenticate & bring up Tailscale
    TS_UP_ARGS=("--hostname=${TS_HOSTNAME}" "--accept-dns=true")
    if [ -n "${TS_AUTHKEY:-}" ]; then
        TS_UP_ARGS+=("--authkey=${TS_AUTHKEY}")
    fi
    if [ -n "${TS_EXTRA_ARGS:-}" ]; then
        # shellcheck disable=SC2206
        TS_UP_ARGS+=(${TS_EXTRA_ARGS})
    fi

    echo "[entrypoint] Running tailscale up..."
    if tailscale --socket="${TS_SOCKET}" up "${TS_UP_ARGS[@]}"; then
        echo "[entrypoint] Tailscale is connected."
        # 4. Enable Tailscale Funnel -> https://project-tracker.ratfish-regulus.ts.net -> 127.0.0.1:8000
        echo "[entrypoint] Configuring Tailscale Funnel for https://${TS_HOSTNAME}.${TS_TAILNET} -> http://127.0.0.1:${APP_PORT}..."
        tailscale --socket="${TS_SOCKET}" funnel --bg --https=443 "http://127.0.0.1:${APP_PORT}" \
            || tailscale --socket="${TS_SOCKET}" funnel --bg "${APP_PORT}" \
            || echo "[entrypoint] WARNING: Could not enable Tailscale Funnel automatically. Ensure Funnel & HTTPS certificates are enabled in the Tailscale Admin Console."
        tailscale --socket="${TS_SOCKET}" funnel status || true
    else
        echo "[entrypoint] WARNING: 'tailscale up' did not complete automatically. Set TS_AUTHKEY or run 'docker exec -it project-tracker tailscale up --hostname=${TS_HOSTNAME}'."
    fi
fi

# 5. Start FastAPI (Uvicorn) server
echo "[entrypoint] Starting FastAPI server on 0.0.0.0:${APP_PORT}..."
exec uvicorn app:app \
    --host 0.0.0.0 \
    --port "${APP_PORT}" \
    --proxy-headers \
    --forwarded-allow-ips="*"
