# GitHub Copilot Workspace Configuration

Dieses Dokument beschreibt die GitHub Copilot Konfiguration für das Democracy Infrastructure Projekt.

## Dateien im Überblick

### `.copilot-instructions.md`

**Hauptinstruktionen für GitHub Copilot**

- Projektkontext und Architektur-Übersicht
- Technologie-Stack und Entwicklungsrichtlinien
- Best Practices für Pulumi, TypeScript und DigitalOcean
- Verfügbare Scripts und CI/CD-Workflows
- Code-Patterns und Troubleshooting-Hinweise

### `.copilot-chat-instructions.md`

**Spezielle Anweisungen für GitHub Copilot Chat**

- Antwortstil und Kommunikationspräferenzen
- Code-Präferenzen für TypeScript, Pulumi und DigitalOcean
- Workflow-Integration und Hilfestellungen
- Erwartungen an Lösungsqualität und -tiefe

### `.copilot-rules.json`

**Strukturierte Regeln für kontextbezogene Vorschläge**

- 10 Kategorien mit spezifischen Pattern-Erkennungen
- Von Pulumi IaC bis Kubernetes-Management
- Automatische Suggestions basierend auf Code-Kontext
- Best Practices für Sicherheit, Testing und Code-Qualität

## Verwendung

Diese Konfigurationsdateien helfen GitHub Copilot dabei:

1. **Konsistente Code-Generierung** entsprechend der Projekt-Standards
2. **Kontextbezogene Vorschläge** basierend auf der aktuellen Arbeit
3. **Sicherheitsbewusste Entwicklung** mit automatischen Security-Hinweisen
4. **Effiziente Problemlösung** durch projektspezifische Patterns

## Updates

Die Konfiguration sollte regelmäßig aktualisiert werden bei:

- Neuen Technologien oder Patterns im Projekt
- Änderungen in der Architektur oder den Workflows
- Erkenntnissen aus der praktischen Nutzung mit Copilot
- Updates der verfügbaren Scripts oder CI/CD-Pipelines

## Integration mit VS Code

Für optimale Nutzung:

1. Stelle sicher, dass die GitHub Copilot Extension aktiviert ist
2. Die Dateien werden automatisch von Copilot erkannt
3. Keine weitere Konfiguration erforderlich

---

Diese Konfiguration wurde speziell für das Democracy Infrastructure Projekt optimiert und berücksichtigt die komplexe Monorepo-Struktur mit Pulumi, DigitalOcean und Kubernetes.
