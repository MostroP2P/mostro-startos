# Mostro Instructions

Mostro is a peer-to-peer Bitcoin exchange platform built on top of the Lightning Network and Nostr protocol. This guide covers how to configure and use Mostro on StartOS.

## Overview

Mostro enables users to buy and sell Bitcoin without KYC requirements while maintaining privacy and censorship resistance. It operates as a decentralized escrow service using:

- **Lightning Network** for fast, low-cost Bitcoin transactions
- **Nostr protocol** for decentralized communication
- **Hold invoices** for secure escrow functionality
- **Reputation systems** for trustless trading

## Quick Start

1. **Install Dependencies**: Ensure you have LND installed and synced
2. **Configure Settings**: Use the "Configure Mostro Settings" action
3. **Set up Lightning**: Connect to your Lightning node
4. **Configure Nostr**: Set your private key and relays
5. **Start Trading**: Access the RPC interface if enabled

## Configuration

### Lightning Node Setup

Mostro requires a Lightning node to function. Configure your Lightning connection in the settings:

- **LND Certificate Path**: Location of your LND TLS certificate
- **LND Macaroon Path**: Location of your LND admin macaroon  
- **LND gRPC Host**: Your LND node's gRPC endpoint
- **Invoice Settings**: Configure timeouts and retry attempts

**Default paths** (if using StartOS LND):
```
Certificate: /mnt/lnd/tls.cert
Macaroon: /mnt/lnd/data/chain/bitcoin/mainnet/admin.macaroon
Host: https://lnd.embassy:10009
```

### Nostr Configuration

Mostro uses Nostr for decentralized messaging:

- **Private Key**: Your Nostr private key (nsec format)
- **Relays**: Comma-separated list of Nostr relay URLs

**Security Note**: Keep your Nostr private key secure. This key identifies your Mostro node on the network.

### Trading Parameters

Configure your Mostro trading parameters:

- **Fee Structure**: Set your trading fees (0-100%)
- **Order Limits**: Set minimum/maximum order amounts
- **Expiration Times**: Configure order and payment timeouts
- **Routing Fees**: Set maximum Lightning routing fees

### Database & RPC

- **Database**: Uses SQLite by default (`sqlite://mostro.db`)
- **RPC Interface**: Enable for programmatic access (optional)
- **Proof of Work**: Configure anti-spam difficulty

## Interfaces

### RPC Interface

When enabled, the RPC interface allows programmatic interaction with your Mostro node:

- **Port**: 50051 (configurable)
- **Protocol**: gRPC
- **Access**: Local network only by default

Use this interface for:
- Automated trading bots
- Custom integrations
- Administrative tasks

## Properties

Monitor your Mostro node status through the StartOS properties panel:

- **Lightning Connection**: Shows LND connectivity status
- **Nostr Relays**: Displays connected relay information
- **Active Orders**: Current trading activity
- **Node Reputation**: Your reputation score on the network

## Health Checks

StartOS automatically monitors:

- **Lightning Node Sync**: Ensures LND is synced and reachable
- **Database Connectivity**: Verifies SQLite database access
- **Nostr Relay Connections**: Checks relay connectivity
- **Process Status**: Monitors the Mostro daemon

## Backups

### What Gets Backed Up

StartOS automatically backs up:
- Configuration settings
- Database (order history, reputation data)
- Lightning certificates and macaroons
- Nostr keys and relay configurations

### Restore Process

During restore:
1. Configuration is restored from backup
2. Database is restored with historical data
3. Lightning connection is re-established
4. Nostr relays are reconnected

**Important**: After restore, verify your Lightning node connection and Nostr relay connectivity.

## Troubleshooting

### Common Issues

**Lightning Connection Failed**
- Verify LND is running and synced
- Check certificate and macaroon paths
- Ensure gRPC host is correct

**Nostr Relay Errors**
- Test relay connectivity manually
- Try different relay servers
- Check firewall settings

**Database Errors**
- Restart the Mostro service
- Check disk space availability
- Review service logs

**Orders Not Appearing**
- Verify Nostr relay connections
- Check proof-of-work settings
- Ensure sufficient Lightning capacity

### Log Analysis

Access Mostro logs through StartOS:
1. Navigate to Services → Mostro
2. Click "Logs" to view recent activity
3. Look for error messages or warnings
4. Check Lightning and Nostr connectivity

## Security Considerations

### Private Key Management
- **Backup**: Securely backup your Nostr private key
- **Access**: Never share your private key
- **Rotation**: Consider key rotation for long-term security

### Lightning Security
- **Channel Management**: Maintain adequate Lightning liquidity
- **Fee Limits**: Set reasonable routing fee limits
- **Monitoring**: Monitor for unusual activity

### Network Security
- **Relay Selection**: Choose trusted Nostr relays
- **TLS**: Ensure all connections use encryption
- **Updates**: Keep Mostro and dependencies updated

## Advanced Configuration

### Custom Relay Setup

For enhanced privacy, consider running your own Nostr relay:
1. Set up a private Nostr relay
2. Configure Mostro to use your relay
3. Optionally bridge to public relays

### Lightning Liquidity Management

Optimize your Lightning setup:
- **Inbound Liquidity**: Ensure sufficient incoming capacity
- **Outbound Liquidity**: Maintain outgoing payment ability
- **Channel Management**: Balance channel distributions

### API Integration

Use the RPC interface for custom integrations:
- Connect trading bots
- Integrate with other services
- Build custom monitoring tools

## External Resources

### Official Documentation
- [Mostro GitHub Repository](https://github.com/MostroP2P/mostro)
- [Mostro Website](https://mostro.network/)
- [Telegram Support](https://t.me/MostroP2P)

### Lightning Network Resources
- [Lightning Network Documentation](https://lightning.network/)
- [LND Documentation](https://docs.lightning.engineering/)
- [Lightning Pool](https://lightning.engineering/pool/)

### Nostr Protocol Resources
- [Nostr Protocol Specification](https://github.com/nostr-protocol/nips)
- [Nostr Relays](https://nostr.watch/)
- [Nostr Clients](https://github.com/aljazceru/awesome-nostr)

### Trading and P2P Resources
- [Bitcoin P2P Trading Guide](https://bitcoiner.guide/hodl/)
- [Lightning Network Trading](https://lightning.engineering/posts/2020-10-09-pool-deep-dive/)

## Support

For technical support:

1. **StartOS Issues**: Use the StartOS community forums
2. **Mostro Issues**: Visit the [GitHub repository](https://github.com/MostroP2P/mostro) 
3. **General Help**: Join the [Telegram group](https://t.me/MostroP2P)
4. **Security Issues**: Report privately to the Mostro team

## Contributing

Help improve Mostro:
- Report bugs on GitHub
- Contribute code improvements
- Share trading experiences
- Help with documentation

---

**Disclaimer**: Peer-to-peer trading involves risks. Understand local regulations and trade responsibly. Mostro is experimental software - use at your own risk.
