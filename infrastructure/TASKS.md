# Infrastructure Tasks & TODOs

## 🔍 Architektur-Überprüfungen

### VPC Design Review (Priorität: Medium)

**Problem**: VPCs sind aktuell in `infrastructure-base`, aber werden hauptsächlich von `democracy-platform` genutzt.

**Aktuelle Situation**:

- VPCs in `infrastructure-base` (basis-ebene)
- Kubernetes Cluster in `democracy-platform` referenziert diese VPCs
- Bei multi-environment setups (prod/dev) könnten separate VPCs pro environment sinnvoll sein

**Zu prüfen**:

- [ ] Sollten VPCs von `infrastructure-base` zu `democracy-foundation` migriert werden?
- [ ] Oder sollten sie in `democracy-platform` selbst verwaltet werden?
- [ ] Pro/Contra Analysis für shared vs. per-environment VPCs

**Auswirkungen**:

- Migration würde breaking changes für bestehende Stacks bedeuten
- Aber könnte bessere environment isolation bieten
- Besonders relevant für dev/staging environments

**Nächste Schritte**:

1. Aktuelle VPC-Nutzung analysieren
2. Environment-Isolation Requirements definieren
3. Migration Plan erstellen (falls nötig)

---

## 📝 Weitere TODOs

- [ ] Dev Stack Setup und Testing
- [ ] Documentation Updates nach dev stack creation
- [ ] Load Balancer sizing optimization für dev environment
