# Publishing & Registries

## Alpha registry (Mostro testing)

```
https://alpha-registry-x.start9.com
```

Add package (from dev machine with registry admin rights):

```bash
start-cli --registry=https://alpha-registry-x.start9.com registry package add \
  mostro.s9pk \
  https://github.com/MostroP2P/mostro-startos/releases/download/v0.14.1-alpha.1/mostro.s9pk
```

## Start9 Community pipeline

1. Email `submissions@start9.com` with repo link
2. Start9 forks to `Start9-Community` org
3. PR → merge → auto-publish to **community-alpha**
4. Promote to beta → prod via issue/email

Registries progression:

```
community-alpha-registry-x.start9.com
  → community-beta-registry.start9.com
  → community-registry.start9.com
```

## Pre-publish checklist

- Git tag matches ExVer format (`v0.14.3_0`)
- `npm run check` / `tsc` clean
- `make` produces signed `.s9pk`
- README current (no version numbers in README per convention)
- `instructions.md` current
- End-to-end: install → start → configure → restart → uninstall → reinstall

## Self-hosted registry

1. Install **StartOS Registry** from Marketplace on a StartOS box
2. Configure Registry action
3. Add Administrator with `start-cli pubkey` output
4. Point CLI: `--registry https://your-registry.local`

Admin commands:

```bash
start-cli registry admin signer add --name "Dev" --key "$(cat pubkey.pem)"
start-cli registry package signer add mostro <SIGNER_ID> --versions ">=0.14.0"
start-cli s9pk publish --url https://your-registry.local mostro.s9pk
start-cli registry package remove mostro <VERSION>
```

## GitHub releases

Typical flow:

```bash
git tag v0.14.3_0
git push origin v0.14.3_0    # push tag individually, not --tags
# CI builds and attaches mostro.s9pk to release
```

## Developer signing key

- Path: `~/.startos/developer.key.pem`
- Created by `start-cli init-key` or `make` (auto-init)
- **Back up like an SSH key** — required to publish updates for your packages

## Default marketplace registries

| Registry | Role |
|----------|------|
| Start9 Registry | Primary, maintained, recommended |
| Community Registry | Passes technical review; not maintained by Start9 |

Users switch registries in Marketplace sidebar.
