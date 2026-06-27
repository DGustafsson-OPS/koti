# GitHub setup guide

Reusable checklist for connecting a local machine, GitHub repository, GitHub Actions, and a deployment server. Ikiruska uses this pattern; adapt names and paths for other projects.

## Overview — four connections

```
┌─────────────┐   SSH (git)    ┌──────────────────┐
│  Your Mac   │───────────────▶│  GitHub repo     │
└─────────────┘                └────────┬─────────┘
                                        │ push / PR
                                        ▼
                               ┌──────────────────┐
                               │  GitHub Actions  │
                               └────────┬─────────┘
                    ┌───────────────────┼───────────────────┐
                    │ GITHUB_TOKEN    │ SSH deploy key    │
                    ▼                 ▼                   │
             ┌────────────┐   ┌─────────────┐            │
             │ GHCR       │   │ UpCloud VPS │◀── docker pull
             │ (images)   │   │ (deploy)    │
             └────────────┘   └─────────────┘
```

| Connection | Purpose | Auth method |
|---|---|---|
| Mac → GitHub | `git push`, `git pull`, PRs | SSH key in your GitHub account |
| Actions → repo | CI tests, deploy workflows | Built-in `GITHUB_TOKEN` |
| Actions → GHCR | Push API Docker images | `GITHUB_TOKEN` (`packages: write`) |
| Actions → server | rsync frontend + restart stack | Dedicated deploy SSH key in GitHub Secrets |
| Server → GHCR | Pull images on deploy | GitHub PAT (`read:packages`) or public package |

---

## 1. Create the repository

1. GitHub → **New repository** (org or personal account, e.g. `DGustafsson-OPS/MyProject`)
2. Do **not** commit secrets (`.env`, API keys, SSH private keys)
3. Add a `.gitignore` for env files and local data directories

Initial push from your machine (after SSH is configured in section 2):

```bash
cd ~/Developer/MyProject
git init
git remote add origin git@github.com:DGustafsson-OPS/MyProject.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

---

## 2. Local Mac — SSH for Git

Use SSH instead of HTTPS so `git push` does not prompt for a token on every use.

### 2a. Check for an existing key

```bash
ls -la ~/.ssh/id_ed25519*
```

If you already have `id_ed25519` (Ikiruska uses this), skip to **2c**.

### 2b. Generate a new key (only if needed)

```bash
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/id_ed25519
```

Press Enter for no passphrase, or set one if you prefer.

### 2c. Add the public key to GitHub

Copy the public key:

```bash
ssh-keygen -y -f ~/.ssh/id_ed25519 | pbcopy
```

Then:

1. [github.com/settings/keys](https://github.com/settings/keys) → **New SSH key**
2. Title: e.g. `DennisM1`
3. Key type: **Authentication Key**
4. Paste → **Add SSH key**

### 2d. SSH config for GitHub

Add to `~/.ssh/config`:

```sshconfig
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    AddKeysToAgent yes
    UseKeychain yes
```

Load the key into the agent (macOS):

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

### 2e. Verify and point the remote at SSH

```bash
ssh -T git@github.com
# Expected: Hi DGustafsson-OPS! You've successfully authenticated...

cd ~/Developer/MyProject
git remote set-url origin git@github.com:DGustafsson-OPS/MyProject.git
git remote -v
git push origin main
```

### Optional: GitHub CLI

```bash
brew install gh
gh auth login
gh repo view
```

Useful for PRs, Actions logs, and releases. Git push/pull still uses SSH above.

---

## 3. CI workflow (every push / PR)

Copy the pattern from `.github/workflows/ci.yml`:

- Backend tests (`pytest`)
- Frontend build (`npm run build`)
- Docker image build (smoke test, no push)

No GitHub Secrets required — CI uses the default `GITHUB_TOKEN`.

After the first push, check **Actions** in the repo and confirm the workflow is green.

---

## 4. Container registry (GHCR)

Images are stored at:

```
ghcr.io/<github-owner>/<image-name>:<tag>
```

Ikiruska example: `ghcr.io/dgustafsson-ops/ikiruska-api:staging`

### 4a. Workflow permissions

Deploy workflows need:

```yaml
permissions:
  contents: read
  packages: write
```

And a login step:

```yaml
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

`GITHUB_TOKEN` is automatic — no manual secret needed for Actions to **push** images.

### 4b. Server pull access (if package is private)

On the VPS, log in once:

```bash
echo YOUR_GITHUB_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Create the PAT at [github.com/settings/tokens](https://github.com/settings/tokens) with **`read:packages`** scope.

Alternative: **Package settings → Change visibility → Public** (fine for open-source or non-sensitive API images).

Set `API_IMAGE` in the server `.env`:

```bash
API_IMAGE=ghcr.io/dgustafsson-ops/myproject-api:staging
```

---

## 5. Automated deploy (GitHub Actions → server)

Ikiruska deploy workflows:

| Workflow | Trigger | Environment |
|---|---|---|
| `deploy-staging.yml` | Push to `staging` branch | `staging` |
| `deploy-production.yml` | Manual (type `deploy`) | `production` |

Each run: build image → push to GHCR → build frontend → rsync to server → SSH restart.

### 5a. Create a deploy SSH key (separate from your Mac key)

Use a **dedicated** key for CI — not your personal `id_ed25519`.

```bash
ssh-keygen -t ed25519 -C "github-actions-myproject-staging" \
  -f ~/.ssh/myproject-staging-deploy -N ""
