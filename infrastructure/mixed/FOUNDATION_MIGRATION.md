# Democracy Mixed Project - Updated to Use Foundation Stack

This project has been updated to reference the `democracy-foundation` stack instead of defining foundation resources (VPCs, firewalls, domains) directly.

## Changes Made

### 1. Foundation Stack References

- Created `src/foundation-stack-refs.ts` to import resources from the foundation stack
- Uses Pulumi StackReference to pull outputs from `democracy-foundation` project

### 2. Updated Imports

- `src/load-balancer.ts`: Now imports VPCs from foundation stack references
- `src/kubernetes-cluster.ts`: Now imports VPCs from foundation stack references
- `src/index.ts`: Removed direct firewall imports, added foundation stack reference dependency

### 3. Configuration Updates

- Added `environment` config to stack configurations
- `Pulumi.dev.yaml`: Points to `dev` foundation stack
- `Pulumi.prod.yaml`: Points to `prod` foundation stack

## Dependencies

This project now depends on the `democracy-foundation` stacks:

- Dev environment: `ManAnRuck/democracy-foundation/dev`
- Prod environment: `ManAnRuck/democracy-foundation/prod`

## Resources Managed

This project now only manages:

- Kubernetes cluster
- Load balancer
- Droplets
- Projects
- **No longer manages**: VPCs, firewalls, domains (these are in foundation project)

## Migration Notes

The foundation resources (VPCs, firewalls, domains) are now managed by the `democracy-foundation` project. This mixed project consumes them via stack references, enabling:

- **Separation of concerns**: Foundation vs platform resources
- **Independent deployments**: Foundation can be updated separately
- **Reduced blast radius**: Changes to platform don't affect foundation
- **Better team collaboration**: Different teams can manage different layers

## Deployment Order

1. Deploy `democracy-foundation` stack first
2. Then deploy this `democracy-deutschland` (mixed) stack

The stack references will automatically pull the required resource IDs from the foundation project.
