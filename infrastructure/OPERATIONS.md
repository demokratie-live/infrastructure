# Democracy Infrastructure Operations Guide

## 🏗️ Project Structure

The infrastructure is organized into three specialized projects:

- **democracy-foundation**: Base infrastructure (VPCs, firewalls, domains)
- **democracy-platform**: Platform services (Kubernetes, load balancers)
- **shared**: Common configurations and utilities

## 🚀 Common Operations

### Prerequisites

```bash
# Install dependencies
pnpm install

# Ensure you have Pulumi CLI installed
pulumi version

# Ensure you have DigitalOcean API token configured
doctl auth list
```

### Direct TypeScript Execution

All projects use `tsx` for direct TypeScript execution without requiring build steps:

```bash
# Run validation tests
pnpm validate:all

# Test foundation stack (using tsx directly)
pnpm test:foundation

# Test platform stack (using tsx directly)
pnpm test:platform

# Test all infrastructure
pnpm test:all

# Advanced validation modes
pnpm validate:mock        # Mock validation (CI/CD safe)
pnpm validate:live        # Live stack validation
pnpm validate:deployment  # Post-deployment validation
```

### Health Monitoring

```bash
# Run comprehensive health check
tsx scripts/deployment-health-check.ts

# Check specific components
tsx scripts/deployment-health-check.ts kubernetes-only
tsx scripts/deployment-health-check.ts dns-only
tsx scripts/deployment-health-check.ts full

# Quick status overview
pnpm status

# Save status report
pnpm status:save
```

### CI/CD Integration

```bash
# Fast CI pipeline (for development)
pnpm ci:fast

# Full CI pipeline (for production)
pnpm ci:full

# CI-friendly commands (return appropriate exit codes)
tsx scripts/ci-cd-helper.ts --save
```

### Resource Management

```bash
# Scan for cleanup candidates
pnpm cleanup:scan

# Generate cleanup report
pnpm cleanup:report

# Cost analysis
tsx scripts/cost-analyzer.ts
```

### Stack Management

```bash
# Preview changes for foundation
pnpm foundation:preview

# Deploy foundation changes
pnpm foundation:up

# Preview changes for platform
pnpm platform:preview

# Deploy platform changes
pnpm platform:up
```

### Stack Dependencies

**Deployment Order (Important!):**

1. foundation (base infrastructure)
2. platform (depends on foundation)

### Cross-Stack References

The projects use stack references to share resources:

```typescript
// In platform project
import { createFoundationReference } from "../shared/src/stack-refs";

const foundation = createFoundationReference("production");
const vpcId = foundation.getOutput("vpcId");
```

## 📊 Monitoring

### Stack Health

Each project exports stack health information:

```bash
# Check foundation stack health
cd democracy-foundation && pulumi stack output stackHealth

# Check platform stack health
cd democracy-platform && pulumi stack output stackHealth
```

### Key Metrics

- Resource count per stack
- Last deployment timestamp
- Stack version
- Cross-stack reference health

## 🔧 Configuration Management

### Environment Variables

Set these in your Pulumi config:

```bash
# Foundation project
cd democracy-foundation
pulumi config set environment production
pulumi config set region fra1
pulumi config set team democracy

# Platform project
cd democracy-platform
pulumi config set environment production
pulumi config set projectName "Team DEMOCRACY"
```

### Shared Configuration

Use the shared configuration utilities:

```typescript
import { getBaseConfig, createResourceTags } from "../shared/src/config";

const config = getBaseConfig();
const tags = createResourceTags("kubernetes-cluster", { role: "platform" });
```

## 🛡️ Security Best Practices

### Resource Protection

Critical resources are protected from accidental deletion:

```typescript
const cluster = new digitalocean.KubernetesCluster(
  "cluster",
  {
    // ... config
  },
  {
    protect: true, // Prevents accidental deletion
  }
);
```

### Access Control

- **Foundation**: Infrastructure team only
- **Platform**: Platform team + Senior developers
- **Applications**: Application teams + Platform team

## 🔄 Deployment Workflow

### Standard Deployment

1. **Plan**: Always preview changes first

   ```bash
   pnpm foundation:preview
   ```

2. **Review**: Check the preview output carefully

3. **Deploy**: Apply changes

   ```bash
   pnpm foundation:up
   ```

4. **Verify**: Check stack outputs and health
   ```bash
   pulumi stack output
   ```

### Emergency Procedures

#### Rollback

```bash
# Check deployment history
pulumi history

# Rollback to previous version
pulumi stack select production
pulumi refresh  # Sync state with actual resources
# Manual verification and correction as needed
```

#### Stack Reference Issues

If cross-stack references fail:

1. Verify target stack exists and has required outputs
2. Check stack reference name format
3. Ensure proper access permissions

```bash
# Debug stack reference
pulumi stack output --show-secrets  # In target stack
```

## 📈 Cost Management

### Resource Tagging

All resources are tagged for cost allocation:

```typescript
const tags = createResourceTags("kubernetes-cluster", {
  environment: "production",
  team: "democracy",
  cost-center: "platform"
});
```

### Cost Monitoring

- Monitor costs per project using DigitalOcean project boundaries
- Track costs per environment using stack-level tagging
- Set up cost alerts per project

## 🧪 Testing

### Infrastructure Tests

Run infrastructure tests:

```typescript
import { InfrastructureTester, commonTests } from "../shared/src/testing";

const tester = new InfrastructureTester();
tester.addTest(
  commonTests.stackReference(foundationRef, ["vpcId", "loadBalancerId"])
);

const results = await tester.runTests();
console.log(`Tests: ${results.passed} passed, ${results.failed} failed`);
```

### Health Checks

```bash
# Verify all stack references work
cd democracy-platform
pulumi preview  # Should not fail on stack reference

# Verify resource accessibility
doctl compute droplet list
doctl kubernetes cluster list
```

## 🚨 Troubleshooting

### Common Issues

1. **Stack Reference Not Found**

   - Verify target stack name and organization
   - Check if target stack has been deployed

2. **Resource Import Errors**

   - Check resource protection settings
   - Verify DigitalOcean API permissions

3. **Cross-Stack Dependency Cycles**
   - Review dependency graph
   - Ensure proper layering (foundation → platform → apps)

### Support Contacts

- **Infrastructure Team**: [contact@democracy-deutschland.de]
- **Platform Team**: [contact@democracy-deutschland.de]
- **Emergency**: [contact@democracy-deutschland.de]

### Useful Commands

```bash
# Check all stack states
pulumi stack ls --all

# Refresh state with actual resources
pulumi refresh

# Export stack state for backup
pulumi stack export > backup-$(date +%Y%m%d).json

# Check resource dependencies
pulumi preview --diff
```
