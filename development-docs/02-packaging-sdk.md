# Packaging SDK Reference

## File map (this repo uses SDK 0.4 layout)

Mostro uses a slightly older flat layout (`startos/manifest.ts` vs `startos/manifest/index.ts`). New packages scaffold with nested dirs; concepts are the same.

| File | Purpose |
|------|---------|
| `startos/manifest.ts` | Service ID, images, volumes, dependencies, descriptions |
| `startos/main.ts` | Daemons, mounts, health checks, runtime logic |
| `startos/init/index.ts` | Init pipeline ordering |
| `startos/interfaces.ts` | Network ports (UI, API, P2P) |
| `startos/dependencies.ts` | Cross-service requirements (warning UI) |
| `startos/actions/` | User-facing configuration actions |
| `startos/file-models/` | Typed config files (TOML, JSON, etc.) |
| `startos/install/versions/` | Version graph + migrations |
| `startos/backups.ts` | Backup volumes |
| `instructions.md` | **Required** end-user docs (shown in UI) |
| `assets/` | **Required** (≥1 file, e.g. `ABOUT.md`) |
| `icon.svg` | Service icon (max 40 KiB) |

## Init pipeline order (fixed)

```
restoreInit → versionGraph → setInterfaces → setDependencies → actions → [custom inits]
```

First two steps must stay first and second.

## setupMain — daemons

```typescript
return sdk.Daemons.of(effects, started)
  .addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(effects, { imageId: 'app' }, mounts, 'app-sub'),
    exec: { command: ['binary', 'args'], env: { ... } },
    ready: { display: null, fn: () => ({ result: 'success', message: null }) },
    requires: [],
  })
  .addOneshot('migrate', { ... })   // runs before dependent daemons
  .addHealthCheck('my-check', { ready: { display: '...', fn: async () => ... }, requires: ['primary'] })
```

- **SubContainer.of()** — long-lived daemon container.
- **SubContainer.withTemp()** — one-off in actions/init.
- **`.const(effects)`** on file model reads — reactive; restarts daemon on change.
- **`runAsInit: true`** — required when image bundles s6-overlay/tini/supervisord (must be PID 1).
- **`sdk.useEntrypoint()`** — run upstream Docker entrypoint.

## setupInterfaces

```typescript
const multi = sdk.MultiHost.of(effects, 'ui')
const origin = await multi.bindPort(8080, { protocol: 'http', preferredExternalPort: 8080 })
const iface = sdk.createInterface(effects, { id: 'ui', type: 'ui', ... })
return [await origin.export([iface])]
```

**Gotcha:** Inside container all traffic is HTTP. User-facing URLs in actions/UI must use **`https://`** (StartOS terminates SSL at edge).

## Actions

```typescript
sdk.Action.withoutInput('id', metadata, handler)
sdk.Action.withInput('id', metadata, inputSpec, prefill, handler)
```

- Wrap user strings in `i18n()`.
- Prefill uses `.once()`, not `.const()`.
- `allowedStatuses`: `'any' | 'only-running' | 'only-stopped'`.

## Tasks

```typescript
sdk.action.createOwnTask(effects, action, 'critical' | 'important' | 'optional', { reason })
sdk.action.createTask(effects, 'dep-id', importedAction, 'critical', { input, when, reason })
```

| Severity | Effect |
|----------|--------|
| `critical` | Blocks service start |
| `important` | Prominent, non-blocking |
| `optional` | Informational |

Default `replayId` = `[package-id]:[action-id]` — idempotent across init reruns.

## File models

```typescript
export const settings = FileHelper.toml({ volumeId: 'main', subpath: '/settings.toml' }, shape)
```

Rules:

- Every key needs `.catch()` — schema **is** the default.
- **Always `merge()`**, never `write()` (preserves unknown upstream keys).
- Read with map: `.read((s) => s.field).const(effects)` — never identity `.read((s) => s)`.
- Missing file → read returns `null`.
- Delete stale keys: `merge(effects, { oldKey: undefined })`.

## Dependencies

**Manifest** declares deps with `metadata` or `s9pk` URL.

**setupDependencies** drives warning UI only — does **not** block startup. Use `sdk.checkDependencies(effects).throwIfNotSatisfied()` in `main.ts` if you need hard gating (Mostro does this).

Cross-service access:

```typescript
// DNS hostname inside StartOS LAN
http://lnd.startos:10009

// Mount dependency volume
.mountDependency({ dependencyId: 'lnd', volumeId: 'main', mountpoint: '/lnd', readonly: true })

// Read dependency interface URL
sdk.serviceInterface.get(effects, { id: 'rpc', packageId: 'lnd' }, mapper).const()
```

## Versions (ExVer)

Format: `[#flavor:]<upstream>[-prerelease]:<downstream>`

Example: `0.14.3:0`, `0.14.2:0-alpha.2`

- Latest always in `install/versions/current.ts` (or `versions/current.ts` in new layout).
- New version file only when migration needed.
- Git tag: `v{upstream}_{downstream}` → `v0.14.3_0`

Bump checklist: `current.ts`, manifest `dockerTag`, git tag — all aligned.
