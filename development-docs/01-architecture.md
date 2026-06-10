# StartOS Architecture

## What StartOS is

A Linux distro for personal/self-hosted servers. Admin UI in the browser; services installed as signed `.s9pk` packages.

## Four components

| Component | Tech | Role |
|-----------|------|------|
| **Core** | Rust (`startbox` → `startd`, `start-cli`) | State, networking, storage, service lifecycle, JSON-RPC API |
| **Web UI** | Angular / Taiga | Setup wizard, marketplace, service management |
| **Container Runtime** | Node.js (inside each service LXC) | Loads package JS, runs subcontainers, health checks, effects |
| **SDK** | TypeScript (`@start9labs/start-sdk`) | Package author API; compiled into `javascript.squashfs` |

## Service isolation model

```
Host (StartOS)
└── LXC container (one per service)
    └── Container Runtime (Node.js)
        └── Package JavaScript (from .s9pk)
            ├── SubContainer A (app image)
            ├── SubContainer B (optional sidecar)
            └── Health checks
```

- **Not Docker/Podman on the host.** Images run as subcontainers inside LXC.
- Packages talk to the host via **effects** (JSON-RPC over Unix socket): config, DNS, tasks, networking.

## S9PK format

Merkle-tree archive, **Ed25519 signed**:

- `manifest.json`, icon, `LICENSE.md`
- `javascript.squashfs` — compiled SDK code
- `images/` per architecture (`x86_64`, `aarch64`, `riscv64`)
- optional `assets.squashfs`, `instructions.md` (required in 0.4.0+)

## Service lifecycle hooks

| Phase | SDK hook | When |
|-------|----------|------|
| Install | `setupOnInit` with `kind: 'install'` | First install |
| Update | `setupOnInit` with `kind: 'update'` + version migrations | Package upgrade |
| Restore | `setupOnInit` with `kind: 'restore'` | From backup |
| Start | `setupMain` | Every service start/restart |
| Actions | User-triggered | UI buttons / CLI |
| Uninstall | `setupUninit` | Package removal |

**Critical:** Service **restart does NOT run init**. Only install, update, restore, server restart, or manual **Container Rebuild** trigger init.

## State & security

- **Patch-DB**: reactive diff-based DB; public (UI) vs private (keys) models.
- Backups encrypted with master password.
- Containers isolated; host access only through effects API.

## StartOS 0.4.0 notes

- Complete rewrite (LXC replaces Docker/Podman on host).
- New TypeScript SDK and S9PK v2 format.
- Previous backups incompatible with 0.4.0.
- Current latest release: **v0.4.0-beta.9** (check [GitHub releases](https://github.com/Start9Labs/start-os/releases/latest)).
