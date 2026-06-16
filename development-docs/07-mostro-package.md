# Mostro Package — Developer Notes

## Overview

| Field | Value |
|-------|-------|
| Package ID | `mostro` |
| Upstream | [MostroP2P/mostro](https://github.com/MostroP2P/mostro) |
| Wrapper repo | [MostroP2P/mostro-startos](https://github.com/MostroP2P/mostro-startos) |
| Docker image | `mostrop2p/mostro:0.14.3` |
| SDK | `@start9labs/start-sdk` ^0.4.0-beta.36 (target: **1.5.3** — see [10-sdk-migration-plan.md](./10-sdk-migration-plan.md)) |
| Required dependency | **LND** (optional in older versions; now mandatory) |

## Architecture

```
mostro LXC
└── mostro-sub (mostrop2p/mostro image)
    ├── /mostro          ← main volume (settings.toml, DB, state)
    └── /lnd (ro)        ← mounted from lnd dependency volume
```

**Daemon:** `mostrod -d /mostro`

**RPC interface:** port 50051 (gRPC), exposed as API interface `rpc`.

## Key files

| File | Role |
|------|------|
| `startos/manifest.ts` | Image, LND dep, metadata |
| `startos/main.ts` | Mounts, daemon, RPC health check via grpcurl |
| `startos/interfaces.ts` | RPC on 50051 |
| `startos/dependencies.ts` | LND running, `>=0.18.3`, health `sync-progress` |
| `startos/file-models/settings.ts` | TOML shape for `/mostro/settings.toml` |
| `startos/file-models/store.json.ts` | Internal state (passwords, flags) |
| `startos/actions/` | lnSettings, nostrSettings, mostroSettings, rpcSettings |
| `startos/init/index.ts` | restoreInit → versionGraph → interfaces → deps → actions → setupNostr |
| `startos/install/versions/` | Version graph (current: check `v0.14.2.ts`) |

## Actions (configuration UI)

Registered in `startos/actions/index.ts`:

- `lnSettings` — Lightning / LND paths
- `nostrSettings` — Nostr keys and relays
- `mostroSettings` — fees, limits, pow, etc.
- `rpcSettings` — gRPC enable/listen

Init also runs `setupNostr` from `nostrSetup.ts`.

## Dependency: LND

Manifest declares LND as a **required** dependency with marketplace metadata (SDK 1.5 pattern — no `s9pk` URL):

```typescript
lnd: {
  description: 'Lightning node',
  optional: false,
  metadata: { title: 'LND', icon: '...' },
}
```

`main.ts` calls `sdk.checkDependencies(effects).throwIfNotSatisfied()` — **hard gate** at start.

LND volume mounted read-only at `/lnd` for macaroon/cert access.

## Health check

`rpc-version-check` in `main.ts`:

- Disabled when RPC off in settings
- Uses `grpcurl` against `127.0.0.1:50051` / `AdminService/GetVersion`
- Expected version derived from manifest docker tag (`main.ts` strips `v` prefix)

## Data paths on running service

Inside StartOS host (advanced debugging):

```
/media/startos/data/package-data/volumes/mostro/data/main/root/.mostro
```

Prefer `start-cli package attach mostro` for inspection.

## Build & install

```bash
npm ci
make x86
make install    # needs ~/.startos/config.yaml with VM/host IP
```

## Publishing to alpha registry

```bash
make x86
start-cli --registry=https://alpha-registry-x.start9.com registry package add \
  mostro.s9pk https://github.com/MostroP2P/mostro-startos/releases/download/vX.Y.Z/mostro.s9pk
```

## Open items / TODOs in code

From `main.ts`:

- `@TODO mainMounts.mountDependency` — verify LND volume mount params
- `@TODO verify` on LND volumeId

When bumping Mostro upstream:

1. Verify `mostrop2p/mostro:<tag>` exists for x86_64 + aarch64
2. Update manifest `dockerTag`
3. Update version in `install/versions/`
4. Update RPC health check expected version
5. Test with LND installed and synced
6. Update `instructions.md` for user-visible changes

## Testing checklist

- [ ] LND installed, running, synced
- [ ] Mostro installs via sideload
- [ ] Critical tasks completed (Nostr setup, LND config, etc.)
- [ ] Service starts; health checks green
- [ ] RPC health check passes when RPC enabled
- [ ] Configure via each action; settings persist across restart
- [ ] `start-cli package logs mostro -f` — no crash loops
- [ ] Uninstall / reinstall clean
