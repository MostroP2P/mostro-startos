# Gotchas & Debugging

## Top traps (from packaging guide)

| Area | Trap | Fix |
|------|------|-----|
| Init | Restart ≠ init | Use Container Rebuild or reinstall to re-run init |
| Init order | Wrong pipeline order | `restoreInit` → `versionGraph` must be first |
| File models | Using `write()` | Always `merge()` |
| File models | Missing `.catch()` | Every key needs default |
| File models | Identity read `.read(s => s)` | Map to specific fields |
| Interfaces | `http://` in user URLs | Use `https://` for browser-facing links |
| Prebuilt images | Wrong/missing mounts | Mount config **and** data paths |
| Prebuilt images | s6/tini not PID 1 | `runAsInit: true` + `useEntrypoint()` |
| Credentials | Hand-written hash format | Use app's API/CLI; verify login |
| Proxy | Host header validation | Disable app's reverse-proxy guard |
| Config | App clobbers on shutdown | Write config before daemon start or via API |
| Dependencies | `setupDependencies` alone | Doesn't block start — use `checkDependencies` if needed |
| Versions | New file per bump | Edit `current.ts` unless migration |
| Build | Missing `instructions.md` | Required in 0.4.0+ |
| Build | Empty `assets/` | Must have ≥1 file |

## Mostro-specific

| Issue | Check |
|-------|-------|
| Won't start | LND installed? `checkDependencies` satisfied? |
| `DbAccessError` permission denied | `/mostro` owned by root; fixed by `prepare-runtime` oneshot in `main.ts` |
| Wrong DB path | Use `sqlite://mostro.db` (not `sqlite://mostro/mostro.db`) in `[database]` |
| LND macaroon read error | LND creds are root-only on read-only `/lnd` mount; copied to `/mostro/lnd-creds/` at start |
| RPC health fail | RPC enabled in settings? grpcurl in image? Version string match? |
| Nostr not publishing | Relays configured? `setupNostr` init ran? |

## Debugging workflow

```bash
# 1. Service logs
start-cli package logs mostro -f

# 2. Shell inside container
start-cli package attach mostro

# 3. Inspect generated config (inside attach)
cat /mostro/settings.toml
ls -la /mostro /lnd

# 4. Test RPC manually (inside attach, if RPC enabled)
grpcurl -plaintext -import-path /proto -proto admin.proto \
  -d '{}' 127.0.0.1:50051 mostro.admin.v1.AdminService/GetVersion

# 5. Rebuild stale container
start-cli package rebuild mostro

# 6. Inspect package without install
start-cli s9pk inspect manifest mostro.s9pk
```

## VM / network issues

| Symptom | Fix |
|---------|-----|
| Can't reach `start.local` | Use router DHCP list or `virsh net-dhcp-leases default` |
| Guest network isolation | Use bridged or libvirt `default` network; same LAN as host |
| HTTPS cert errors | Trust Root CA from StartOS UI |
| VPN blocks LAN | Allow LAN in VPN settings |
| Tor Browser | Won't work for `.local` — use normal browser |

## FAQ highlights

From `start-docs/start-os/src/faq.md`:

- Always use surge protector (even in VM dev, good habit)
- Diagnostic Mode → contact support, don't improvise
- Clock sync failures can break TLS — ensure NTP works in VM

## When things go wrong on StartOS 0.4.0

- Previous backups incompatible — create fresh backup after upgrade
- `start-cli server rebuild` for widespread container issues
- OS update: follow official 0.4.0 update guide exactly

## SDK discovery

Before workaround hacks:

```bash
grep -r "runAsInit\|mountDependency\|checkDependencies" node_modules/@start9labs/start-sdk/
```

Read types in `node_modules/@start9labs/start-sdk/**/*.d.ts`.

## Useful doc paths (full detail)

```
start-docs/packaging/src/workflow.md
start-docs/packaging/src/recipe-prebuilt-image.md
start-docs/packaging/src/file-models.md
start-docs/start-os/src/sideloading.md
start-docs/start-os/src/service-containers.md
start-docs/start-os/src/health-checks.md
start-docs/start-os/src/faq.md
```
