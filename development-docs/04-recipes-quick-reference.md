# Recipes Quick Reference

Start at `start-docs/packaging/src/recipes.md` for full detail. Each recipe links to reference pages and real packages.

## When you need…

| Intent | Recipe | Key files |
|--------|--------|-----------|
| New package from scratch | `recipe-basic-service.md` | scaffold + `TODO.md` |
| Wrap existing Docker image | **`recipe-prebuilt-image.md`** | **Mostro uses this pattern** |
| User config via UI actions | `recipe-config-actions.md` | `actions/`, file models |
| Generate config on disk | `recipe-config-files.md` | `fileModels/` |
| Env vars to container | `recipe-env-vars.md` | `main.ts` exec.env |
| Expose web UI | `recipe-web-ui.md` | `interfaces.ts` |
| Expose API / gRPC | `recipe-api-interface.md` | `interfaces.ts` |
| Multiple ports | `recipe-multi-interface.md` | `interfaces.ts` |
| Depend on LND/Bitcoin/etc. | `recipe-dependency.md` | `dependencies.ts`, manifest |
| Hard-require dependency at start | `recipe-enforce-dependency.md` | `checkDependencies` in main |
| Mount dep volume (macaroons) | `recipe-mount-dependency.md` | `main.ts` mounts |
| Auto-generate secrets | `recipe-internal-secrets.md` | init + `store.json` |
| Admin password flow | `recipe-admin-credentials.md` | init task + action |
| Block start until setup | `recipe-require-setup.md` | critical tasks |
| One-time install setup | `recipe-install-init.md` | init handlers |
| Bootstrap via temp daemon | `recipe-run-until-success.md` | init |
| Version upgrade migrations | `recipe-version-migrations.md` | `versions/` |
| Backup restore hooks | `recipe-restore-init.md` | `backups.ts` |
| Health checks | `recipe-health-checks.md` | `main.ts` |
| Backups | `recipe-backups.md` | `backups.ts` |
| PostgreSQL sidecar | `recipe-postgresql.md` | multi-daemon |
| One-shot migration | `recipe-oneshot.md` | `main.ts` |
| SMTP alerts | `recipe-smtp.md` | store + actions |
| User notifications | `recipe-notification.md` | `sdk.notification.create()` |

## Prebuilt Docker image checklist (Mostro-relevant)

From `recipe-prebuilt-image.md`:

- [ ] Confirm image repo, tag, and arches from registry (not memory)
- [ ] Mount **every** persisted path (config + data)
- [ ] Expose **every** required port (UI + RPC + P2P if needed)
- [ ] Use `sdk.useEntrypoint()`; `runAsInit: true` if image has s6/tini
- [ ] Set expected env vars
- [ ] Credentials via app's own mechanism; verify real login
- [ ] Install on StartOS and exercise — not just green `tsc`

## Example packages to read

| Pattern | Package |
|---------|---------|
| Prebuilt image | [vaultwarden-startos](https://github.com/Start9Labs/vaultwarden-startos), [ollama-startos](https://github.com/Start9Labs/ollama-startos) |
| LND dependency | [robosats-startos](https://github.com/Start9Labs/robosats-startos), [lnbits-startos](https://github.com/Start9Labs/lnbits-startos) |
| Multi-daemon | [immich-startos](https://github.com/Start9Labs/immich-startos) |
| API interface | [electrs-startos](https://github.com/Start9Labs/electrs-startos) |
