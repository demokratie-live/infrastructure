import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import { loadBalancer } from "../load-balancer";
import { createDnsRecord, DnsRecordConfig } from "./utils/dns-records";

const domainName = "bundestag.io";

export const bundestagIo = new digitalocean.Domain(
  domainName,
  {
    name: domainName,
  },
  {
    protect: true,
  }
);

const dnsRecords: DnsRecordConfig[] = [
  {
    type: "A",
    recordName: "admin",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "api",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "internal.api",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "alpha.api",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "alpha.admin",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "internal.admin",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "alpha.dip",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "internal.dip",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "dip",
    value: loadBalancer.ip,
  },
  {
    name: `${domainName}-digitalocean-ns1-ns`,
    type: "NS",
    recordName: "@",
    value: "ns1.digitalocean.com.",
    ttl: 1800,
  },
  {
    name: `${domainName}-digitalocean-ns2-ns`,
    type: "NS",
    recordName: "@",
    value: "ns2.digitalocean.com.",
    ttl: 1800,
  },
  {
    name: `${domainName}-digitalocean-ns3-ns`,
    type: "NS",
    recordName: "@",
    value: "ns3.digitalocean.com.",
    ttl: 1800,
  },
];

// Create all DNS records
dnsRecords.forEach((recordConfig) => {
  createDnsRecord({ ...recordConfig, domainName });
});
