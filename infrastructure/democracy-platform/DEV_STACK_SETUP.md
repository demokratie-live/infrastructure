# Democracy Platform - Dev Stack Setup Guide

## ✅ Status: Stack Configuration Complete

Der **dev Stack** für `democracy-platform` wurde erfolgreich konfiguriert!

## 📋 Stack Übersicht

| Setting          | Production              | Development             |
| ---------------- | ----------------------- | ----------------------- |
| **Stack Name**   | `production`            | `dev`                   |
| **Cluster Name** | `democracy`             | `democracy-dev`         |
| **Node Pool**    | `s-4vcpu-8gb` (5 nodes) | `s-2vcpu-4gb` (2 nodes) |
| **Project**      | `Team DEMOCRACY`        | `Team DEMOCRACY Dev`    |
| **Protection**   | ✅ Protected            | ❌ Not Protected        |
| **Tags**         | `kubernetes-test`       | `kubernetes-test-dev`   |
| **Auto-Upgrade** | ✅ Enabled              | ✅ Enabled              |

## 🚀 Next Steps

### 1. Setup DigitalOcean Token (if needed)

```bash
cd infrastructure/democracy-platform
pulumi stack select dev
pulumi config set digitalocean:token --secret [YOUR_TOKEN]
```

### 2. Test Stack Operations

```bash
# Test both stacks
./test-stacks.sh both

# Or test individual stacks
./test-stacks.sh dev
./test-stacks.sh prod
```

### 3. Deploy Development Stack

```bash
# Make sure foundation stack exists
cd ../democracy-foundation && pulumi up

# Deploy dev platform stack
cd ../democracy-platform
pulumi stack select dev
pulumi up
```

### 4. Test Development Environment

```bash
# Check stack health
pulumi stack output stackHealth

# Get cluster info
pulumi stack output kubeconfig > ~/.kube/config-dev
export KUBECONFIG=~/.kube/config-dev
kubectl get nodes
```

### 5. Clean Up (Development Only)

```bash
# Destroy dev stack (when done testing)
pulumi stack select dev
pulumi destroy

# Remove dev stack completely
pulumi stack rm dev
```

## 🔍 Architecture Notes

### VPC Design Question ⚠️

Es wurde ein potentielles Architektur-Issue identifiziert:

- VPCs sind aktuell in `infrastructure-base` (geteilt)
- Bei dev/prod separation könnten separate VPCs pro environment sinnvoll sein
- Details siehe `TASKS.md`

### Foundation Dependencies

- Dev Stack nutzt die **gleiche** `democracy-foundation` wie prod
- Das ist korrekt für Domains (können nicht doppelt existieren)
- DNS Records werden umgebungsspezifisch verwaltet

## ✅ Validation Checklist

- [x] Dev stack configuration created (`Pulumi.dev.yaml`)
- [x] Environment-based resource protection implemented
- [x] Load balancer naming for dev environment
- [x] Project name separation (Team DEMOCRACY Dev)
- [x] Node pool sizing for development workload
- [x] Tags with dev suffix
- [x] Test script created (`test-stacks.sh`)
- [x] Documentation updated (`README.md`)
- [ ] DigitalOcean token configured (manual step)
- [ ] Stack deployment tested
- [ ] Applications tested on dev environment

## 🧪 Testing Commands

```bash
# Preview dev changes
pulumi stack select dev && pulumi preview

# Deploy dev
pulumi stack select dev && pulumi up

# Check outputs
pulumi stack output

# Destroy dev (safe to test)
pulumi stack select dev && pulumi destroy
```

## 📁 Files Modified/Created

- ✅ `Pulumi.dev.yaml` - Dev stack configuration
- ✅ `src/kubernetes-cluster.ts` - Environment-based protection
- ✅ `src/load-balancer.ts` - Environment-based naming
- ✅ `README.md` - Updated documentation
- ✅ `test-stacks.sh` - Stack testing script
- ✅ `DEV_STACK_SETUP.md` - This guide
- ✅ `../TASKS.md` - Architecture review notes
