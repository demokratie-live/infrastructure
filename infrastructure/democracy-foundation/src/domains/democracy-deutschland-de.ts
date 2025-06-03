import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import { createDnsRecord, DnsRecordConfig } from "./utils/dns-records";
import { platformOutputs } from "../platform-stack-refs";

const domainName = "democracy-deutschland.de";

export const democracyDeutschlandDe = new digitalocean.Domain(
  domainName,
  {
    name: domainName,
  },
  {
    protect: true,
    import: domainName,
  }
);

// Basic DNS records (non-load balancer dependent)
const dnsRecords: DnsRecordConfig[] = [
  {
    type: "A",
    recordName: "qr",
    value: platformOutputs.loadBalancerIp as pulumi.Output<string>,
    ttl: 3601,
    id: "1701532948",
  },
  {
    name: `${domainName}-digitalocean-ns1-ns`,
    type: "NS",
    recordName: "@",
    value: "ns1.digitalocean.com.",
    ttl: 1800,
    id: "110225255",
  },
  {
    name: `${domainName}-digitalocean-ns2-ns`,
    type: "NS",
    recordName: "@",
    value: "ns2.digitalocean.com.",
    ttl: 1800,
    id: "110225256",
  },
  {
    name: `${domainName}-digitalocean-ns3-ns`,
    type: "NS",
    recordName: "@",
    value: "ns3.digitalocean.com.",
    ttl: 1800,
    id: "110225257",
  },
];

// Create DNS records
export const dnsRecordResources = dnsRecords.map(record =>
  createDnsRecord({ ...record, domainName })
);

// Export domain for cross-stack references
export const democracyDeutschlandDeOutputs = {
  domainName: democracyDeutschlandDe.name,
  domainUrn: democracyDeutschlandDe.urn,
};
