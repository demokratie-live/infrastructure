# Democracy Infrastructure - Architektur-Übersicht

## 🏗️ **Vier-Schichten-Architektur**

Die Democracy-Infrastruktur verwendet eine klare vier-schichtige Architektur zur Trennung von Verantwortlichkeiten:

```
┌─────────────────────────────────────────────────────┐
│                   Applications                      │  ← Anwendungsebene
│  (Vote apps, Admin tools, APIs)                    │
└─────────────────────────────────────────────────────┘
                            ↓ verwendet
┌─────────────────────────────────────────────────────┐
│              democracy-platform/                    │  ← Platform-Ebene
│  • Kubernetes Cluster                              │
│  • Load Balancer                                   │
│  • DigitalOcean Projects                           │
└─────────────────────────────────────────────────────┘
                            ↓ verwendet
┌─────────────────────────────────────────────────────┐
│             democracy-foundation/                   │  ← Foundation-Ebene
│  • DNS Records (umgebungsspezifisch)               │
│  • SSL Zertifikate                                 │
│  • Cross-Stack-Referenzen                          │
└─────────────────────────────────────────────────────┘
                            ↓ verwendet
┌─────────────────────────────────────────────────────┐
│             infrastructure-base/                    │  ← Basis-Ebene
│  • Domains (democracy-app.de, bundestag.io)        │
│  • VPCs (Netzwerk-Grundlagen)                      │
│  • Firewalls (Basis-Sicherheitsregeln)             │
└─────────────────────────────────────────────────────┘
```

## 🔧 **Schicht-Details**

### 1. **infrastructure-base/** (Basis-Ebene)

**Zweck**: Geteilte, unveränderliche Basis-Ressourcen

```typescript
// Verwaltet:
- Domains (democracy-app.de, bundestag.io, democracy-deutschland.de)
- VPCs (default-fra1, website, kubernetes-test)
- Firewalls (k8s-public-access, k8s-worker)

// Charakteristika:
- Ein einziger "prod" Stack
- Resources sind protected (können nicht gelöscht werden)
- Wird von allen anderen Projekten referenziert
- Ändert sich nur bei fundamentalen Infrastruktur-Updates
```

### 2. **democracy-foundation/** (Foundation-Ebene)

**Zweck**: Umgebungsspezifische Konfigurationen und DNS

```typescript
// Verwaltet:
- DNS Records (pro Umgebung: prod, internal, alpha)
- SSL Zertifikate (Let's Encrypt Integration)
- Stack-Referenzen zu infrastructure-base
- Umgebungsspezifische Konfigurationen

// Charakteristika:
- Mehrere Stacks (prod, staging, dev)
- Kann pro Umgebung unterschiedlich konfiguriert werden
- Referenziert infrastructure-base für Basis-Ressourcen
- Stellt Foundation-Resources für Platform bereit
```

### 3. **democracy-platform/** (Platform-Ebene)

**Zweck**: Kubernetes und Platform-Services

```typescript
// Verwaltet:
- Kubernetes Cluster
- Load Balancer
- DigitalOcean Project-Organisation
- Platform-spezifische Ressourcen

// Charakteristika:
- Abhängig von democracy-foundation
- Stellt Platform-Resources für Applications bereit
- Kubernetes-fokussiert
- Load Balancer und Ingress Management
```

### 4. **shared/** (Utility-Ebene)

**Zweck**: Geteilte TypeScript-Utilities und Konfigurationen

```typescript
// Bereitstellt:
- Stack-Referenz Utilities
- Monitoring Functions
- Testing Framework
- Gemeinsame Konfiguration

// Charakteristika:
- TypeScript-Package mit Utilities
- Wird von allen anderen Projekten importiert
- Keine Pulumi-Ressourcen direkt
```

## 🔄 **Deployment-Reihenfolge**

**Kritisch**: Die Schichten müssen in der richtigen Reihenfolge deployed werden:

```bash
# 1. Basis-Ressourcen (einmalig oder bei fundamentalen Änderungen)
cd infrastructure-base && pulumi up

# 2. Foundation pro Umgebung
cd democracy-foundation && pulumi stack select prod && pulumi up

# 3. Platform pro Umgebung
cd democracy-platform && pulumi stack select production && pulumi up

# 4. Applications (außerhalb dieses Repos)
# Anwendungen verwenden die Platform-Exports
```

## 🔗 **Stack-Referenzen**

### infrastructure-base → [niemand]

```typescript
// Exports für andere Projekte:
export const domainOutputs = { demokratie-app.de, bundestag.io, ... };
export const vpcOutputs = { defaultFra1VpcId, websiteVpcId, ... };
export const firewallOutputs = { k8sPublicAccessFirewallId, ... };
```

### democracy-foundation → infrastructure-base

```typescript
// Imports von infrastructure-base:
const infraStack = new StackReference("ManAnRuck/infrastructure-base/prod");
const domains = infraStack.getOutput("domainOutputs");

// Exports für platform:
export const dnsRecordsOutputs = { ... };
export const sslCertOutputs = { ... };
```

### democracy-platform → democracy-foundation

```typescript
// Imports von democracy-foundation:
const foundationStack = createFoundationReference("production");
const vpcId = foundationStack.getOutput("vpcId");

// Exports für applications:
export const clusterId = cluster.id;
export const loadBalancerIp = loadBalancer.ip;
```

## ⚠️ **Wichtige Unterschiede**

| Aspekt                  | infrastructure-base | democracy-foundation    |
| ----------------------- | ------------------- | ----------------------- |
| **Zweck**               | Basis-Ressourcen    | Umgebungs-Konfiguration |
| **Stacks**              | Nur "prod"          | prod, staging, dev      |
| **Änderungshäufigkeit** | Selten              | Häufiger                |
| **Resource Protection** | Alle protected      | Selektiv protected      |
| **Abhängigkeiten**      | Keine               | infrastructure-base     |
| **Beispiel-Ressourcen** | Domains, VPCs       | DNS Records, SSL        |

## 🎯 **Vorteile dieser Architektur**

1. **🔒 Sicherheit**: Basis-Ressourcen können nicht versehentlich gelöscht werden
2. **🏗️ Klarheit**: Jede Schicht hat eine eindeutige Verantwortung
3. **🔄 Flexibilität**: Umgebungen können unabhängig verwaltet werden
4. **♻️ Wiederverwendung**: Basis-Ressourcen werden von allen Umgebungen geteilt
5. **🚀 Skalierung**: Neue Umgebungen können einfach hinzugefügt werden

## 📚 **Weitere Dokumentation**

- **infrastructure-base/README.md**: Basis-Ressourcen Details
- **democracy-foundation/README.md**: Foundation-Layer Details
- **democracy-platform/README.md**: Platform-Layer Details
- **OPERATIONS.md**: Operational Procedures
