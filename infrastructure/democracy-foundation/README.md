# Democracy Foundation Infrastructure

This project manages DNS records for all Democracy-related domains using Pulumi and DigitalOcean.

## Features

- **Stack-agnostic DNS management**: All DNS record configurations are stored in Pulumi stack YAML files
- **Dynamic load balancer resolution**: Automatically resolves `LOAD_BALANCER_IP` from the platform stack
- **Multi-domain support**: Manages `democracy-app.de`, `bundestag.io`, and `democracy-deutschland.de`
- **Environment-specific records**: Different DNS records per environment (prod, internal, alpha)

## Configuration

DNS records are configured entirely in Pulumi stack YAML files (`Pulumi.{stack}.yaml`). No hardcoded configurations exist in the TypeScript code.

### Stack Configuration Format

```yaml
config:
  democracy-foundation:environment:
    value: prod
  democracy-foundation:dnsRecords:
    value:
      - domain: "democracy-app.de"
        name: "@"
        type: "A"
        value: "LOAD_BALANCER_IP" # Resolves dynamically
        ttl: 3601
        importId: "55307990" # For importing existing records
      - domain: "bundestag.io"
        name: "api"
        type: "A"
        value: "192.168.1.100" # Static IP
        ttl: 3600
        importId: "57525525"
```

### Special Values

- `LOAD_BALANCER_IP`: Automatically resolved from the democracy-platform stack's load balancer output

## Stack Management

Use standard Pulumi commands for stack operations:

````bash
# Deploy production stack (all domains)
pulumi stack select prod
pulumi up

## Usage

### Deploy DNS Records

```bash
# Production environment
pulumi up -s prod

# Internal environment
pulumi up -s internal

# Alpha environment
pulumi up -s alpha
````

### Import Existing DNS Records

If you have existing DNS records that need to be imported:

```bash
# Example: Import a DNS record
pulumi import digitalocean:DnsRecord democracy-app-de-root-a democracy-app.de,55307990
```

The `importId` values in the configuration correspond to the DigitalOcean DNS record IDs.

## Architecture

- **`src/index.ts`**: Main entry point, creates stack reference and initiates DNS record creation
- **`src/dns-records-all-domains.ts`**: Generic DNS record creation logic that reads from Pulumi config
- **`Pulumi.{stack}.yaml`**: Stack-specific DNS record configurations

## Environment-Specific Records

Each environment manages different DNS records:

### Production (`prod`)

- Complete set of production DNS records
- Points to production load balancer
- Includes website, API, admin, and special purpose subdomains

### Internal (`internal`)

- Internal testing and staging records
- Separate load balancer for internal services
- Isolated from production traffic

### Alpha (`alpha`)

- Alpha testing environment
- Experimental features and early testing
- Separate infrastructure stack

## Maintenance

### Adding New DNS Records

1. Edit the appropriate `Pulumi.{stack}.yaml` file
2. Add the new DNS record to the `dnsRecords` array
3. Run `pulumi up` to create the record

### Updating Existing Records

1. Modify the record in the stack YAML file
2. Run `pulumi up` to apply changes

### Removing DNS Records

1. Remove the record from the stack YAML file
2. Run `pulumi up` to delete the record

## Troubleshooting

### Preview Changes

```bash
pulumi preview -s <stack-name>
```

### Check Configuration

```bash
pulumi config -s <stack-name>
```

### Validate Stack

```bash
pulumi stack select <stack-name>
pulumi refresh
```

That's all there is to it! The new system provides a clean, maintainable approach to DNS management with full separation between infrastructure logic and stack-specific configuration.

# Preview changes without applying

pulumi preview

# Apply changes

pulumi up

```

## Stack Dependencies

This project depends on:
- `infrastructure-base/prod` - For domain references
- `democracy-platform/{stack}` - For load balancer IPs

## Import Strategy

DNS records are imported using DigitalOcean record IDs to avoid conflicts:
- Records are imported with format: `{domain},{record-id}`
- Import IDs are documented in the centralized configuration
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

- **`prod`** - Production DNS records (all domains)
- **`internal`** - Internal DNS records (selected domains)
- **`alpha`** - Alpha DNS records (bundestag.io only)
```
