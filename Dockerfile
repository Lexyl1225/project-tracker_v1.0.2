# =============================================================================
# Stage 1: Fetch official Tailscale binaries
# =============================================================================
FROM tailscale/tailscale:stable AS tailscale-bin

# =============================================================================
# Stage 2: Application + Tailscale Runtime Image
# =============================================================================
FROM python:3.12-slim

LABEL maintainer="Project Tracker Team"
LABEL description="Project Tracker FastAPI Web App with built-in Tailscale Funnel (https://project-tracker.ratfish-regulus.ts.net)"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    TS_HOSTNAME=project-tracker \
    TS_TAILNET=ratfish-regulus.ts.net \
    TS_STATE_DIR=/var/lib/tailscale \
    TS_SOCKET=/var/run/tailscale/tailscaled.sock

WORKDIR /app

# Install system utilities required by Tailscale and container healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    iproute2 \
    iptables \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy Tailscale binaries from official image
COPY --from=tailscale-bin /usr/local/bin/tailscaled /usr/local/bin/tailscaled
COPY --from=tailscale-bin /usr/local/bin/tailscale /usr/local/bin/tailscale

# Prepare Tailscale runtime directories and application persistence folders
RUN mkdir -p /var/run/tailscale /var/cache/tailscale /var/lib/tailscale /app/instance /app/frontend

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copy application source code and entrypoint
COPY app.py api_key_generator.py /app/
COPY frontend/ /app/frontend/
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Normalize line endings (in case built from Windows/WSL checkout) and make executable
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Expose FastAPI port
EXPOSE 8000

# Container healthcheck against FastAPI health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8000/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
