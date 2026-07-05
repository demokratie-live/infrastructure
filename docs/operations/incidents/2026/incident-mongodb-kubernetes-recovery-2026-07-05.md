# Incident-Dokumentation: MongoDB/Kubernetes Recovery democracy-production

**Datum:** 2026-07-05  
**Namespace:** `democracy-production`  
**System:** Democracy Kubernetes Cluster / MongoDB ReplicaSet `rs0`  
**Cluster:** DigitalOcean Kubernetes `democracy`  
**Ablage:** `/Users/manuelruck/Library/Mobile Documents/com~apple~CloudDocs/democracy/mongo-backups`

## Kurzfassung

Nach einem wahrscheinlichen automatischen Kubernetes-/Node-Update wurden die Kubernetes-Nodes neu erstellt. Dadurch wurden auch MongoDB-Pods neu gestartet bzw. neu geplant. Dabei ist eine Inkonsistenz zwischen der MongoDB ReplicaSet-Konfiguration und der Kubernetes-StatefulSet-/Service-Konfiguration sichtbar geworden.

MongoDB erwartete produktiv die Mitglieder:

- `mongo-3.mongo:27017`
- `mongo-4.mongo:27017`
- `mongo-5.mongo:27017`

Kubernetes verwaltete jedoch zwischenzeitlich noch falsche bzw. alte Ordinals und hatte wichtige Service-/Pod-Labels nicht dauerhaft in der StatefulSet-Vorlage. Dadurch konnten MongoDB-Mitglieder zeitweise nicht sauber über Kubernetes DNS gefunden werden. Das führte zu ReplicaSet-Problemen und fehlgeschlagenen abhängigen CronJobs.

Der akute Zustand wurde behoben. MongoDB ist wieder gesund, synchron und produktiv verfügbar.

## Auswirkungen

Während der Störung war MongoDB zeitweise nicht sauber verfügbar bzw. nicht konsistent erreichbar. Dadurch schlugen mehrere CronJobs fehl, unter anderem Import-, Sync- und Index-Jobs.

Nach der Recovery liefen neue CronJob-Ausführungen wieder erfolgreich. Alte fehlgeschlagene Jobs/Pods wurden als Störungs-Altlasten bereinigt.

## Wahrscheinliche Ursache

Der unmittelbare Auslöser war wahrscheinlich ein automatisches Kubernetes-/Node-Update bzw. Node-Replacement. Hinweis: Alle Worker-Nodes waren nach der Recovery etwa gleich alt.

Die eigentliche technische Ursache war jedoch nicht das Update allein, sondern eine nicht dauerhaft korrekte Kubernetes-Konfiguration für MongoDB:

1. Das StatefulSet hatte nicht dauerhaft die korrekten Ordinals `3..5`.
2. Das StatefulSet-Template enthielt das Label `mongo-rs-role=active` nicht dauerhaft.
3. Der Headless Service benötigte `publishNotReadyAddresses=true`, damit MongoDB-Mitglieder sich auch während Start-/Readiness-Phasen per DNS finden können.
4. Alte PVC/PV-Objekte `mongo-volume-mongo-6..14` existierten noch in Kubernetes, obwohl die echten DigitalOcean Volumes bereits fehlten.
5. Es gab kein PodDisruptionBudget für MongoDB. Dadurch war nicht explizit geschützt, dass bei freiwilligen Node-Drains maximal ein MongoDB-Pod gleichzeitig verdrängt wird.
6. Es gab keine Anti-Affinity-Regel, die MongoDB-Pods dauerhaft auf unterschiedliche Nodes verteilt.

## Durchgeführte Recovery-Maßnahmen

### MongoDB ReplicaSet wiederhergestellt

Der MongoDB ReplicaSet-Zustand wurde geprüft und wieder stabilisiert.

Finaler Zustand:

- `mongo-4.mongo:27017` ist `PRIMARY`
- `mongo-3.mongo:27017` ist `SECONDARY`
- `mongo-5.mongo:27017` ist `SECONDARY`
- beide Secondaries sind `0 secs behind`
- ReplicaSet-Mitglieder voten wieder normal mit `votes=1`, `priority=1`

Beispiel finaler Zustand:

```text
mongo-4.mongo:27017 state=PRIMARY health=1
mongo-5.mongo:27017 state=SECONDARY health=1
mongo-3.mongo:27017 state=SECONDARY health=1

mongo-5 syncedTo: 0 secs behind primary
mongo-3 syncedTo: 0 secs behind primary
```

### Kubernetes StatefulSet korrigiert

Das MongoDB StatefulSet wurde dauerhaft auf die produktiven Ordinals reduziert:

```text
replicas=3
ready=3/3
ordinalsStart=3
updateStrategy=OnDelete
templateLabels={"app":"mongo","mongo-rs-role":"active"}
```

Damit verwaltet Kubernetes nur noch:

- `mongo-3`
- `mongo-4`
- `mongo-5`

Die alten laufenden Pods `mongo-0`, `mongo-1`, `mongo-2` wurden aus dem laufenden Betrieb entfernt.

### Headless Service korrigiert

Der MongoDB Service wurde so angepasst, dass DNS auch während Start-/Readiness-Phasen funktioniert:

```text
publishNotReadyAddresses=true
selector={"app":"mongo","mongo-rs-role":"active"}
```

### Temporärer Node entfernt