```

Install the **public** key on the server:

```bash
ssh-copy-id -i ~/.ssh/myproject-staging-deploy.pub deploy@YOUR_SERVER_IP
# or append to /home/deploy/.ssh/authorized_keys
```

Keep the **private** key for GitHub Secrets only. Never commit it.

### 5b. Bootstrap the server (one time)

```bash
scp deploy/scripts/bootstrap-server.sh root@YOUR_SERVER_IP:/tmp/
ssh root@YOUR_SERVER_IP 'bash /tmp/bootstrap-server.sh'
ssh-copy-id deploy@YOUR_SERVER_IP
```

See [deploy/README.md](../deploy/README.md) for full server setup.

### 5c. GitHub Environments and secrets

**Settings → Environments → New environment** → `staging`

| Type | Name | Example value |
|---|---|---|
| Variable | `STAGING_API_URL` | `https://api.staging.example.com` |
| Secret | `STAGING_HOST` | VPS IP or hostname |
| Secret | `STAGING_USER` | `deploy` |
| Secret | `STAGING_SSH_KEY` | Full private key (`-----BEGIN OPENSSH PRIVATE KEY-----` …) |

Repeat for `production` with `PRODUCTION_*` names.

Paste the private key exactly as stored in the file:

```bash
cat ~/.ssh/myproject-staging-deploy
```

### 5d. Staging branch

```bash
git checkout -b staging
git push -u origin staging
```

Pushes to `staging` trigger the staging deploy workflow.

Production stays manual: **Actions → Deploy Production → Run workflow** → type `deploy`.

---

## 6. Manual deploy (no Actions)

For dev or when CI is not wired yet, deploy from your laptop over SSH:

```bash
cd deploy
DEPLOY_HOST=your.server.ip ./scripts/remote-deploy-local.sh
```

Ikiruska dev uses a **separate server SSH key** (not the GitHub key):

```sshconfig
Host ssh.dev.ikiruska.com
    HostName 212.147.237.72
    User root
    IdentityFile ~/.ssh/dev..ikiruska.com
```

Server SSH keys and GitHub SSH keys serve different purposes:

| Key | Used for |
|---|---|
| `~/.ssh/id_ed25519` | Git push/pull to github.com |
| `~/.ssh/myproject-staging-deploy` | GitHub Actions → server (in GitHub Secret) |
| `~/.ssh/dev..ikiruska.com` | Your Mac → dev server (manual deploy) |

---

## 7. Checklist for a new project

Copy this list and tick items off:

- [ ] Create GitHub repo under `DGustafsson-OPS` (or your org)
- [ ] Generate or reuse `~/.ssh/id_ed25519`; add public key to GitHub
- [ ] Add `Host github.com` block to `~/.ssh/config`
- [ ] `ssh -T git@github.com` succeeds
- [ ] `git remote set-url origin git@github.com:OWNER/REPO.git`
- [ ] Add `.github/workflows/ci.yml`
- [ ] First push; CI workflow green
- [ ] Add `.github/workflows/deploy-staging.yml` (adapt image name + paths)
- [ ] Create `staging` branch
- [ ] Bootstrap VPS; create `deploy` user
- [ ] Generate deploy SSH key pair; install public key on server
- [ ] Create GitHub Environment `staging` with secrets/vars
- [ ] Set `API_IMAGE` in server `.env` to GHCR image
- [ ] `docker login ghcr.io` on server (if package is private)
- [ ] Push to `staging`; verify deploy

---

## 8. Project reference

| Item | Ikiruska | Koti |
|---|---|---|
| Repo | `git@github.com:DGustafsson-OPS/Ikiruska.git` | `git@github.com:DGustafsson-OPS/koti.git` |
| GitHub account | `DGustafsson-OPS` | `DGustafsson-OPS` |
| CI | `.github/workflows/ci.yml` | `.github/workflows/ci.yml` |
| Stack | Python API + Vite frontend | Next.js 15 + Drizzle + SQLite |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Permission denied (publickey)` on `git push` | Public key not in GitHub, or wrong `IdentityFile` in `~/.ssh/config` |
| `Hi USER!` but push fails | Remote still HTTPS — run `git remote set-url origin git@github.com:...` |
| Actions deploy SSH fails | Check `STAGING_SSH_KEY` secret (full key, no extra spaces); verify public key in server `authorized_keys` |
| Server cannot pull image | Run `docker login ghcr.io` with PAT, or make GHCR package public |
| CI fails on PR from fork | Expected for secrets — fork PRs do not get environment secrets |
