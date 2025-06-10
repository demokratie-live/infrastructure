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

This project was completed as part of the comprehensive infrastructure restructuring (Phase 4 Complete). The following components have been migrated from the original `democracy-deutschland` project:

- VPC configurations from `vpcs.ts`
- Firewall rules from `firewalls.ts`
- Domain management from `domains/` (simplified for foundation layer)
- DNS record management with environment-specific configurations

## Project Status

✅ **Phase 4 Complete**: All infrastructure phases have been successfully implemented:

- **Phase 1**: Foundation Setup (VPCs, Domains, Firewalls) ✅
- **Phase 2**: Platform Setup (Kubernetes, Load Balancers) ✅
- **Phase 3**: Application Integration ✅
- **Phase 4**: Advanced Monitoring & Operations ✅

The platform is now production-ready with comprehensive monitoring, testing, and operational capabilities.
