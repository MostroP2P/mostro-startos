# SDK 1.5 Migration Plan — Mostro StartOS

Study of the current Mostro package against the **latest StartOS packaging template** (`start-docs/packaging/package-template/`, SDK **1.5.3**) and the official packaging guide. Use this as the roadmap for the upcoming refinement work.

## Executive summary

| | Current (Mostro) | Target (template / latest) |
|---|------------------|----------------------------|
| **SDK** | `@start9labs/start-sdk@0.4.0-beta.36` | `@start9labs/start-sdk@1.5.3` |
| **StartOS** | 0.4.0-beta.9 | Same (SDK 1.5 ships with 0.4.x) |
| **Layout** | Legacy flat (`manifest.ts`, `install/versions/`, `file-models/`) | Nested (`manifest/`, `versions/`, `fileModels/`, `i18n/`) |
| **Schema lib** | `matches` (removed in 1.5) | `z` (Zod) with `.catch()` on every key |
| **File paths** | `{ volumeId, subpath }` | `{ base: sdk.volumes.main, subpath }` |
| **i18n** | Plain English strings in actions/manifest | `i18n()` + locale dictionaries (5 langs) |
| **Build** | Custom `Makefile` | `s9pk.mk` + thin `Makefile` |
| **tsc today** | ✅ Passes on beta.36 | ❌ 25+ errors in `startos/` alone on 1.5.3 |

The package **works at runtime** on StartOS 0.4.0-beta.9 with SDK beta.36, but is **structurally one generation behind** the current Start9 template. Migration is a moderate refactor (~15–20 files), not a rewrite.

---

## Current package inventory

### What exists and is good

| Item | Status |
|------|--------|
| `startos/main.ts` | Daemons, LND mount, RPC health check — solid core |
| `startos/actions/*` | 5 config actions + Nostr setup task — complete |
| `startos/interfaces.ts` | RPC port 50051 — correct pattern |
| `startos/dependencies.ts` | LND running + sync health — correct |
| `startos/init/index.ts` | Correct pipeline order |
| `assets/ABOUT.md`, `assets/icon.svg` | Present (icon also at repo root) |
| `instructions.md` | Present (230 lines; some paths outdated — see below) |
| `npm run check` | Passes on SDK 0.4.0-beta.36 |

### What is missing vs template

| Item | Required? | Notes |
|------|-----------|-------|
| `s9pk.mk` | Recommended | Multi-arch builds (`make x86`, `make arm`) |
| `startos/manifest/index.ts` + `i18n.ts` | Yes for 1.5 | Manifest field renames + locale descriptions |
| `startos/i18n/` | Yes for 1.5 | Action strings, health check labels |
| `startos/versions/current.ts` | Yes for 1.5 | Move from `install/versions/` |
| `CONTRIBUTING.md`, `TODO.md`, `UPDATING.md` | Recommended | Per Start9 package convention |
| `AGENTS.md`, `CLAUDE.md` | Optional | Pointer files for AI dev |
| `.github/workflows/` | Recommended | CI build + release |
| Root `icon.svg` | Required | Verify ≤40 KiB; may duplicate `assets/icon.svg` |

---

## API breaking changes (0.4 beta → 1.5.3)

Verified by upgrading SDK locally and running `npm run check`. Errors below are **Mostro-only** (excluding `lnd-startos` dep noise).

### 1. Manifest fields

```diff
- wrapperRepo: '...'
- supportSite: '...'
- marketingSite: '...'
- docsUrl: '...'
+ packageRepo: '...'
+ marketingUrl: '...'
+ donationUrl: '...' | null
```

Descriptions become locale objects:

```typescript
// startos/manifest/i18n.ts
export const short = { en_US: '...', es_ES: '...', ... }
export const long = { en_US: '...', ... }

// startos/manifest/index.ts
description: { short, long },
```

### 2. File models — `matches` → `z`

```diff
- import { matches, FileHelper } from '@start9labs/start-sdk'
- const { object, string, boolean } = matches
+ import { FileHelper, z } from '@start9labs/start-sdk'

- nostrKeysConfigured: boolean,
+ nostrKeysConfigured: z.boolean().catch(false),
```

**Every key needs `.catch()`** — this fixes the `{}` type errors in actions when reading TOML sections.

Path config:

