import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import { loadBalancer } from "../load-balancer";
import { createDnsRecord, DnsRecordConfig } from "./utils/dns-records";

const domainName = "democracy-deutschland.de";

export const democracyDeutschlandDe = new digitalocean.Domain(
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
    recordName: "qr",
    value: "174.138.102.21",
    ttl: 3601,
  },
  {
    type: "A",
    recordName: "*",
    value: "207.154.221.111",
    ttl: 3600,
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
