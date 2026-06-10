# StartOS Platform (for package dev)

## Installing services

| Method | Use case |
|--------|----------|
| **Marketplace** | Production installs from registry |
| **Sideload** | Dev testing — drop `.s9pk`, no registry |
| **Update / Downgrade** | Updates tab or Marketplace |

Sideload: UI → **Sideload** in top nav → drag `.s9pk`.

## Service concepts

### Health checks

Defined in `setupMain`. Dashboard states:

| Status | Meaning |
|--------|---------|
| Waiting | Blocked on another check |
| Starting | Grace period |
| Loading | Long-running (e.g. sync %) |
| Success | Ready |
| Error | Failed with message |

### Tasks

Dashboard prompts linking to actions.

| Severity | UI label | Behavior |
|----------|----------|----------|
| `critical` | Required | Blocks start |
| `important` | Important | Runs with warnings |
| `optional` | Recommended | Optional |

### Dependencies

- **Required** — must be installed/running (e.g. Mostro → LND).
- **Optional** — extra features when present.
- Misconfigured deps → tasks pointing to dependency actions.

### Interfaces

Network endpoints (Interfaces tab): UI, API, P2P.

- Enable/disable per gateway (iptables).
- Public vs Private domains.
- SSL: Root CA, Let's Encrypt, None.
- **Inside container = HTTP**; external URLs = HTTPS.

### Flavors

Same package ID, different implementations (e.g. Bitcoin Core vs Knots). Version: `#flavor:upstream:downstream`.

## Registries

| Registry | Notes |
|----------|-------|
| Start9 Registry | Primary, maintained |
| Community Registry | Technical criteria only |
| Custom / Alpha | `https://alpha-registry-x.start9.com` for Mostro testing |

Add custom registries: Marketplace sidebar → Switch registry.

## Accessing service containers

**Supported:** `start-cli package attach <PACKAGE> [SUBCONTAINER]`

**Not supported:** Docker/Podman on host.

Advanced (rare): `start-cli package stats mostro` → `lxc-attach <ID>` (bypasses managed layer).

## Trust & HTTPS

After setup, trust Root CA on dev machine: `start-docs/start-os/src/trust-ca.md`

Firefox: `security.enterprise_roots.enable` = `true` in `about:config`.

## Updating StartOS

- No automatic OS updates.
- System → General → Software Update.
- 0.4.0 beta: follow [update guide](https://docs.start9.com/start-os/update-040.html) exactly.

## Networking quick refs

- LAN: `http://server-name.local`
- mDNS: derived from server name
- Inter-service DNS: `<package-id>.startos` (e.g. `lnd.startos`)
- Remote: SSH tunnel, VPN, StartTunnel

See `start-docs/start-os/src/` for LAN, Tor, clearnet, gateways, DNS.