Zur Recovery wurde der DigitalOcean Nodepool temporär von 6 auf 7 Nodes skaliert, um `mongo-5` wieder starten zu können. Nach erfolgreicher Recovery wurde `mongo-5` auf einen bestehenden Node verschoben, der temporäre Node gedraint und der Nodepool wieder auf 6 reduziert.

### Fehlgeschlagene CronJobs bereinigt

Alte fehlgeschlagene Jobs/Pods aus der Störungszeit wurden gelöscht. Danach gab es im Namespace keine echten `Error`-/Crash-Pods mehr.

### Kaputte orphaned PVCs/PVs bereinigt

Die PVCs `mongo-volume-mongo-6..14` waren in Kubernetes noch `Bound`, aber die zugehörigen DigitalOcean Volumes existierten nicht mehr. Das wurde per DigitalOcean API bestätigt.

Die YAMLs der PVCs/PVs wurden vor dem Löschen gesichert.

Gelöscht wurden:

- `mongo-volume-mongo-6`
- `mongo-volume-mongo-7`
- `mongo-volume-mongo-8`
- `mongo-volume-mongo-9`
- `mongo-volume-mongo-10`
- `mongo-volume-mongo-11`
- `mongo-volume-mongo-12`
- `mongo-volume-mongo-13`
- `mongo-volume-mongo-14`

Die produktiven PVCs `mongo-volume-mongo-3`, `mongo-volume-mongo-4`, `mongo-volume-mongo-5` blieben unangetastet.

### PodDisruptionBudget ergänzt

Zum Schutz bei zukünftigen freiwilligen Node-Drains/Upgrades wurde ein PDB erstellt:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: mongo-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: mongo
      mongo-rs-role: active
```

Finaler Zustand:

```text
NAME        MIN AVAILABLE   ALLOWED DISRUPTIONS
mongo-pdb   2               1
```

Damit darf Kubernetes bei freiwilligen Disruptions maximal einen MongoDB-Pod gleichzeitig evicten.

### Anti-Affinity ergänzt

Damit MongoDB-Pods bei künftigem Scheduling auf unterschiedlichen Nodes landen, wurde eine harte Pod-Anti-Affinity ergänzt:

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: mongo
            mongo-rs-role: active
        topologyKey: kubernetes.io/hostname
```

Aktuell laufen die drei produktiven MongoDB-Pods auf drei unterschiedlichen Nodes.

## Finaler Zustand nach Recovery

### MongoDB

```text
mongo-4.mongo:27017 state=PRIMARY health=1
mongo-5.mongo:27017 state=SECONDARY health=1
mongo-3.mongo:27017 state=SECONDARY health=1
mongo-5: 0 secs behind primary
mongo-3: 0 secs behind primary
```

### Kubernetes

```text
StatefulSet mongo:
  replicas=3
  ready=3/3
  ordinalsStart=3
  updateStrategy=OnDelete
  labels={"app":"mongo","mongo-rs-role":"active"}

Pods:
  mongo-3 Running
  mongo-4 Running
  mongo-5 Running

PDB:
  mongo-pdb minAvailable=2 allowedDisruptions=1
```

### PVCs

Produktiv aktiv:

- `mongo-volume-mongo-3`
- `mongo-volume-mongo-4`
- `mongo-volume-mongo-5`

Bewusst behalten, aber nicht aktiv gemountet:

- `mongo-volume-mongo-0`
- `mongo-volume-mongo-1`
- `mongo-volume-mongo-2`

Gelöscht, weil kaputt/orphaned und Backend-Volumes fehlten:

- `mongo-volume-mongo-6..14`

## Bewusste Restpunkte

### Alte echte Volumes `mongo-volume-mongo-0/1/2`

Diese Volumes existieren weiterhin als echte DigitalOcean Volumes, sind aber aktuell nicht gemountet und nicht Teil des produktiven MongoDB ReplicaSets.

Empfehlung:

- vorerst für Rollback/Forensik behalten
- nach definierter Frist, z. B. 7–30 Tage, bewusst neu bewerten
- optional vorher Snapshots erstellen
- erst danach löschen, wenn sicher nicht mehr benötigt

### IaC/GitOps-Abgleich erforderlich

Die Live-Fixes müssen in den deklarativen Infrastruktur-Code übernommen werden. Sonst besteht das Risiko, dass ein späteres Deployment, ArgoCD-Sync, Helm-Upgrade oder Kustomize-Apply Teile der Korrektur überschreibt.

Siehe separate Datei:

```text
iac-codex-mongodb-kubernetes-hardening.md
```

## Wichtige Backups/Artefakte

Die lokalen Backups wurden in folgenden Ordner verschoben:

```text
/Users/manuelruck/Library/Mobile Documents/com~apple~CloudDocs/democracy/mongo-backups
```

Dort befinden sich u. a.:

- ReplicaSet-Config-/Status-Backups vor Änderungen
- StatefulSet-/Service-Sicherungen
- PVC-/PV-YAMLs vor Cleanup der orphaned Objekte

## Bewertung

Der akute Fehler ist behoben. Die konkrete Fehlerkette sollte durch die Korrekturen deutlich unwahrscheinlicher werden.

Ganz ausschließen lassen sich Probleme bei zukünftigen Kubernetes-/Node-Upgrades nicht. Wichtig ist deshalb, dass die Änderungen in IaC persistiert und Monitoring/Runbooks ergänzt werden.