```diff
- FileHelper.json({ volumeId: 'main', subpath: '/store.json' }, shape)
+ FileHelper.json({ base: sdk.volumes.main, subpath: './store.json' }, shape)
```

Rename directory: `file-models/` → `fileModels/`

### 3. `setupMain` signature

```diff
- async ({ effects, started }) => {
-   return sdk.Daemons.of(effects, started)
+ async ({ effects }) => {
+   return sdk.Daemons.of(effects)
```

Remove `started` parameter entirely.

### 4. `VersionGraph` — no `preInstall`

The current `install/versionGraph.ts` uses `preInstall` with raw `fs/promises` access to host paths — **removed in 1.5**.

```diff
- VersionGraph.of({ current, other, preInstall: async (effects) => { ... } })
+ VersionGraph.of({ current, other })
```

**Move seed logic** to `sdk.setupOnInit` with `kind === 'install'`:

```typescript
// startos/init/seedDefaults.ts
export const seedDefaults = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return
  await storeJson.merge(effects, {})
  await daemon_settings.merge(effects, {})
})
```

Use `merge(effects, {})` not `write()` — SDK guide rule.

### 5. Release notes — locale objects

```diff
- releaseNotes: 'Some fixes...'
+ releaseNotes: {
+   en_US: 'Some fixes...',
+   es_ES: '...',
+   ...
+ }
```

### 6. Actions — wrap strings in `i18n()`

```diff
+ import { i18n } from '../i18n'

  async () => ({
-   name: 'Configure Nostr Settings',
+   name: i18n('Configure Nostr Settings'),
```

Add all user-facing strings to `startos/i18n/dictionaries/default.ts` (+ translations).

### 7. `lnd-startos` git dependency

Current:

```json
"lnd-startos": "git+https://github.com/Start9Labs/lnd-startos.git#update/040"
```

The `#update/040` branch is still on **SDK 0.4 beta patterns** (`matches`, `preInstall`, `started`). On SDK 1.5.3, `tsc` pulls in **100+ errors from lnd-startos/bitcoind-startos** in `node_modules`.

**Options for migration:**

| Option | Pros | Cons |
|--------|------|------|
| A. Wait for LND package 1.5 migration on Start9Labs | Clean types, official support | Blocked on upstream |
| B. Pin LND to a 1.5-compatible tag when available | Same | Need to track Start9Labs releases |
| C. Remove `lnd-startos` npm dep; use manifest `s9pk` URL only | Eliminates tsc noise from node_modules | Lose typed action imports if any added later |
| D. `skipLibCheck: true` + exclude node_modules in tsconfig | Quick unblock | Hides real type errors |

