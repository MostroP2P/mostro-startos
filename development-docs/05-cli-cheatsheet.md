# start-cli Cheatsheet

Full reference: `start-docs/start-os/src/cli-reference.md`

Install: `curl -fsSL https://start9.com/start-cli/install.sh | sh`

## Global options

```bash
start-cli -H prod <cmd>              # host profile from config.yaml
start-cli -H http://192.168.1.10 <cmd>
start-cli --developer-key-path ~/.startos/developer.key.pem <cmd>
start-cli --registry https://alpha-registry-x.start9.com <cmd>
```

## Auth (remote dev)

```bash
start-cli auth login                 # prompts for master password
```

## Package lifecycle

```bash
start-cli package list
start-cli package install -s mostro.s9pk          # sideload local file
start-cli package install mostro [VERSION] --sideload
start-cli package start|stop|restart mostro
start-cli package uninstall mostro
start-cli package logs mostro -f
start-cli package attach mostro                   # shell in subcontainer
start-cli package attach mostro mostro-sub        # skip picker
start-cli package stats mostro
start-cli package rebuild mostro
start-cli package installed-version mostro
start-cli package action run mostro <ACTION_ID> '<JSON_INPUT>'
start-cli package action clear-task mostro <REPLAY_ID>
```

## S9PK build & inspect

```bash
start-cli init-key
start-cli pubkey
start-cli s9pk pack                              # from package root (uses Makefile ingredients)
start-cli s9pk pack . -o mostro.s9pk
start-cli s9pk list-ingredients
start-cli s9pk inspect manifest mostro.s9pk
start-cli s9pk inspect file-tree mostro.s9pk
start-cli s9pk inspect cat mostro.s9pk manifest.json
start-cli s9pk select mostro_x86_64.s9pk mostro_aarch64.s9pk   # pick best for device
```

## Registry (alpha / self-hosted)

```bash
start-cli registry index
start-cli registry package get mostro
start-cli registry package add mostro.s9pk --no-verify    # skip sig verify (testing only)
start-cli registry package download mostro -d ./mostro.s9pk

# Publish to registry (requires admin signer)
start-cli s9pk publish --url https://alpha-registry-x.start9.com mostro.s9pk
start-cli --registry=https://alpha-registry-x.start9.com registry package add mostro.s9pk https://github.com/.../mostro.s9pk
```

## Server maintenance

```bash
start-cli server rebuild             # rebuild all service containers
start-cli diagnostic rebuild         # from diagnostic mode
```

## SSH on StartOS host

User: `start9` (not root). Password = master password.

```bash
ssh start9@192.168.122.x
ssh start9@your-server-name.local
```

Then run `start-cli` commands directly on the host.

## Find VM IP (libvirt default network)

```bash
virsh net-dhcp-leases default
# or
virsh domifaddr startos-vm
```
