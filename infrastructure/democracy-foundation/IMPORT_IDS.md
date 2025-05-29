# Democracy Foundation - Resource Import IDs

This document lists all the import IDs that have been added to the democracy-foundation project resources to import existing infrastructure instead of creating new resources.

## VPCs

| Resource Name     | Import ID                              | Name            | IP Range       |
| ----------------- | -------------------------------------- | --------------- | -------------- |
| defaultFra1Vpc    | `fa3eddc8-dc84-11e8-8b13-3cfdfea9f160` | default-fra1    | 10.135.0.0/16  |
| websiteVpc        | `ae417d56-f22a-4590-bcc3-224b5645ae11` | website         | 10.114.16.0/20 |
| kubernetesTestVpc | `64d3d4fa-f217-4832-8201-627bdd37690c` | kubernetes-test | 10.114.0.0/20  |

## Firewalls

| Resource Name           | Import ID                              | Name                                                   |
| ----------------------- | -------------------------------------- | ------------------------------------------------------ |
| k8sPublicAccessFirewall | `79db9db7-6f38-4cf5-bb61-fd9f6eabac1f` | k8s-public-access-47f41c0b-f8b6-4c32-9364-c6f6beed456e |
| k8sWorkerFirewall       | `3f0125df-c4b9-451a-9acf-9605963c953e` | k8s-47f41c0b-f8b6-4c32-9364-c6f6beed456e-worker        |

## Domains

| Resource Name          | Import ID                  | Domain Name              |
| ---------------------- | -------------------------- | ------------------------ |
| bundestagIo            | `bundestag.io`             | bundestag.io             |
| democracyAppDe         | `democracy-app.de`         | democracy-app.de         |
| democracyDeutschlandDe | `democracy-deutschland.de` | democracy-deutschland.de |

## DNS Records (democracy-deutschland.de)

| Record Type | Name | Value                 | Import ID  |
| ----------- | ---- | --------------------- | ---------- |
| A           | qr   | 174.138.102.21        | 1701532948 |
| A           | \*   | 207.154.221.111       | 1762459402 |
| NS          | @    | ns1.digitalocean.com. | 110225255  |
| NS          | @    | ns2.digitalocean.com. | 110225256  |
| NS          | @    | ns3.digitalocean.com. | 110225257  |

## Next Steps

1. **Test the import**: Run `pulumi preview` in the dev stack to verify all resources can be imported correctly
2. **Import resources**: Run `pulumi up` to import the existing resources into the new foundation project
3. **Validate**: Ensure all resources are properly imported and functioning
4. **Cross-stack verification**: Test that exports work correctly for the platform project

## Commands to Retrieve Resource IDs

For future reference, these commands were used to retrieve the resource IDs:

```bash
# VPCs
doctl vpcs list --output json

# Firewalls
doctl compute firewall list --output json

# Domains
doctl compute domain list --output json

# DNS Records (for each domain)
doctl compute domain records list democracy-deutschland.de --output json
doctl compute domain records list democracy-app.de --output json
doctl compute domain records list bundestag.io --output json
```