**Recommendation:** Option C for now (Mostro doesn't import LND actions today), plus exclude `node_modules/**/startos` from tsconfig if needed. Re-add typed dep when LND ships SDK 1.5.

---

## Logic bugs to fix during migration

These exist in current code regardless of SDK version:

### `install/versionGraph.ts` — broken preInstall

| Issue | Detail |
|-------|--------|
| Wrong filename | Checks `config.toml` but file model uses `settings.toml` |
| Uses `write()` | Should use `merge()` per SDK guide |
| Host path access | `access('/media/startos/volumes/main/...')` bypasses effects API — fragile |
| Placeholder nsec | Seeds `nsec1...` placeholder in TOML — should stay empty until user configures |

**Fix:** Replace with install-only init that calls `merge(effects, {})` on both file models.

### `main.ts` — hardcoded RPC version

```typescript
const expectedVersion = '0.14.1'  // manifest image is 0.14.3
```

Derive from version graph or manifest tag.

### `instructions.md` — stale paths

Lines 34–37 still reference Embassy-era paths:

```
/mnt/lnd/...
https://lnd.embassy:10009
```

Should match code defaults:

```
/lnd/tls.cert
/lnd/data/chain/bitcoin/mainnet/admin.macaroon
https://lnd.startos:10009
```

### Actions — inconsistent storeJson usage

Several actions use `storeJson.write()` when `merge()` would preserve unknown keys — prefer `merge()` for partial updates.

### `settings.ts` — no `.catch()` defaults

Without Zod `.catch()`, missing TOML keys return `{}` for nested sections — causes the property-access errors seen under SDK 1.5 strict typing.

---

## File-by-file migration map

| Current | Target | Action |
|---------|--------|--------|
| `startos/manifest.ts` | `startos/manifest/index.ts` + `i18n.ts` | Split + rename fields |
| `startos/install/versions/` | `startos/versions/` | Move; rename exports |
| `startos/install/versionGraph.ts` | `startos/versions/index.ts` | Remove `preInstall`; export graph |
| `startos/file-models/*.ts` | `startos/fileModels/*.ts` | Rewrite with `z` + new path API |
| `startos/init/index.ts` | same | Add `seedDefaults`; update imports |
| `startos/main.ts` | same | Remove `started`; fix Daemons.of |
| `startos/actions/*.ts` | same | Add `i18n()` wrappers |
| — | `startos/i18n/` | **Create** (index + dictionaries) |
| `Makefile` | `Makefile` + `s9pk.mk` | Adopt shared build |
| `package.json` | same | SDK 1.5.3, `@types/node` ^22 |
| `tsconfig.json` | same | Exclude lnd-startos from include if needed |
| `startos/index.ts` | same | Update manifest/versionGraph import paths |

---

## Recommended migration phases

### Phase 1 — Scaffold (no behavior change)

1. Copy `s9pk.mk` from package template
2. Create `startos/manifest/`, `startos/versions/`, `startos/i18n/`, `startos/fileModels/`
3. Add `CONTRIBUTING.md`, `TODO.md`, `UPDATING.md` from template
4. Bump SDK to `1.5.3` in `package.json`

### Phase 2 — API migration

1. Manifest + i18n locale strings
2. File models (`z` + `.catch()` + new path API)
3. `main.ts` (`Daemons.of(effects)` only)
4. Version graph (move `preInstall` → init seed)
5. All actions (`i18n()` wrappers)

### Phase 3 — Fix logic bugs

1. Settings seed via `merge()` on install
2. RPC health check version from manifest/current
3. Update `instructions.md` paths
4. Verify LND mount paths against running LND package

### Phase 4 — Build & verify

1. `npm run check` clean
2. `make x86` produces signed `mostro.s9pk`
3. Sideload on VM; install LND + Mostro
4. Complete all tasks; verify RPC health check
5. Restart service; confirm settings persist

### Phase 5 — CI & publish

1. Add `.github/workflows/` (build, tagAndRelease, release)
2. Tag `v0.14.3_0` (align version with docker tag)
3. Publish to alpha registry

---

## tsconfig recommendation for migration

Current:

```json
"include": ["startos/**/*.ts", "node_modules/**/startos"]
```

The `node_modules/**/startos` include pulls lnd-startos types into compilation. During migration:

```json
"include": ["startos/**/*.ts"]
```

Only add lnd-startos back when it ships SDK 1.5.

---

## Reference: template vs Mostro diff summary

```
TEMPLATE (1.5.3)                    MOSTRO (0.4 beta)
─────────────────                   ─────────────────
startos/manifest/index.ts           startos/manifest.ts
startos/manifest/i18n.ts            (inline English strings)
startos/versions/current.ts         startos/install/versions/v0.14.2.ts
startos/versions/index.ts           startos/install/versionGraph.ts (+ preInstall)
startos/fileModels/                 startos/file-models/
startos/i18n/                       (missing)
matches / volumeId                  z / sdk.volumes.main
make + s9pk.mk                      custom Makefile
packageRepo                         wrapperRepo
i18n() in actions                   plain strings
releaseNotes: { en_US: ... }        releaseNotes: string
setupMain({ effects })              setupMain({ effects, started })
Daemons.of(effects)                 Daemons.of(effects, started)
```

---

## Quick commands for migration dev

```bash
# Compare with template
diff -ru start-docs/packaging/package-template/startos/ startos/ | less

# Test SDK upgrade impact
npm install @start9labs/start-sdk@1.5.3 --save-exact
npm run check 2>&1 | rg '^startos/'

# After migration
make clean x86 install
start-cli package logs mostro -f
```

---

## Related docs

- Template source: `start-docs/packaging/package-template/`
- File models guide: `start-docs/packaging/src/file-models.md`
- Manifest guide: `start-docs/packaging/src/manifest.md`
- Versions guide: `start-docs/packaging/src/versions.md`
- [07-mostro-package.md](./07-mostro-package.md) — runtime architecture
- [03-project-structure-and-workflow.md](./03-project-structure-and-workflow.md) — dev discipline
