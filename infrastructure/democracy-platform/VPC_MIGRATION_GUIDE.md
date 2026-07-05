# VPC Migration Guide - Democracy Platform

## 🔄 Migration Durchgeführt (Juni 2025)

Die VPCs wurden erfolgreich von `infrastructure-base` zu den einzelnen `democracy-platform` Stacks migriert.

## ✅ Änderungen Zusammenfassung

### Was wurde geändert:

1. **Neue VPC-Datei**: `/src/vpc.ts` in `democracy-platform`
2. **Import-Update**: Kubernetes Cluster und Load Balancer verwenden lokale VPC
3. **Stack-Konfigurationen**: Erweitert für environment-spezifische VPCs
4. **Architektur-Dokumentation**: Aktualisiert in `ARCHITECTURE.md`

### VPC IP-Ranges:

- **Production**: `10.135.0.0/16` (importiert bestehende VPC)
- **Development**: `10.136.0.0/16` (neue VPC)
- **Staging**: `10.137.0.0/16` (neue VPC)

## 🚀 Deployment-Schritte

### 1. Production Stack (Keine Änderungen nötig)

```bash
cd democracy-platform
pulumi stack select production
pulumi preview
```

**Erwartung**: Keine Changes, da bestehende VPC importiert wird.

### 2. Development Stack (Neue VPC)

```bash
cd democracy-platform
pulumi stack select dev
pulumi up
```

**Erwartung**: Neue VPC wird erstellt mit Range `10.136.0.0/16`.

### 3. Staging Stack (falls vorhanden)

```bash
cd democracy-platform
pulumi stack select staging
pulumi up
```

**Erwartung**: Neue VPC wird erstellt mit Range `10.137.0.0/16`.

## 🔍 Validierung

Nach dem Deployment validieren:

```bash
# VPC-Details anzeigen
pulumi stack output vpcOutputs

# Cluster-Status prüfen
kubectl cluster-info

# Load Balancer Status
pulumi stack output loadBalancerIp
```

## 📋 Rollback-Plan (falls nötig)

Falls Probleme auftreten:

1. **Production**: Import wird rückgängig gemacht
2. **Development**: VPC kann gelöscht werden
3. **Fallback**: Zurück zu foundation-stack-refs

```bash
# Rollback Code:
git checkout HEAD~1 -- src/vpc.ts src/kubernetes-cluster.ts src/load-balancer.ts
pulumi up
```

## 🎯 Benefits

- ✅ **Environment Isolation**: Jeder Stack hat eigene VPC
- ✅ **Security**: Kein geteiltes Netzwerk zwischen Environments
- ✅ **Flexibility**: VPC-Config pro Environment anpassbar
- ✅ **Scalability**: Neue Environments einfach erstellbar
- ✅ **No Downtime**: Production läuft unverändert weiter
