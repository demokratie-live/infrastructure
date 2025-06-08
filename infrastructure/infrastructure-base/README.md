# Infrastructure Base

This project manages the shared infrastructure resources for the democracy platform that are used across multiple environments and projects.

## 🏗️ **Architecture Overview**

This project follows the **Base Infrastructure Pattern** to avoid resource ownership conflicts in Pulumi:

```
infrastructure-base/        # This project - shared resources
├── domains.ts              # democracy-app.de, bundestag.io, democracy-deutschland.de
├── vpcs.ts                 # VPCs (default-fra1, website, kubernetes-test)
└── firewalls.ts            # Firewalls (k8s-public-access, k8s-worker)

democracy-foundation/       # Environment-specific project
├── DNS records             # Only DNS records (prod, internal, alpha)
├── Load balancers          # Platform-specific resources
└── Stack references        # References to this base project
```

## 🎯 **Managed Resources**

### Domains

- `democracy-app.de`
- `bundestag.io`
- `democracy-deutschland.de`

### VPCs

- `default-fra1` (10.135.0.0/16)
- `website` (10.114.16.0/20)
- `kubernetes-test` (10.114.0.0/20)

### Firewalls

- `k8s-public-access` (Kubernetes public access rules)
- `k8s-worker` (Kubernetes worker node rules)

## 📋 **Usage**

### Deploy Base Infrastructure

```bash
# Switch to production stack
pulumi stack select prod

# Preview changes
pulumi preview

# Deploy shared resources
pulumi up
```

### Reference from Other Projects

```typescript
// In democracy-foundation project
import * as pulumi from "@pulumi/pulumi";

const infraStack = new pulumi.StackReference(
  "ManAnRuck/infrastructure-base/prod"
);
const domains = infraStack.getOutput("domainOutputs");
const vpcs = infraStack.getOutput("vpcOutputs");
```

## 🔒 **Resource Protection**

All resources in this project are marked with `protect: true` to prevent accidental deletion.

## 🚀 **Benefits**

- ✅ **No Resource Conflicts**: Each resource has a single owner
- ✅ **Safe Environment Destruction**: Destroying `internal` or `alpha` stacks doesn't affect shared resources
- ✅ **Clear Separation**: Infrastructure vs. application resources
- ✅ **Reusability**: Shared resources used by multiple projects

## 📝 **Migration Notes**

This project was created to resolve resource ownership conflicts where multiple stacks tried to import the same resources. The original single-project structure has been split into:

1. **infrastructure-base** (this project): Shared infrastructure
2. **democracy-foundation**: Environment-specific resources with stack references
