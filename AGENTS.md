# Mostro StartOS — Agent Context

You are an AI assistant working on **mostro-startos**, the StartOS package wrapper for [MostroP2P/mostro](https://github.com/MostroP2P/mostro). This file is your always-on context: architecture, conventions, workflows, and troubleshooting distilled from `development-docs/` and the live codebase.

**Read this file first.** For deeper detail, follow links into `development-docs/` and `start-docs/packaging/src/`.

---

## Current package state (as of SDK 1.5.3 migration)

| Field | Value |
|-------|-------|
| Package ID | `mostro` |
| SDK | `@start9labs/start-sdk@1.5.3` |
| Upstream image | `mostrop2p/mostro:v0.17.4` |
| Version (ExVer) | `0.17.4:0` — see `startos/versions/current.ts` |
| Required dependency | **LND** (hard-gated in `main.ts`) |
| Migration status | SDK 1.5 migration **complete** except VM sideload E2E test — see `TODO.md` |

Legacy paths (`startos/manifest.ts`, `startos/file-models/`, `startos/install/versions/`) may still exist on disk but are **superseded**. Always edit the SDK 1.5 paths listed below.

---

## Repository layout

```
mostro-startos/
├── AGENTS.md                 ← this file (agent context)
├── TODO.md                   ← pending work / migration checklist
├── instructions.md           ← end-user docs (shown in StartOS UI) — REQUIRED
├── settings.tpl.toml         ← template for default settings sections
├── assets/                   ← REQUIRED (≥1 file, e.g. ABOUT.md)
├── icon.svg                  ← service icon (≤40 KiB)
├── Makefile + s9pk.mk        ← build system
├── package.json              ← SDK dep, npm scripts
└── startos/                  ← all package SDK code
    ├── index.ts              ← entry point (compiled by ncc)
    ├── sdk.ts                ← SDK singleton
    ├── main.ts               ← daemons, mounts, health checks
    ├── manifest/
    │   ├── index.ts          ← service metadata, image, dependencies
    │   └── i18n.ts           ← locale descriptions
    ├── versions/
    │   ├── current.ts        ← latest version (edit in place for bumps)
    │   └── index.ts          ← version graph export
    ├── init/
    │   ├── index.ts          ← init pipeline
    │   └── seedDefaults.ts   ← install-only settings seed
    ├── interfaces.ts         ← network ports (RPC gRPC)
    ├── dependencies.ts       ← LND dependency warnings
    ├── backups.ts            ← backup volumes + restoreInit
    ├── fileModels/
    │   ├── settings.ts       ← TOML shape → /mostro/settings.toml
    │   └── store.json.ts     ← internal JSON state
    ├── actions/              ← user-facing configuration UI
    │   ├── index.ts          ← register all actions here
    │   ├── lnSettings.ts
    │   ├── nostrSettings.ts
    │   ├── nostrSetup.ts     ← critical install task
    │   ├── mostroSettings.ts
    │   ├── expirationSettings.ts
    │   └── rpcSettings.ts
    ├── i18n/                 ← action/UI string localization
    └── utils.ts              ← Nostr validation helpers
```

**Upstream guides** (sync periodically):

```
development-docs/     ← condensed notes for this repo (source for this file)
start-docs/           ← full StartOS packaging + OS docs
  packaging/src/      ← recipes + reference pages
  start-os/src/       ← OS user docs (sideloading, CLI, networking)
```

Refresh upstream docs:

```bash
git -C start-docs pull --ff-only
```

---

## StartOS architecture (how packages run)

StartOS is a Linux distro for self-hosted servers. Services ship as signed `.s9pk` packages.

### Four components

| Component | Tech | Role |
|-----------|------|------|
| **Core** | Rust (`startd`, `start-cli`) | State, networking, storage, service lifecycle, JSON-RPC API |
| **Web UI** | Angular / Taiga | Setup wizard, marketplace, service management |
| **Container Runtime** | Node.js (inside each service LXC) | Loads package JS, runs subcontainers, health checks, effects |
| **SDK** | TypeScript (`@start9labs/start-sdk`) | Package author API; compiled into `javascript.squashfs` |

### Isolation model

```
Host (StartOS)
└── LXC container (one per service)
    └── Container Runtime (Node.js)
        └── Package JavaScript (from .s9pk)
            ├── SubContainer A (app image)
            └── Health checks
```

- **Not Docker on the host.** Images run as subcontainers inside LXC.
- Packages talk to the host via **effects** (JSON-RPC over Unix socket): config, DNS, tasks, networking.

### S9PK format

Merkle-tree archive, **Ed25519 signed**:

- `manifest.json`, icon, `LICENSE.md`
- `javascript.squashfs` — compiled SDK code
- `images/` per architecture (`x86_64`, `aarch64`, `riscv64`)
- `instructions.md` (required), `assets/` (required)

### Service lifecycle hooks

| Phase | SDK hook | When |
|-------|----------|------|
| Install | `setupOnInit` with `kind: 'install'` | First install |
| Update | `setupOnInit` with `kind: 'update'` + version migrations | Package upgrade |
| Restore | `setupOnInit` with `kind: 'restore'` | From backup |
| Start | `setupMain` | Every service start/restart |
| Actions | User-triggered | UI buttons / CLI |
| Uninstall | `setupUninit` | Package removal |

**Critical:** Service **restart does NOT run init**. Only install, update, restore, server restart, or manual **Container Rebuild** trigger init.

---

## Mostro runtime architecture

```
mostro LXC
└── mostro-sub (mostrop2p/mostro image)
    ├── /mostro          ← main volume (settings.toml, DB, state)
    └── /lnd (ro)        ← mounted from lnd dependency volume
```

- **Daemon command:** `mostrod -d /mostro`
- **RPC interface:** gRPC on port 50051 (`startos/interfaces.ts`)
- **Settings file:** `/mostro/settings.toml` (typed by `startos/fileModels/settings.ts`)
- **LND paths (defaults):** `/lnd/tls.cert`, `/lnd/data/chain/bitcoin/mainnet/admin.macaroon`, `https://lnd.startos:10009`
- **RPC health check:** `grpcurl` against `AdminService/GetVersion`; version derived from manifest docker tag in `main.ts`
- **Hard dependency gate:** `sdk.checkDependencies(effects).throwIfNotSatisfied()` in `main.ts`

### Init pipeline (fixed order)

```
restoreInit → versionGraph → setInterfaces → setDependencies → actions → seedDefaults → setupNostr
```

First two steps must stay first and second. Defined in `startos/init/index.ts`.

### Registered actions

| Action file | TOML section | Purpose |
|-------------|--------------|---------|
| `lnSettings.ts` | `[lightning]` | LND paths, invoice windows, payment retries |
| `nostrSettings.ts` | `[nostr]` | Nostr private key, relays |
| `nostrSetup.ts` | — | Critical install task for Nostr |
| `mostroSettings.ts` | `[mostro]` | Fees, limits, fiat currencies, dev fee, etc. |
| `expirationSettings.ts` | `[expiration]` | Nostr event retention by kind |
| `rpcSettings.ts` | `[rpc]` | gRPC enable/listen |

**Adding a new setting:** update the action file, the Zod schema in `fileModels/settings.ts`, `settings.tpl.toml`, and register the action in `actions/index.ts` if it is a new action.

---

## Packaging SDK patterns (SDK 1.5.3)

### setupMain — daemons

```typescript
export const main = sdk.setupMain(async ({ effects }) => {
  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer: await sdk.SubContainer.of(effects, { imageId: 'mostro' }, mounts, 'mostro-sub'),
      exec: { command: ['mostrod', '-d', '/mostro'] },
      ready: { display: null, fn: () => ({ result: 'success', message: null }) },
      requires: [],
    })
    .addHealthCheck('rpc-version-check', { ready: { display: '...', fn: async () => ... }, requires: ['primary'] })
})
```

Key APIs:

- **`SubContainer.of()`** — long-lived daemon container
- **`SubContainer.withTemp()`** — one-off in actions/init
- **`.const(effects)`** on file model reads — reactive; restarts daemon on change
- **`runAsInit: true`** — required when image bundles s6-overlay/tini/supervisord (must be PID 1)
- **`sdk.useEntrypoint()`** — run upstream Docker entrypoint
- **`mountDependency()`** — mount LND volume read-only at `/lnd`

**Note:** `setupMain` takes `{ effects }` only — no `started` parameter (removed in SDK 1.5).

### setupInterfaces

```typescript
const multi = sdk.MultiHost.of(effects, 'ui')
const origin = await multi.bindPort(8080, { protocol: 'http', preferredExternalPort: 8080 })
const iface = sdk.createInterface(effects, { id: 'ui', type: 'ui', ... })
return [await origin.export([iface])]
```

**Gotcha:** Inside container all traffic is HTTP. User-facing URLs in actions/UI must use **`https://`** (StartOS terminates SSL at edge).

### Actions

```typescript
sdk.Action.withoutInput('id', metadata, handler)
sdk.Action.withInput('id', metadata, inputSpec, prefill, handler)
```

Rules for this repo:

- Wrap user-visible strings in `i18n()` from `../i18n`
- Prefill handler uses `.once()`, not `.const()`
- `allowedStatuses`: `'any' | 'only-running' | 'only-stopped'`
- Export `inputSpec` separately when reused
- Arrays in TOML → comma-separated text in UI (see `nostrSettings.ts` relays, `mostroSettings.ts` fiat currencies)
- On save, most actions call `storeJson.merge` for `nostrKeysConfigured` and `daemon_settings.merge` for settings — **never `write()`**

### Tasks

```typescript
sdk.action.createOwnTask(effects, action, 'critical' | 'important' | 'optional', { reason })
```

| Severity | Effect |
|----------|--------|
| `critical` | Blocks service start |
| `important` | Prominent, non-blocking |
| `optional` | Informational |

Default `replayId` = `[package-id]:[action-id]` — idempotent across init reruns.

### File models

```typescript
export const daemon_settings = FileHelper.toml(
  { base: sdk.volumes.main, subpath: './settings.toml' },
  shape,
)
```

**Golden rules:**

1. Every key needs `.catch()` — schema **is** the default
2. **Always `merge()`**, never `write()` (preserves unknown upstream keys)
3. Read with map: `.read((s) => s.field).const(effects)` — never identity `.read((s) => s)`
4. Missing file → read returns `null`
5. Delete stale keys: `merge(effects, { oldKey: undefined })`
6. Nested sections use `.catch(() => sectionSchema.parse({}))` for resilient defaults

Path API (SDK 1.5):

```diff
- FileHelper.toml({ volumeId: 'main', subpath: '/settings.toml' }, shape)
+ FileHelper.toml({ base: sdk.volumes.main, subpath: './settings.toml' }, shape)
```

Schema lib (SDK 1.5):

```diff
- import { matches, FileHelper } from '@start9labs/start-sdk'
+ import { FileHelper, z } from '@start9labs/start-sdk'
```

### Dependencies

- **Manifest** declares deps with `metadata` (SDK 1.5 pattern — no `s9pk` URL for LND)
- **`setupDependencies`** drives warning UI only — does **not** block startup
- **`checkDependencies` in `main.ts`** — hard gate (Mostro uses this)

Cross-service access:

```typescript
// DNS hostname inside StartOS LAN
https://lnd.startos:10009

// Mount dependency volume
.mountDependency({ dependencyId: 'lnd', volumeId: 'main', mountpoint: '/lnd', readonly: true })

// Read dependency interface URL
sdk.serviceInterface.get(effects, { id: 'rpc', packageId: 'lnd' }, mapper).const()
```

### Versions (ExVer)

Format: `[#flavor:]<upstream>[-prerelease]:<downstream>`

Example: `0.17.4:0`

- Latest always in `startos/versions/current.ts`
- New version file only when migration needed
- Git tag: `v{upstream}_{downstream}` → `v0.17.4_0`
- Bump checklist: `current.ts`, manifest `dockerTag`, git tag — all aligned

---

## Recipes quick reference

Start at `start-docs/packaging/src/recipes.md` for full detail.

| Intent | Recipe | Key files (this repo) |
|--------|--------|----------------------|
| Wrap existing Docker image | `recipe-prebuilt-image.md` | **Mostro uses this** — `main.ts`, `manifest/` |
| User config via UI actions | `recipe-config-actions.md` | `actions/`, `fileModels/` |
| Generate config on disk | `recipe-config-files.md` | `fileModels/settings.ts` |
| Env vars to container | `recipe-env-vars.md` | `main.ts` exec.env |
| Expose API / gRPC | `recipe-api-interface.md` | `interfaces.ts` |
| Depend on LND | `recipe-dependency.md` | `dependencies.ts`, `manifest/` |
| Hard-require dependency at start | `recipe-enforce-dependency.md` | `checkDependencies` in `main.ts` |
| Mount dep volume (macaroons) | `recipe-mount-dependency.md` | `main.ts` mounts |
| Auto-generate secrets | `recipe-internal-secrets.md` | init + `store.json` |
| Block start until setup | `recipe-require-setup.md` | critical tasks (`nostrSetup`) |
| One-time install setup | `recipe-install-init.md` | `seedDefaults.ts` |
| Version upgrade migrations | `recipe-version-migrations.md` | `versions/` |
| Health checks | `recipe-health-checks.md` | `main.ts` |
| Backups | `recipe-backups.md` | `backups.ts` |

### Prebuilt Docker image checklist (Mostro)

- [ ] Confirm image repo, tag, and arches from registry (not memory)
- [ ] Mount **every** persisted path (config + data) — `/mostro` main volume
- [ ] Expose **every** required port — RPC 50051
- [ ] LND volume mounted read-only at `/lnd`
- [ ] Install on StartOS and exercise — not just green `tsc`

---

## Development workflow

### Prerequisites

| Tool | Notes |
|------|-------|
| Docker | Pull images during pack |
| Make + `s9pk.mk` | Build `.s9pk` |
| Node.js 22 | `npm ci`, `npm run check` |
| SquashFS tools | `mksquashfs` |
| start-cli | `curl -fsSL https://start9.com/start-cli/install.sh \| sh` |
| Developer key | `start-cli init-key` → `~/.startos/developer.key.pem` |

### Build commands

```bash
npm ci
npm run check          # tsc --noEmit
make x86               # x86_64 .s9pk for VM dev
make arm               # aarch64 only
make clean x86 install # common dev loop (build + sideload)
```

Build pipeline:

1. `npm run build` → `javascript/index.js` via `@vercel/ncc`
2. `start-cli s9pk pack` → signed `.s9pk`

### Dev machine → StartOS host

`~/.startos/config.yaml`:

```yaml
host: http://192.168.122.x    # VM IP or http://server-name.local
```

```bash
start-cli auth login
start-cli package list
```

### Iteration loop

```
edit TypeScript → npm run check → make x86 → make install → check UI/tasks/health → package logs/attach
```

If container state is stale:

```bash
start-cli package rebuild mostro
# or UI: service → Rebuild Container
```

### Working discipline (every task)

1. **Doc sync** — code change → update `instructions.md` (and `README.md` if architecture changed) in same change
2. **Dirty tree OK** — `-modified` pack hash is informational; one clean commit when done
3. **Pre-existing errors count** — red `tsc`/pack = package doesn't pass
4. **Compile ≠ working** — install, log in, write data, restart; verify end-to-end
5. **Don't fabricate** — verify image tags, config formats, icons; flag gaps in `TODO.md`
6. **Search SDK types** before claiming impossible: `node_modules/@start9labs/start-sdk/**/*.d.ts`
7. **Version files** — edit `current.ts` in place unless migration needed
8. **Match existing patterns** — read a sibling action before adding a new one

---

## start-cli cheatsheet

```bash
# Auth
start-cli auth login

# Package lifecycle
start-cli package list
start-cli package install -s mostro.s9pk
start-cli package start|stop|restart mostro
start-cli package logs mostro -f
start-cli package attach mostro
start-cli package rebuild mostro
start-cli package action run mostro <ACTION_ID> '<JSON_INPUT>'

# Build & inspect
start-cli s9pk pack
start-cli s9pk inspect manifest mostro.s9pk

# VM IP
virsh net-dhcp-leases default
```

SSH to StartOS host: `ssh start9@<IP>` (password = master password).

Full reference: `development-docs/05-cli-cheatsheet.md`, `start-docs/start-os/src/cli-reference.md`

---

## Platform concepts (for package dev)

### Installing services

| Method | Use case |
|--------|----------|
| **Marketplace** | Production installs from registry |
| **Sideload** | Dev testing — drop `.s9pk`, no registry |
| **Update / Downgrade** | Updates tab or Marketplace |

### Health checks

| Status | Meaning |
|--------|---------|
| Waiting | Blocked on another check |
| Starting | Grace period |
| Loading | Long-running (e.g. sync %) |
| Success | Ready |
| Error | Failed with message |

### Interfaces

- Inside container = HTTP; external URLs = HTTPS
- Inter-service DNS: `<package-id>.startos` (e.g. `lnd.startos`)

### Registries

| Registry | Notes |
|----------|-------|
| Start9 Registry | Primary, maintained |
| Community Registry | Technical criteria only |
| Alpha (Mostro testing) | `https://alpha-registry-x.start9.com` |

---

## Publishing

### Pre-publish checklist

- Git tag matches ExVer (`v0.17.4_0`)
- `npm run check` clean
- `make x86` produces signed `.s9pk`
- `instructions.md` current
- End-to-end: install → start → configure → restart → uninstall → reinstall

### Alpha registry

```bash
make x86
start-cli --registry=https://alpha-registry-x.start9.com registry package add \
  mostro.s9pk https://github.com/MostroP2P/mostro-startos/releases/download/vTAG/mostro.s9pk
```

Developer signing key: `~/.startos/developer.key.pem` — back up like an SSH key.

See `development-docs/08-publishing-registries.md`.

---

## Gotchas & debugging

### Top traps

| Area | Trap | Fix |
|------|------|-----|
| Init | Restart ≠ init | Container Rebuild or reinstall |
| Init order | Wrong pipeline order | `restoreInit` → `versionGraph` must be first |
| File models | Using `write()` | Always `merge()` |
| File models | Missing `.catch()` | Every key needs default |
| File models | Identity read `.read(s => s)` | Map to specific fields |
| Interfaces | `http://` in user URLs | Use `https://` for browser-facing links |
| Prebuilt images | Wrong/missing mounts | Mount config **and** data paths |
| Dependencies | `setupDependencies` alone | Doesn't block start — use `checkDependencies` |
| Versions | New file per bump | Edit `current.ts` unless migration |
| Build | Missing `instructions.md` | Required |
| Build | Empty `assets/` | Must have ≥1 file |

### Mostro-specific

| Issue | Check |
|-------|-------|
| Won't start | LND installed? `checkDependencies` satisfied? |
| RPC health fail | RPC enabled in settings? Version string matches docker tag? |
| LND macaroon errors | `/lnd` mount readonly? Paths in `settings.toml` correct? |
| Nostr not publishing | Relays configured? `setupNostr` init ran? |

### Debugging workflow

```bash
start-cli package logs mostro -f
start-cli package attach mostro
cat /mostro/settings.toml
ls -la /mostro /lnd
start-cli package rebuild mostro
start-cli s9pk inspect manifest mostro.s9pk
```

### SDK discovery

Before workaround hacks:

```bash
grep -r "runAsInit\|mountDependency\|checkDependencies" node_modules/@start9labs/start-sdk/
```

---

## VM setup (summary)

Full guide: `development-docs/vm-setup-and-sideload.md`

1. Install KVM/libvirt, Node 22, Docker, start-cli on dev machine
2. Download StartOS ISO (check latest: [GitHub releases](https://github.com/Start9Labs/start-os/releases/latest))
3. Create VM (8 GB RAM, 64 GB disk recommended)
4. Complete StartOS setup wizard; trust Root CA on dev machine
5. Configure `~/.startos/config.yaml` with VM IP; `start-cli auth login`
6. Install **LND** from Marketplace; wait for sync
7. `npm ci && make clean x86 install` from mostro-startos repo
8. Complete dashboard tasks; verify health checks green

---

## How to add a new configuration parameter

Follow this checklist (example: adding a field to an existing action):

1. **`startos/fileModels/settings.ts`** — add field to the correct Zod section with `.catch(default)`
2. **`startos/actions/<action>.ts`** — add `Value.*` to `inputSpec`, read in prefill handler, write in save handler via `daemon_settings.merge`
3. **`settings.tpl.toml`** — add key with comment under the right `[section]`
4. **`instructions.md`** — document if user-visible
5. **New action?** — create file, register in `actions/index.ts`, wrap strings in `i18n()`

For array fields, use comma-separated text in the UI and parse on save (see `nostrSettings.ts`, `mostroSettings.ts`).

For a new TOML section, add a new schema object in `settings.ts`, a new action file, and register it in `actions/index.ts` (see `expirationSettings.ts`).

---

## Bumping Mostro upstream version

1. Verify `mostrop2p/mostro:<tag>` exists for `x86_64` + `aarch64`
2. Update `dockerTag` in `startos/manifest/index.ts`
3. Update `startos/versions/current.ts` (new file only if migration needed)
4. RPC health check version auto-derives from docker tag in `main.ts`
5. Test with LND installed and synced
6. Update `instructions.md` for user-visible changes
7. Tag `v{upstream}_{downstream}` and push individually

---

## Where to read more

| Topic | Path |
|-------|------|
| Condensed dev docs index | `development-docs/README.md` |
| Architecture | `development-docs/01-architecture.md` |
| Packaging SDK reference | `development-docs/02-packaging-sdk.md` |
| Project structure & workflow | `development-docs/03-project-structure-and-workflow.md` |
| Recipes index | `development-docs/04-recipes-quick-reference.md` |
| CLI cheatsheet | `development-docs/05-cli-cheatsheet.md` |
| Platform concepts | `development-docs/06-startos-platform.md` |
| Mostro package notes | `development-docs/07-mostro-package.md` |
| Publishing | `development-docs/08-publishing-registries.md` |
| Gotchas & debugging | `development-docs/09-gotchas-and-debugging.md` |
| SDK migration history | `development-docs/10-sdk-migration-plan.md` |
| VM + sideload walkthrough | `development-docs/vm-setup-and-sideload.md` |
| Full packaging guide | `start-docs/packaging/src/` |
| Package template (reference) | `start-docs/packaging/package-template/` |
| Upstream agent context | `start-docs/packaging/AGENTS.md` |

---

## Agent quick rules

1. **Start from intent** — find the recipe in `start-docs/packaging/src/recipes.md` before inventing patterns
2. **Match this repo** — read sibling files before adding new code
3. **Minimize scope** — only change files required for the task
4. **Never `write()` file models** — always `merge()`
5. **Every schema key needs `.catch()`**
6. **Wrap UI strings in `i18n()`**
7. **Verify, don't guess** — image tags, config keys, SDK APIs
8. **Compiling is not working** — state what was verified end-to-end
9. **Keep `instructions.md` in sync** with user-visible changes
10. **Don't commit unless asked** — user controls git operations
