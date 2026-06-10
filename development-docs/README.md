# StartOS Development Docs

Condensed notes distilled from `start-docs/` for building, testing, and shipping the **Mostro** StartOS package. Use these as quick reference; the full upstream guides live in `start-docs/`.

## Index

| Doc | Purpose |
|-----|---------|
| [01-architecture.md](./01-architecture.md) | How StartOS and S9PK packages work |
| [02-packaging-sdk.md](./02-packaging-sdk.md) | SDK constructs: manifest, main, init, actions, file models |
| [03-project-structure-and-workflow.md](./03-project-structure-and-workflow.md) | Package layout, build system, dev discipline |
| [04-recipes-quick-reference.md](./04-recipes-quick-reference.md) | Intent → recipe map for common tasks |
| [05-cli-cheatsheet.md](./05-cli-cheatsheet.md) | `start-cli` commands for daily dev |
| [06-startos-platform.md](./06-startos-platform.md) | OS-side concepts: sideloading, health checks, networking |
| [07-mostro-package.md](./07-mostro-package.md) | Mostro-specific architecture and open items |
| [08-publishing-registries.md](./08-publishing-registries.md) | Alpha registry, community pipeline, self-hosted registry |
| [09-gotchas-and-debugging.md](./09-gotchas-and-debugging.md) | Common traps and troubleshooting |
| **[10-sdk-migration-plan.md](./10-sdk-migration-plan.md)** | **SDK 0.4 beta → 1.5.3 migration roadmap** |
| **[vm-setup-and-sideload.md](./vm-setup-and-sideload.md)** | **Step-by-step: VM + sideload Mostro** |

## Source of truth

```
start-docs/
├── start-os/src/       ← OS user docs (architecture, sideloading, CLI)
├── packaging/src/      ← Package developer guide (recipes + reference)
└── packaging/AGENTS.md ← AI agent context (sync with: git -C start-docs pull --ff-only)
```

## Quick start (existing dev machine)

```bash
# Prerequisites: docker, make, node 22, squashfs-tools, start-cli
curl -fsSL https://start9.com/start-cli/install.sh | sh

cd /path/to/mostro-startos
npm ci
make x86          # build mostro.s9pk for VM (x86_64)
make install      # sideload to host in ~/.startos/config.yaml
```

See [vm-setup-and-sideload.md](./vm-setup-and-sideload.md) for the full VM workflow from scratch.
