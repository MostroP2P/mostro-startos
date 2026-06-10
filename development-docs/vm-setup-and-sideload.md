# VM Setup & Sideload Mostro

Complete workflow: run **StartOS v0.4.0-beta.9** in a libvirt/KVM VM on Linux, then build and sideload the **Mostro** package from your dev machine.

> **Check latest release:** [github.com/Start9Labs/start-os/releases/latest](https://github.com/Start9Labs/start-os/releases/latest)  
> Update `STARTOS_VERSION` below if a newer release is published.

---

## Overview

```
┌─────────────────────┐         ┌──────────────────────────────┐
│  Dev machine (host) │         │  StartOS VM (libvirt/KVM)    │
│                     │         │                              │
│  mostro-startos/    │ sideload│  StartOS 0.4.0-beta.9        │
│  make x86 install ──┼────────►│  + LND (dependency)          │
│                     │  HTTP   │  + Mostro (sideloaded)       │
└─────────────────────┘         └──────────────────────────────┘
```

---

## Part 1 — Host prerequisites (dev machine)

Run on your Linux workstation where you build packages.

### 1.1 Install virtualization (KVM + libvirt)

```bash
# Debian/Ubuntu/Pop!_OS
sudo apt update
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients virt-manager virtinst bridge-utils

# Add your user to libvirt group (log out/in after)
sudo usermod -aG libvirt "$USER"
sudo usermod -aG kvm "$USER"
```

Verify KVM:

```bash
egrep -c '(vmx|svm)' /proc/cpuinfo   # should be >= 1
virsh list --all
```

### 1.2 Install package build tools

```bash
# Build essentials + SquashFS
sudo apt install -y build-essential squashfs-tools squashfs-tools-ng curl git

# Node.js 22 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# restart shell, then:
nvm install 22
nvm use 22

# Docker (for pulling container images during pack)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # log out/in

# start-cli
curl -fsSL https://start9.com/start-cli/install.sh | sh
```

Verify:

```bash
docker --version
make --version
node --version
mksquashfs -version
start-cli --version
virsh --version
```

### 1.3 Initialize developer key

```bash
start-cli init-key
start-cli pubkey    # save output if you need registry admin access
```

---

## Part 2 — Download StartOS ISO

### 2.1 Set version variables

```bash
export STARTOS_VERSION="0.4.0-beta.9"
export STARTOS_COMMIT="d1f153d"   # from release page ISO filename
export ISO_NAME="startos-${STARTOS_VERSION}-${STARTOS_COMMIT}_x86_64-nonfree.iso"
export ISO_URL="https://startos-images.nyc3.cdn.digitaloceanspaces.com/v${STARTOS_VERSION}/${ISO_NAME}"
export ISO_DIR="$HOME/startos-vm"
mkdir -p "$ISO_DIR"
cd "$ISO_DIR"
```

> **ISO variants (x86_64):**
> - `*_x86_64-nonfree.iso` — **Standard** (recommended for VM; includes drivers)
> - `*_x86_64.iso` — Slim FOSS-only
> - `*_x86_64-nvidia.iso` — NVIDIA GPU support

### 2.2 Download and verify

```bash
wget -c "$ISO_URL" -O "$ISO_NAME"

# SHA-256 for x86_64-nonfree (beta.9):
echo "e4a885522ce932a205ddbd0398355ed597c231ea6d4a94d50edc506a8678f151  $ISO_NAME" | sha256sum -c -
```

Release page (always has current checksums):  
https://github.com/Start9Labs/start-os/releases/tag/v0.4.0-beta.9

---

## Part 3 — Create the VM

### Option A — virt-manager (GUI, recommended first time)

1. Open **Virtual Machine Manager**
2. **File → New Virtual Machine**
3. Local install media → browse to `$ISO_DIR/$ISO_NAME`
4. RAM: **4096 MB** minimum (8192 MB preferred)
5. CPUs: **2+**
6. Disk: **32 GB** minimum (64 GB recommended — OS + LND + Mostro data)
7. Network: **Virtual network `default`: NAT** (gives VM internet + host access)
8. Name VM: `startos-dev`
9. Before finish: customize → **Boot options** → enable UEFI if offered; set **VirtIO disk** if available
10. Finish and start VM

### Option B — virt-install (CLI)

```bash
sudo virt-install \
  --name startos-dev \
  --memory 8192 \
  --vcpus 4 \
  --disk size=64,format=qcow2,bus=virtio \
  --cdrom "$ISO_DIR/$ISO_NAME" \
  --network network=default,model=virtio \
  --graphics spice \
  --video virtio \
  --boot uefi,menu=on \
  --os-variant debian12 \
  --noautoconsole
```

Open console:

```bash
virt-manager          # connect to startos-dev
# or
virt-viewer startos-dev
```

---

## Part 4 — Install StartOS inside VM

1. Boot from ISO → install wizard appears at **http://start.local**
2. From host browser (VM must be on reachable network):

   ```bash
   # Find VM IP
   virsh net-dhcp-leases default
   # Example output: 192.168.122.173

   # Open in browser (may need IP instead of start.local from host)
   xdg-open "http://192.168.122.173"
   ```

3. **Initial setup** (fresh install):
   - Start fresh
   - Set **master password** (write it down — used for UI, SSH, sideload auth)
   - Set **server name** (e.g. `dev-mostro` → `dev-mostro.local`)

4. **Select drives** in installer:
   - For VM: use the virtual disk; choose **Overwrite** for clean install

5. Complete setup → trust Root CA on your dev machine:
   - Download Root CA from StartOS UI
   - Install per [trust-ca guide](https://docs.start9.com/start-os/trust-ca.html)

6. **Remove install ISO** after reboot (important):

   ```bash
   virsh change-media startos-dev sda --eject --config
   # or detach CD-ROM in virt-manager
   ```

---

## Part 5 — Configure dev machine → VM connection

### 5.1 Get VM IP (save this)

```bash
virsh net-dhcp-leases default | grep startos-dev
# or
virsh domifaddr startos-dev
```

Example: `192.168.122.173`

### 5.2 Configure start-cli host

```bash
mkdir -p ~/.startos
cat > ~/.startos/config.yaml << EOF
host: http://192.168.122.173
EOF
```

Replace IP with your VM's address. Use `http://dev-mostro.local` if mDNS works from host.

### 5.3 Authenticate

```bash
start-cli auth login
# Enter StartOS master password when prompted
```

Test connectivity:

```bash
start-cli package list
```

### 5.4 Optional — SSH to VM

```bash
ssh start9@192.168.122.173
# Password: StartOS master password
# User is start9, NOT root
```

Add SSH key via StartOS UI: **System → SSH → Add Key**

---

## Part 6 — Install LND (Mostro dependency)

Mostro **requires LND** running and synced before it can operate.

### Via StartOS UI

1. Open Marketplace
2. Install **LND** (from Start9 or Community registry)
3. Complete LND setup tasks (wallet create/unlock, etc.)
4. Wait for **sync-progress** health check to succeed

### Verify LND

```bash
start-cli package list
start-cli package logs lnd -f
start-cli package attach lnd    # lncli getinfo
```

---

## Part 7 — Build & sideload Mostro

On your **dev machine** (not inside VM):

```bash
cd /path/to/mostro-startos

# Install JS deps
npm ci

# Type-check (optional)
npm run check

# Build x86_64 package for VM
make clean x86

# Confirm artifact
ls -lh mostro.s9pk
start-cli s9pk inspect manifest mostro.s9pk
```

### Sideload method 1 — CLI (recommended for dev loop)

```bash
make install
# equivalent to:
# start-cli package install -s mostro.s9pk
```

### Sideload method 2 — UI

1. Open StartOS UI → **Sideload** (top nav)
2. Drag `mostro.s9pk` into drop zone
3. Follow install prompts

### After install

1. Complete dashboard **tasks** (Nostr setup, LND settings, etc.)
2. Start service (or it auto-starts if no blocking tasks)
3. Monitor:

```bash
start-cli package logs mostro -f
start-cli package attach mostro
```

---

## Part 8 — Dev iteration loop

```bash
# Edit startos/*.ts
npm run check          # quick type check
make clean x86 install # rebuild + sideload

# If container state is weird:
start-cli package stop mostro
start-cli package rebuild mostro
start-cli package start mostro

# Uninstall for clean retest:
start-cli package uninstall mostro
make install
```

---

## Part 9 — Publish to alpha registry (optional)

```bash
make x86

start-cli --registry=https://alpha-registry-x.start9.com registry package add \
  mostro.s9pk \
  "https://github.com/MostroP2P/mostro-startos/releases/download/vTAG/mostro.s9pk"
```

Requires registry admin signer configured with your `start-cli pubkey`.

---

## Quick reference card

```bash
# ── VM ──
virsh start startos-dev
virsh shutdown startos-dev
virsh net-dhcp-leases default

# ── StartOS host ──
start-cli auth login
start-cli package list
start-cli package logs mostro -f
start-cli package attach mostro
ssh start9@<VM-IP>

# ── Build & sideload ──
cd ~/rust_prj/mostro-startos
make clean x86 install

# ── Config ──
# ~/.startos/config.yaml → host: http://<VM-IP>
# ~/.startos/developer.key.pem → package signing key
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `start-cli auth login` fails | Check IP in config.yaml; VM running; same network |
| Can't open start.local from host | Use VM IP from `virsh net-dhcp-leases default` |
| Sideload upload fails | Re-run `start-cli auth login`; check disk space on VM |
| Mostro won't start | Install LND first; check `start-cli package logs mostro` |
| LND macaroon errors | Complete LND setup; verify `/lnd` mount in attach shell |
| HTTPS cert warnings | Trust Root CA from StartOS UI on dev machine |
| Slow VM | Allocate more RAM (8GB+); enable VirtIO drivers |
| ISO still boots after install | Eject CD-ROM: `virsh change-media startos-dev sda --eject --config` |

See [09-gotchas-and-debugging.md](./09-gotchas-and-debugging.md) for more.

---

## Resource recommendations

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 4 GB | 8 GB |
| vCPUs | 2 | 4 |
| Disk | 32 GB | 64 GB |
| Network | libvirt `default` NAT | bridged (if mDNS needed from LAN) |

LND + Bitcoin sync (if bitcoind required by LND) needs substantial disk and time — for Mostro dev, ensure LND has a synced backend or use neutrino/appropriate LND config per LND package docs.

---

## Related docs

- [07-mostro-package.md](./07-mostro-package.md) — Mostro architecture
- [05-cli-cheatsheet.md](./05-cli-cheatsheet.md) — all start-cli commands
- [03-project-structure-and-workflow.md](./03-project-structure-and-workflow.md) — build workflow
- Full upstream guides: `start-docs/start-os/src/`, `start-docs/packaging/src/`
