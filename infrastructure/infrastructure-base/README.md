# Infrastructure Base

This project manages the **shared base infrastructure resources** for the democracy platform that are used across multiple environments and projects.

> 📋 **Architektur-Übersicht**: Siehe [`ARCHITECTURE.md`](../ARCHITECTURE.md) für die komplette vier-schichtige Architektur-Dokumentation

## 🏗️ **Rolle in der Architektur**

**Infrastructure-Base** ist die **Basis-Ebene** (Schicht 1 von 4):

```
Applications        ← Anwendungsebene
     ↓ verwendet
democracy-platform  ← Platform-Ebene
     ↓ verwendet
democracy-foundation ← Foundation-Ebene
     ↓ verwendet
infrastructure-base ← 🎯 DIESE SCHICHT (Basis-Ebene)
```

**Zweck**: Bereitstellung unveränderlicher, geteilter Basis-Ressourcen für alle Umgebungen.

```
infrastructure-base/        # 🎯 DIESE SCHICHT - unveränderliche Basis-Ressourcen
├── domains.ts              # democracy-app.de, bundestag.io, democracy-deutschland.de
├── vpcs.ts                 # VPCs (default-fra1, website, kubernetes-test)
└── firewalls.ts            # Firewalls (k8s-public-access, k8s-worker)

democracy-foundation/       # ↑ Foundation-Schicht (referenziert diese Basis)
├── DNS records             # Umgebungsspezifische DNS-Einträge
├── SSL certificates        # Let's Encrypt Integration
└── Stack references        # Referenzen zu infrastructure-base

democracy-platform/         # ↑ Platform-Schicht
├── Kubernetes cluster      # Kubernetes und Load Balancer
└── Load balancers          # Platform-Services

Applications/               # ↑ Anwendungsebene
└── Vote apps, Admin tools  # Anwendungen verwenden Platform-Exports
```

## ⚠️ **Wichtiger Unterschied zu democracy-foundation**

| **infrastructure-base**                         | **democracy-foundation**                       |
| ----------------------------------------------- | ---------------------------------------------- |
| **Basis-Ressourcen** (Domains, VPCs, Firewalls) | **Umgebungs-Konfiguration** (DNS Records, SSL) |
| **Ein Stack**: `prod`                           | **Mehrere Stacks**: `prod`, `staging`, `dev`   |
| **Ändert sich selten**                          | **Ändert sich häufiger**                       |
| **Alle Resources protected**                    | **Selektiv protected**                         |
| **Keine Abhängigkeiten**                        | **Abhängig von infrastructure-base**           |

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
