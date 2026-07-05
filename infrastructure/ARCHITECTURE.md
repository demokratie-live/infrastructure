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
│  • VPCs (umgebungsspezifisch)                      │
│  • Firewalls (umgebungsspezifisch)                 │
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
│  • Global geteilte Ressourcen                      │
└─────────────────────────────────────────────────────┘
```

## 🔧 **Schicht-Details**

### 1. **infrastructure-base/** (Basis-Ebene)

**Zweck**: Geteilte, unveränderliche Basis-Ressourcen

```typescript
// Verwaltet:
- Domains (democracy-app.de, bundestag.io, democracy-deutschland.de)
- Global geteilte Ressourcen (nur was wirklich zentral verwaltet werden muss)

// Charakteristika:
- Ein einziger "prod" Stack
- Resources sind protected (können nicht gelöscht werden)
- Wird von anderen Projekten für Domains referenziert
- Ändert sich nur bei fundamentalen Infrastruktur-Updates
- Fokus auf global einmalige Ressourcen (wie Domains)
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

**Zweck**: Kubernetes, Platform-Services und Environment-spezifische VPCs

```typescript
// Verwaltet:
- VPCs (pro Environment isoliert)
- Kubernetes Cluster
- Load Balancer
- VPCs (umgebungsspezifisch für bessere Isolation)
- Firewalls (umgebungsspezifisch für flexible Sicherheitsrichtlinien)
- DigitalOcean Project-Organisation
- Platform-spezifische Ressourcen

// Charakteristika:
- Eigene VPC pro Stack für bessere Isolation
- Eigene Firewall-Regeln pro Stack für flexible Sicherheit
- Abhängig von democracy-foundation für DNS/SSL
- Stellt Platform-Resources für Applications bereit
- Kubernetes-fokussiert
- Load Balancer und Ingress Management
```

**🔗 VPC & Firewall-Isolation**: Jeder `democracy-platform` Stack hat seine eigene VPC und Firewall-Regeln für maximale Environment-Trennung und flexible Sicherheitsrichtlinien.

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
const dnsRecords = foundationStack.getOutput("dnsRecordsOutputs");

// Eigene VPC (nicht mehr von infrastructure-base):
export const platformVpc = new VPC(...);

// Exports für applications:
export const clusterId = cluster.id;
export const loadBalancerIp = loadBalancer.ip;
export const vpcOutputs = { vpcId, vpcUrn, ... };
```

## ⚠️ **Wichtige Unterschiede**

| Aspekt                  | infrastructure-base | democracy-foundation    | democracy-platform       |
| ----------------------- | ------------------- | ----------------------- | ------------------------ |
| **Zweck**               | Basis-Ressourcen    | Umgebungs-Konfiguration | Platform + VPCs          |
| **Stacks**              | Nur "prod"          | prod, staging, dev      | prod, dev, staging       |
| **Änderungshäufigkeit** | Selten              | Häufiger                | Häufiger                 |
| **Resource Protection** | Alle protected      | Selektiv protected      | Selektiv protected       |
| **Abhängigkeiten**      | Keine               | infrastructure-base     | democracy-foundation     |
| **Beispiel-Ressourcen** | Domains, Firewalls  | DNS Records, SSL        | VPCs, K8s, Load Balancer |
| **VPC-Verantwortung**   | ❌ Keine mehr       | ❌ Keine                | ✅ Eigene VPCs           |

## 🎯 **Vorteile dieser Architektur**

1. **🔒 Sicherheit**: Basis-Ressourcen können nicht versehentlich gelöscht werden
2. **🏗️ Klarheit**: Jede Schicht hat eine eindeutige Verantwortung
3. **🔄 Flexibilität**: Umgebungen können unabhängig verwaltet werden
4. **♻️ Wiederverwendung**: Basis-Ressourcen werden von allen Umgebungen geteilt
5. **🚀 Skalierung**: Neue Umgebungen können einfach hinzugefügt werden
6. **🛡️ Isolation**: Jede Platform hat ihre eigene VPC für maximale Sicherheit

## 🔄 **VPC-Migration (Juni 2025)**

**Änderung**: VPCs wurden von `infrastructure-base` zu `democracy-platform` migriert.

**Vorteile**:

- **Environment-Isolation**: Jeder Stack hat seine eigene VPC
- **Bessere Sicherheit**: Keine geteilten Netzwerk-Ressourcen zwischen Environments
- **Flexibilität**: VPC-Konfiguration kann pro Environment angepasst werden
- **Skalierbarkeit**: Neue Environments können schnell erstellt werden

**Backward Compatibility**: Production VPC wird importiert, um Downtime zu vermeiden.

## 📚 **Weitere Dokumentation**

- **infrastructure-base/README.md**: Basis-Ressourcen Details
- **democracy-foundation/README.md**: Foundation-Layer Details
- **democracy-platform/README.md**: Platform-Layer Details
- **OPERATIONS.md**: Operational Procedures
