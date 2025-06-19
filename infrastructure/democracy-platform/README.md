# Democracy Platform Infrastructure

This project contains the **platform infrastructure components** for Democracy Deutschland e.V.

> 📋 **Architektur-Übersicht**: Siehe [`ARCHITECTURE.md`](../ARCHITECTURE.md) für die komplette vier-schichtige Architektur-Dokumentation

## Overview

**Democracy-Platform** ist die **Platform-Ebene** (Schicht 3 von 4) der Infrastructure-Architektur:

```
Applications        ← Anwendungsebene
     ↓ verwendet
democracy-platform  ← 🎯 DIESE SCHICHT (Platform-Ebene)
     ↓ verwendet
democracy-foundation ← Foundation-Ebene
     ↓ verwendet
infrastructure-base ← Basis-Ebene
```

**Zweck**: Kubernetes-Cluster und Platform-Services für Anwendungen.

## Components

### Kubernetes Cluster

- **Main cluster**: Production-ready Kubernetes cluster on DigitalOcean
- **Node configuration**: Auto-scaling worker nodes
- **Network**: Connected to foundation VPCs

### Load Balancer

- **External load balancer**: DigitalOcean Load Balancer for external traffic
- **Health checks**: Configured health monitoring
- **SSL termination**: Automatic SSL certificate management

### Projects

- **team-democracy**: DigitalOcean project organization
- **Resource grouping**: All platform resources organized under main project

## Stacks

- **production**: Production environment
- **dev**: Development environment for testing and development

## Cross-Stack Dependencies

This project depends on the **democracy-foundation** stack for:

### Foundation Resources

- VPC networks (`vpcOutputs.defaultFra1VpcId`)
- Firewall rules (`firewallOutputs.k8sPublicAccessFirewallId`)
- Domain foundations

## Cross-Stack Exports

This project exports the following for use by application stacks:

### Kubernetes Outputs

- `cluster`: Kubernetes cluster resource
- `kubeconfig`: Cluster access configuration
- `endpoint`: Cluster API endpoint
- `clusterId`: Cluster identifier

### Load Balancer Outputs

- `loadBalancer`: Load balancer resource
- `loadBalancerId`: Load balancer identifier
- `loadBalancerIp`: External IP address

## Usage

```bash
# Install dependencies
pnpm install

# Select stack (production or dev)
pulumi stack select production  # or dev

# Preview changes (requires foundation stack to be deployed first)
pulumi preview

# Deploy (foundation stack must exist)
pulumi up
```

## Environment-Specific Configuration

### Production Stack

- **Cluster Name**: `democracy`
- **Node Pool**: `s-4vcpu-8gb` (5 nodes)
- **Project**: `Team DEMOCRACY`
- **Protection**: Resources are protected from deletion
- **Tags**: `kubernetes-test`

### Development Stack

- **Cluster Name**: `democracy-dev`
- **Node Pool**: `s-2vcpu-4gb` (2 nodes)
- **Project**: `Team DEMOCRACY Dev`
- **Protection**: Resources can be deleted for testing
- **Tags**: `kubernetes-test-dev`

## Dependencies

**⚠️ Important:** This stack must be deployed after `democracy-foundation`:

1. First: `cd ../democracy-foundation && pulumi up`
2. Then (for production): `cd ../democracy-platform && pulumi stack select production && pulumi up`
3. Or (for development): `cd ../democracy-platform && pulumi stack select dev && pulumi up`

## Migration Notes

This project was completed as part of Phase 4 of the infrastructure restructuring. All platform resources have been migrated and are production-ready.

## Health Monitoring

The platform includes built-in health monitoring accessible via:

```bash
# Check platform health
pulumi stack output stackHealth

# Comprehensive health check
pnpm test
```
