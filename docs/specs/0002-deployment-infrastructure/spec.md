# Spec 0002: Deployment Infrastructure

Status: Proposed
Date: 2026-02-27

Status: In Progress
Date: 2026-02-27

## Overview

Implementation of deployment infrastructure to support NFR-6 (Deployment) requirements, enabling easy self-hosted deployment of Task Tracker to VPS environments.

## Requirements

- NFR-6.1: CLI installer - single command to deploy to VPS
- NFR-6.2: Web installer - form-based deployment to VPS via SSH
- NFR-6.3: Automatic dependency installation (Node.js, database, etc.)
- NFR-6.4: Single-command updates
- NFR-6.5: Environment-based configuration
- NFR-6.6: Docker images available as alternative

## Implementation Details

### Architecture

```
VPS Deployment
├── Nginx Reverse Proxy (SSL termination via Let's Encrypt)
├── Docker Services:
│   ├── Backend (NestJS API) - port 3000
│   ├── Frontend (React UI) - served by Nginx
│   ├── PostgreSQL - port 5432
│   ├── Redis (WebSocket) - port 6379
│   └── SeaweedFS (S3 Storage) - port 9000
```

### Files Created

#### Infrastructure (`infra/`)

| File | Purpose |
|------|---------|
| `docker-compose.yml` | All services orchestration |
| `docker-compose.production.yml` | Production resource limits |
| `nginx.conf` | Reverse proxy with SSL |
| `nginx-spa.conf` | Frontend SPA config |
| `Dockerfile.backend` | Multi-stage NestJS build |
| `Dockerfile.frontend` | Multi-stage React build |
| `.env.example` | Environment template |

#### CLI Installer (`packages/cli/`)

| File | Purpose |
|------|---------|
| `src/index.ts` | CLI entry point |
| `src/commands/deploy.ts` | Deploy command with SSH connection |
| `src/commands/update.ts` | Update command (git pull + rebuild) |

#### Web Installer (`apps/installer/`)

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main installer UI |
| `src/components/SshForm.tsx` | SSH credentials form |
| `src/components/DeployProgress.tsx` | Deployment progress display |
| `src/store.ts` | Zustand state management |

#### Storage Abstraction (`packages/storage/`)

| File | Purpose |
|------|---------|
| `src/types.ts` | Storage interface definition |
| `src/adapters/filesystem.adapter.ts` | Local filesystem implementation |
| `src/adapters/s3.adapter.ts` | S3/SeaweedFS implementation |

#### Configuration (`packages/config/`)

| File | Purpose |
|------|---------|
| `src/environment.ts` | Zod-based environment validation |

#### Health Endpoints (`packages/api/`)

| File | Purpose |
|------|---------|
| `src/health/health.controller.ts` | Health check endpoints |

## Deployment Flow

1. User runs CLI: `npx @task-tracker/cli deploy` or uses web installer
2. CLI/Installer connects via SSH (key-based auth)
3. Installs Docker if not present
4. Uploads configuration files
5. Generates SSL certificates via Let's Encrypt
6. Starts all services via docker-compose

## Known Limitations

- Web installer backend not implemented (only UI)
- SSL certificate generation requires domain to point to VPS first
- SeaweedFS S3 API compatibility is partial (missing versioning, lifecycle)

## API Changes

None - this is infrastructure work.
