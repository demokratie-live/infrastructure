# Democracy Foundation Infrastructure

This project contains the foundation infrastructure components for Democracy Deutschland e.V.

## Overview

This is the first phase of the infrastructure restructuring, implementing **Phase 1: Foundation Setup**.

## Components

### VPCs (Virtual Private Clouds)

- **default-fra1**: Main VPC for FRA1 region (10.135.0.0/16)
- **website**: Website VPC for FRA1 region (10.114.16.0/20)
- **kubernetes-test**: Testing VPC for Kubernetes (10.114.0.0/20)

### Firewalls

- **k8s-public-access**: Kubernetes public access firewall
- **k8s-worker**: Kubernetes worker nodes firewall

### Domains

- **bundestag.io**: Domain management (DNS records handled in platform project)
- **democracy-deutschland.de**: Main domain with basic DNS records
- **democracy-app.de**: Application domain (DNS records handled in platform project)

## Stacks

- **dev**: Development environment
- **staging**: Staging environment
- **prod**: Production environment

## Cross-Stack Exports

This project exports the following for use by other projects:

### VPC Outputs

- `vpcOutputs.defaultFra1VpcId`
- `vpcOutputs.websiteVpcId`
- `vpcOutputs.kubernetesTestVpcId`

### Firewall Outputs

- `firewallOutputs.k8sPublicAccessFirewallId`
- `firewallOutputs.k8sWorkerFirewallId`

### Domain Outputs

- `bundestagIoOutputs.domainName`
- `democracyDeutschlandDeOutputs.domainName`
- `democracyAppDeOutputs.domainName`

## Usage

```bash
# Install dependencies
pnpm install

# Select stack
pulumi stack select dev|staging|prod

# Preview changes
pulumi preview

# Deploy
pulumi up
```

## Migration Notes

This project was created as part of Phase 1 of the Pulumi restructuring. The following components have been migrated from the original `democracy-deutschland` project:

- VPC configurations from `vpcs.ts`
- Firewall rules from `firewalls.ts`
- Domain management from `domains/` (simplified for foundation layer)

## Next Steps

Phase 2 will involve creating the `democracy-platform` project and migrating:

- Kubernetes cluster
- Load balancers
- Application-specific DNS records
