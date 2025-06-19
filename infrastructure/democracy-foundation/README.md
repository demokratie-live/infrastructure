# Democracy Foundation Infrastructure

This project manages the foundation infrastructure for Democracy Deutschland e.V., including DNS records for domains managed across different environments.

## Architecture

The Democracy Foundation project creates environment-specific DNS records that reference domains managed in the `infrastructure-base` project. It uses Pulumi stack references to get domain information and creates only the necessary DNS records for each environment.

## Available Stacks

### Production Stack (`prod`)

Manages production DNS records without prefixes:

- `@` (root domain) → 174.138.102.21
- `api` → 174.138.102.21
- `website` → 161.35.206.64
- `listmonk` → 174.138.102.21

### Internal Stack (`internal`)

Manages internal DNS records with "internal" prefix:

- `internal` → 174.138.102.21
- `internal.api` → 174.138.102.21
- `internal.qr` → 174.138.102.21

## DNS Records Analysis

Based on the current DNS configuration for democracy-app.de:

```bash
doctl compute domain records list democracy-app.de --output json
```

**Production Records (Root Domain)**:

- Root domain (`@`) points to main load balancer
- API endpoint for production traffic
- Website points to separate server
- Listmonk for newsletter management

**Internal Records (Internal Prefix)**:

- Internal environment for testing
- Internal API for development/staging
- Internal QR code service

## Stack Management

Use standard Pulumi commands for stack operations:

```bash
# Deploy production stack
pulumi stack select prod
pulumi up

# Deploy internal stack
pulumi stack select internal
pulumi up

# Preview changes before deployment
pulumi stack select prod
pulumi preview

pulumi stack select internal
pulumi preview

# Check stack status
pulumi stack ls
pulumi stack

# Initialize new stacks if needed
pulumi stack init prod
pulumi stack init internal
```

## Configuration

Stack-specific configurations are managed in:

- `Pulumi.prod.yaml` - Production environment DNS records
- `Pulumi.internal.yaml` - Internal environment DNS records

Each configuration includes:

- DNS record definitions with import IDs
- Environment-specific values
- TTL settings
- **Dynamic Load Balancer IP**: Use `"LOAD_BALANCER_IP"` as value to automatically reference the platform load balancer IP

### Dynamic IP Configuration

DNS records can use `"LOAD_BALANCER_IP"` as the value to automatically reference the load balancer IP from the democracy-platform stack:

```yaml
- name: "@"
  type: "A"
  value: "LOAD_BALANCER_IP" # Dynamically resolved to platform load balancer IP
  ttl: 3601
  importId: "55307990"
```

This ensures DNS records automatically update when the load balancer IP changes, eliminating hardcoded IP addresses.

## Development

### Prerequisites

- Node.js and pnpm
- Pulumi CLI
- DigitalOcean API token

### Setup

```bash
pnpm install
export DIGITALOCEAN_TOKEN="your-token-here"
```

### Testing Changes

```bash
# Preview changes without applying
pulumi preview

# Apply changes
pulumi up
```

## Stack Dependencies

This project depends on:

- `infrastructure-base/prod` - For domain references
- `democracy-platform/{stack}` - For load balancer IPs (when used)

## Import Strategy

DNS records are imported using DigitalOcean record IDs to avoid conflicts:

- Records are imported with format: `democracy-app.de,{record-id}`
- Import IDs are documented in stack configurations
- Existing records are preserved during stack creation

## Monitoring

Monitor DNS record changes through:

- Pulumi state tracking
- DigitalOcean control panel
- DNS propagation checks

## Security

- Sensitive tokens are encrypted in Pulumi configuration
- Access controlled through DigitalOcean API permissions
- Stack-specific isolation prevents accidental changes

## Stack Overview

- **`prod`** - Production DNS records (root domain)
- **`internal`** - Internal DNS records (internal.\* subdomains)
