---
name: build-and-format
description: >-
  Format, type-check, and build the Mostro StartOS package (prettier, tsc, ncc,
  optional make x86). Use when the user asks to build, format, prettify, compile,
  type-check, pack, or verify the package before sideload.
---

# Build & Format — Mostro StartOS

Run the standard pipeline after editing `startos/` TypeScript.

## Quick start

From repo root, prefer the bundled script:

```bash
bash .cursor/skills/build-and-format/scripts/build-and-format.sh
```

With `.s9pk` output for VM sideload:

```bash
bash .cursor/skills/build-and-format/scripts/build-and-format.sh --s9pk
```

## Default pipeline

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `npm ci` | Only if `node_modules/` is missing |
| 2 | `npm run prettier` | Format `startos/` (single quotes, no semis, trailing commas) |
| 3 | `npm run check` | `tsc --noEmit` — must pass before build |
| 4 | `npm run build` | `ncc` → `javascript/index.js` |
| 5 | `make x86` | Only with `--s9pk` — produces `mostro_x86_64.s9pk` |

`make x86` also runs `npm run check` and `npm run build` via `s9pk.mk` ingredients — the script runs them first so failures surface early with formatted code.

## Script options

```bash
bash .cursor/skills/build-and-format/scripts/build-and-format.sh --format-only
bash .cursor/skills/build-and-format/scripts/build-and-format.sh --check-only
bash .cursor/skills/build-and-format/scripts/build-and-format.sh --s9pk
```

## Prerequisites

| Tool | Required for |
|------|----------------|
| Node.js 22 + npm | format, check, build |
| `start-cli` | `--s9pk` / `make` |
| Docker | `make x86` (image pull during pack) |
| `~/.startos/developer.key.pem` | `make` auto-creates via `start-cli init-key` |

## After a successful `--s9pk` build

```bash
make install          # sideload to host in ~/.startos/config.yaml
# or
start-cli package install -s mostro_x86_64.s9pk
```

## Agent workflow

When the user asks to build or format:

1. **Run the script** — do not skip prettier unless `--check-only` was requested
2. **Fix failures** — address `tsc` errors before re-running
3. **Report** — state which steps passed; list any files prettier reformatted
4. **Sideload** — only run `make install` if the user asked to deploy

## Manual equivalents

```bash
npm run prettier && npm run check && npm run build
make clean x86        # full clean arch build
make clean x86 install  # build + sideload
```

## Prettier config

From `package.json`: `trailingComma: all`, `tabWidth: 2`, `semi: false`, `singleQuote: true`. Scope is `startos/` only.
