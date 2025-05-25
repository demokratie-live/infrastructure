import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import { loadBalancer } from "../load-balancer";
import { createDnsRecord, DnsRecordConfig } from "./utils/dns-records";

const domainName = "democracy-app.de";

export const democracyAppDe = new digitalocean.Domain(
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
    recordName: "@",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "internal",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "alpha",
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
    recordName: "internal.qr",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "alpha.qr",
    value: loadBalancer.ip,
  },
  {
    type: "A",
    recordName: "*.local",
    value: "127.0.0.1",
    ttl: 3600,
  },
  {
    type: "A",
    recordName: "local",
    value: "127.0.0.1",
    ttl: 3600,
  },
  {
    type: "A",
    recordName: "website",
    value: "161.35.206.64",
    ttl: 3600,
  },
  {
    type: "A",
    recordName: "listmonk",
    value: loadBalancer.ip,
    ttl: 3600,
  },
  {
    type: "CNAME",
    recordName: "newsletter-files",
    value: "democracy-newsletter.fra1.cdn.digitaloceanspaces.com.",
    ttl: 3600,
  },
  {
    name: `${domainName}-google-site-verification-1-txt`,
    type: "TXT",
    recordName: "@",
    value:
      "google-site-verification=aGopIWHEXUBiJKifY3TAZxxFKknOTUoDzO9vuW2apw8",
    ttl: 60,
  },
  {
    name: `${domainName}-google-site-verification-2-txt`,
    type: "TXT",
    recordName: "@",
    value:
      "google-site-verification=9uoux3a7RTacinXBi5NHOgqa_TX-j6Yl07zeQ3k3whc",
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
