#!/usr/bin/env bash
# ============================================================
# deploy.sh — EC2 deployment script
# Run this on your EC2 instance (Ubuntu 22.04 / 24.04)
#
# Expected folder layout after running this script:
#   ~/hexaorder-app/
#   ├── MultiUserSecurityDemo/   ← backend repo
#   ├── hexaorder/               ← frontend repo
#   └── devops/                  ← this repo (compose runs from here)
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# ============================================================

set -euo pipefail

WORK_DIR="$HOME/hexaorder-app"
BACKEND_REPO="${BACKEND_REPO:-}"     # set via env: export BACKEND_REPO=https://github.com/you/MultiUserSecurityDemo
FRONTEND_REPO="${FRONTEND_REPO:-}"   # set via env: export FRONTEND_REPO=https://github.com/you/hexaorder

echo ""
echo "========================================================"
echo "  HexaOrder — EC2 Deployment Script"
echo "========================================================"
echo ""

# ── 1. Install Docker & Docker Compose (if not present) ──────
install_docker() {
  if command -v docker &>/dev/null; then
    echo "✅  Docker already installed: $(docker --version)"
    return
  fi

  echo "⬇️   Installing Docker..."
  sudo apt-get update -qq
  sudo apt-get install -y ca-certificates curl gnupg lsb-release

  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt-get update -qq
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
                          docker-buildx-plugin docker-compose-plugin

  sudo usermod -aG docker "$USER"
  echo "✅  Docker installed."
  echo "⚠️   You may need to log out and back in for group changes to take effect."
}

install_docker

if ! docker compose version &>/dev/null; then
  echo "❌  Docker Compose V2 not found."
  exit 1
fi
echo "✅  Docker Compose: $(docker compose version)"

# ── 2. Create the parent work directory ──────────────────────
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"
echo "📂  Working in: $WORK_DIR"

# ── 3. Clone / pull all three repos ──────────────────────────
clone_or_pull() {
  local dir="$1"
  local repo="$2"
  if [[ -d "$dir/.git" ]]; then
    echo "🔄  Pulling latest: $dir"
    git -C "$dir" pull --ff-only
  elif [[ -n "$repo" ]]; then
    echo "⬇️   Cloning $repo → $dir"
    git clone "$repo" "$dir"
  else
    echo "⚠️   $dir not found and no repo URL set — skipping clone."
    echo "    Manually clone it into $WORK_DIR/$dir before running compose."
  fi
}

clone_or_pull "MultiUserSecurityDemo" "$BACKEND_REPO"
clone_or_pull "hexaorder"             "$FRONTEND_REPO"

# devops/ is the repo this script lives in — just pull it
if [[ -d "$WORK_DIR/devops/.git" ]]; then
  git -C "$WORK_DIR/devops" pull --ff-only
fi

# ── 4. Check .env.prod ────────────────────────────────────────
cd "$WORK_DIR/devops"

if [[ ! -f .env.prod ]]; then
  echo ""
  echo "❌  .env.prod not found in $WORK_DIR/devops/"
  echo "    Copy .env.prod.example → .env.prod and fill in all values."
  echo ""
  exit 1
fi
echo "✅  .env.prod found."

# ── 5. Build and start ────────────────────────────────────────
echo ""
echo "🔨  Building images and starting containers..."
echo ""

docker compose -f docker-compose.prod.yml --env-file .env.prod \
  up -d --build --remove-orphans

# ── 6. Status ────────────────────────────────────────────────
echo ""
echo "📦  Container status:"
docker compose -f docker-compose.prod.yml ps

echo ""
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "<EC2-IP>")
echo "✅  Deployment complete!"
echo "    Frontend : http://$EC2_IP"
echo "    API      : http://$EC2_IP/api/actuator/health"
echo ""
echo "📋  Useful commands (run from $WORK_DIR/devops/):"
echo "    docker compose -f docker-compose.prod.yml logs -f backend"
echo "    docker compose -f docker-compose.prod.yml ps"
echo "    docker compose -f docker-compose.prod.yml down"
echo ""