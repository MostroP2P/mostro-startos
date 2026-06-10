# Project Structure & Workflow

## Environment setup

| Tool | Install |
|------|---------|
| Docker | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Make | `sudo apt install build-essential` |
| Node.js 22 | `nvm install 22 && nvm use 22` |
| SquashFS | `sudo apt install squashfs-tools squashfs-tools-ng` |
| start-cli | `curl -fsSL https://start9.com/start-cli/install.sh \| sh` |

Verify:

```bash
docker --version && make --version && node --version && mksquashfs -version && start-cli --version
```

## Developer key & host config

```bash
start-cli init-key          # creates ~/.startos/developer.key.pem if missing
start-cli pubkey            # show public key for registry admin
```

`~/.startos/config.yaml`:

```yaml
host: http://192.168.122.x    # or http://your-server-name.local
# registry-url: https://alpha-registry-x.start9.com   # optional, for publish
```

## Build commands (Mostro Makefile)

```bash
make              # build mostro.s9pk (all arches in ingredients)
make x86          # x86_64 only — use for VM dev
make arm          # aarch64 only
make clean        # remove artifacts
make install      # build + sideload to configured host
make clean x86 install   # common dev loop
```

Build pipeline:

1. `npm ci` / `npm run build` → `javascript/index.js` via `@vercel/ncc`
2. `start-cli s9pk pack` → signed `.s9pk`

Prerequisites checked automatically: `start-cli`, `npm`, developer key.

## Development discipline

From `start-docs/packaging/src/workflow.md`:

1. **Doc sync** — code change → update `README.md` and/or `instructions.md` in same change.
2. **Dirty tree OK** — `-modified` pack hash is informational; one clean commit when done.
3. **Pre-existing errors count** — red `tsc`/pack = package doesn't pass.
4. **Compile ≠ working** — install, log in, write data, restart; verify end-to-end.
5. **Don't fabricate** — verify image tags, config formats, icons; flag gaps in `TODO.md`.
6. **Search SDK types** before claiming impossible: `node_modules/@start9labs/start-sdk/**/*.d.ts`.
7. **Version files** — edit `current.ts` in place unless migration needed.

## Iteration loop

```
edit TypeScript → make x86 → make install → check UI/tasks/health → package logs/attach
```

If container state is stale:

```bash
start-cli package rebuild mostro
# or from UI: service → Rebuild Container
```

## CI/CD (typical StartOS package)

```
PR → Build
Merge to master → Version check → Tag → Build → Release → Publish
Manual tag v*.* → Build → Release → Publish
```

## Session sync

```bash
git -C start-docs pull --ff-only   # refresh packaging guide + AGENTS.md
npm update                          # bump SDK if needed
```
