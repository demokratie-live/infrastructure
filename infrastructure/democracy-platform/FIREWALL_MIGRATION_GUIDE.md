# Firewall Migration Guide

## Overview

This guide documents the migration of firewall rules from `infrastructure-base` to `democracy-platform` stacks.

## Migration Summary

### Before Migration

- Firewalls were managed centrally in `infrastructure-base`
- Single configuration for all environments
- Shared via Pulumi stack references

### After Migration

- Firewalls are now managed per environment in `democracy-platform`
- Stack-specific configurations via Pulumi config
- Better isolation between environments

## Migrated Resources

### Production Environment

The following existing firewalls were imported into the production stack:

1. **k8s-public-access-47f41c0b-f8b6-4c32-9364-c6f6beed456e**

   - Import ID: `79db9db7-6f38-4cf5-bb61-fd9f6eabac1f`
   - Protection: Enabled
   - Tags: `k8s:47f41c0b-f8b6-4c32-9364-c6f6beed456e`

2. **k8s-47f41c0b-f8b6-4c32-9364-c6f6beed456e-worker**
   - Import ID: `3f0125df-c4b9-451a-9acf-9605963c953e`
   - Protection: Enabled
   - Tags: `k8s:47f41c0b-f8b6-4c32-9364-c6f6beed456e`

### Development Environment

New firewalls will be created with development-specific configurations:

1. **k8s-public-access-dev**

   - Tags: `k8s:dev`
   - Protection: Disabled (for easier testing)

2. **k8s-dev-worker**
   - Tags: `k8s:dev`
   - Protection: Disabled (for easier testing)

## Configuration

### Production (Pulumi.prod.yaml)

```yaml
democracy-platform:firewallK8sPublicAccessImportId: 79db9db7-6f38-4cf5-bb61-fd9f6eabac1f
democracy-platform:firewallK8sWorkerImportId: 3f0125df-c4b9-451a-9acf-9605963c953e
```

### Development (Pulumi.dev.yaml)

```yaml
democracy-platform:firewallK8sPublicAccessName: k8s-public-access-dev
democracy-platform:firewallK8sPublicAccessTag: k8s:dev
democracy-platform:firewallK8sWorkerName: k8s-dev-worker
democracy-platform:firewallK8sWorkerTag: k8s:dev
```

## Migration Steps Completed

1. **✅ Import Production Firewalls**

   - Imported k8s-public-access firewall (ID: 79db9db7-6f38-4cf5-bb61-fd9f6eabac1f)
   - Imported k8s-worker firewall (ID: 3f0125df-c4b9-451a-9acf-9605963c953e)

2. **✅ Remove from infrastructure-base**

   - Unprotected firewalls in infrastructure-base stack
   - Removed firewalls from infrastructure-base stack state
   - Updated infrastructure-base outputs to only include domains

3. **✅ Verify Configuration**
   - Production stack: No changes (import successful)
   - Development stack: Will create new dedicated firewalls

## Benefits

1. **Environment Isolation**: Each environment has its own firewall rules
2. **Independent Configuration**: Different rules for dev/staging/prod
3. **Simplified Debugging**: Easier to test firewall changes in development
4. **Better Security**: Production firewalls are protected and isolated

## Dependencies

After migration, any projects that previously referenced firewall outputs from `infrastructure-base` should now reference them from the appropriate `democracy-platform` stack:

```typescript
// Before
const infraStackRef = new pulumi.StackReference("infrastructure-base-prod");
const firewallId =
  infraStackRef.getOutput("firewallOutputs").k8sPublicAccessFirewallId;

// After
const platformStackRef = new pulumi.StackReference("democracy-platform-prod");
const firewallId =
  platformStackRef.getOutput("firewallOutputs").k8sPublicAccessFirewallId;
```

## Notes

- ✅ Production firewalls maintain their existing IDs and configurations
- ✅ Development environment gets new, dedicated firewall resources
- ✅ The migration preserves all existing security rules and configurations
- ✅ `infrastructure-base` now only manages domains (which should remain centralized)
- ✅ Migration completed successfully without affecting production resources
