# Knip - Unused Code Detection

Dieses Projekt verwendet [Knip](https://knip.dev) um unbenutzten Code, unbenutzte Abhängigkeiten und potentielle Probleme in der Codebasis zu identifizieren.

## Verwendung

### Grundlegende Analyse

```bash
# Führe eine vollständige Analyse durch
pnpm knip

# Nur Production-Abhängigkeiten prüfen (empfohlen für CI/CD)
pnpm knip:production
```

### Automatische Fixes

```bash
# Versuche automatische Fixes für gefundene Probleme
pnpm knip:fix
```

## Konfiguration

Die Knip-Konfiguration befindet sich in `.knip.json` und ist für das Pulumi/Infrastructure-Monorepo optimiert.

### Workspace-Struktur

- **Root (.)**: Scripts und Konfigurationsdateien
- **democracy-foundation**: Foundation-Infrastructure (VPCs, Domains, Firewalls)
- **democracy-platform**: Platform-Infrastructure (Kubernetes, Load Balancer)
- **shared**: Geteilte Utilities und Konfigurationen

### Ignorierte Dateien/Ordner

- `archive/**` - Archivierte Dateien
- `ci-artifacts/**` - CI/CD-Artefakte
- `reports/**` - Generierte Reports
- `kustomize/**` - Kubernetes-Konfiguration
- `**/*.yaml`, `**/*.yml`, `**/*.md` - Konfigurationsdateien

## Interpretation der Ergebnisse

### Häufige Findings

#### Unused Exports

```
dnsRecordResources  democracy-foundation/src/domains/democracy-deutschland-de.ts:55:14
```

- **Bedeutung**: Exportierte Funktionen/Variablen, die nirgendwo importiert werden
- **Aktion**: Überprüfen ob wirklich unbenutzt oder entfernen

#### Unused Dependencies

```
@democracy/shared-infrastructure  democracy-foundation/package.json:22:6
```

- **Bedeutung**: Abhängigkeiten in package.json, die nicht im Code verwendet werden
- **Aktion**: Dependency entfernen oder fehlende Imports hinzufügen

#### Unused Files

```
scripts/cost-analyzer.ts
```

- **Bedeutung**: Dateien, die nicht als Entry Point konfiguriert und nirgends importiert sind
- **Aktion**: Als Entry Point konfigurieren oder löschen

#### Unlisted Binaries

```
pulumi  package.json
```

- **Bedeutung**: Binaries die verwendet werden, aber nicht in dependencies stehen
- **Aktion**: Als Dependency hinzufügen oder in ignoreBinaries konfigurieren

## CI/CD Integration

Für CI/CD empfiehlt sich der Production-Modus:

```bash
pnpm knip:production
```

Dies prüft nur die für Production relevanten Teile und ignoriert Development/Test-spezifische Dateien.

## Tipps

1. **Regelmäßig ausführen**: Knip sollte regelmäßig (z.B. wöchentlich) ausgeführt werden
2. **Vor Releases**: Immer vor einem Release ausführen um "Dead Code" zu vermeiden
3. **Team-Review**: Findings sollten im Team besprochen werden, da manche "ungenutzte" Exports absichtlich sind
4. **False Positives**: Bei Pulumi können manche Exports zur Laufzeit verwendet werden - diese in der Konfiguration ignorieren

## Erweiterte Konfiguration

Die Konfiguration kann in `.knip.json` angepasst werden:

- `entry`: Dateien die als Einstiegspunkte gelten
- `project`: Alle Projektdateien
- `ignore`: Dateien/Ordner die komplett ignoriert werden
- `ignoreDependencies`: Dependencies die nicht geprüft werden
- `ignoreBinaries`: Binaries die nicht geprüft werden

Weitere Informationen: https://knip.dev/overview/configuration
