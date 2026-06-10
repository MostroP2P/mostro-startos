# TODO — SDK 1.5 migration

## Migration

- [x] Step 1: `s9pk.mk` build system + `startos/manifest/index.ts`
- [x] Step 2: Bump `@start9labs/start-sdk` to 1.5.3 + fix `tsconfig.json`
- [x] Step 3: `startos/manifest/i18n.ts` — locale descriptions + manifest field renames
- [x] Step 4: `startos/i18n/` + wrap action strings in `i18n()`
- [x] Step 5: `fileModels/` with `z` schemas + `.catch()`
- [x] Step 6: `startos/versions/` + `seedDefaults` init
- [x] Step 7: `main.ts` — `Daemons.of(effects)`, RPC version from docker tag
- [x] Step 8: Fix `instructions.md` stale LND paths
- [x] Step 9: CI workflows (`.github/workflows/`)
- [x] Upstream bump: `mostrop2p/mostro:v0.17.4` → version `0.17.4:0`
- [x] Fix LND dependency manifest (metadata instead of broken s9pk URL)
- [x] `make x86` produces `mostro_x86_64.s9pk` (v0.17.4:0, SDK 1.5.3)
- [ ] Step 10: VM sideload test end-to-end

## Package maintenance

- [x] Verify LND volume mount paths (`main.ts`) — `/lnd/tls.cert`, macaroon path, `lnd.startos:10009`
- [ ] Configure GitHub repo secrets/vars for CI:
  - **Required secret:** `DEV_KEY` (developer signing key PEM — same as `start-cli init-key`)
  - **Optional vars:** `REFERENCE_REGISTRY` (defaults to `https://community-registry.start9.com`), `RELEASE_REGISTRY`, `S3_S9PKS_BASE_URL`
  - **Optional secrets (registry publish):** `S3_ACCESS_KEY`, `S3_SECRET_KEY`
