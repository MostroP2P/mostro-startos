<p align="center">
  <img src="icon.svg" alt="Mostro Logo" width="21%">
</p>

# Mostro for StartOS

A StartOS service package for [Mostro](https://mostro.network/), a peer-to-peer Lightning Network Bitcoin exchange platform built on Nostr.

## About Mostro

Mostro is a revolutionary peer-to-peer Bitcoin exchange platform that enables users to buy and sell Bitcoin without KYC requirements or compromising personal data. Operating as a decentralized escrow service, Mostro facilitates secure Bitcoin transactions while maintaining censorship resistance and eliminating single points of failure.

### Key Features

- **NO-KYC Bitcoin Exchange**: Trade Bitcoin without identity verification
- **Lightning Network Integration**: Fast, low-cost transactions
- **Nostr Protocol**: Decentralized communication and reputation system
- **Escrow Service**: Secure transactions with minimal custody time
- **Censorship Resistant**: Multiple nodes compete through reputation-based systems

## Environment Setup

Follow the [StartOS Environment Setup Guide](https://staging.docs.start9.com/packaging-guide/environment-setup.html) to prepare your development environment.

## Development

### Prerequisites

- Node.js and npm
- TypeScript
- StartOS SDK

### Creating the S9PK Package

```bash
# Build the complete s9pk package
make

# Or build with dependency checks
make all

# Clean build artifacts
make clean

# Install the package to your StartOS server
make install
```

**Note**: The `make install` command requires you to have `~/.startos/config.yaml` configured with your server details.

### Dependencies

This service has an optional dependency on LND (Lightning Network Daemon) for Lightning Network functionality:

- **LND**: Lightning node for Bitcoin Lightning Network transactions

## Service Configuration

The service is configured through the `startos/manifest.ts` file and uses the following settings:

- **Service ID**: `mostro`
- **Upstream Repository**: <https://github.com/MostroP2P/mostro>
- **Support**: <https://t.me/MostroP2P>
- **Documentation**: <https://mostro.network/protocol/>

## Updating Dependencies

To update dependencies to their latest versions:

```bash
npm update
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Telegram**: <https://t.me/MostroP2P>
- **Website**: <https://mostro.network/>
- **Documentation**: <https://mostro.network/protocol/>
