import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import { createDnsRecord, DnsRecordConfig } from "./utils/dns-records";
import { platformOutputs } from "../platform-stack-refs";

const domainName = "democracy-app.de";

export const democracyAppDe = new digitalocean.Domain(
  domainName,
  {
    name: domainName,
  },
  {
    protect: true,
    import: domainName,
  }
);

// DNS records configuration
const dnsRecords: DnsRecordConfig[] = [
  // Main domain and API
  {
    type: "A",
    recordName: "@",
    value: platformOutputs.loadBalancerIp as pulumi.Output<string>,
    ttl: 3601,
    id: "55307990",
  },
  {
    type: "A",
    recordName: "api",
    value: platformOutputs.loadBalancerIp as pulumi.Output<string>,
    ttl: 3601,
    id: "57525594",
  },
  // Stack-specific records (internal)
  {
    type: "A",
    recordName: "internal",
    value: platformOutputs.loadBalancerIp as pulumi.Output<string>,
    ttl: 3601,
    id: "55308007",
  },
  {
    type: "A",
    recordName: "internal.api",
    value: platformOutputs.loadBalancerIp as pulumi.Output<string>,
    ttl: 3601,
    id: "57525601",
  },
  {
    type: "A",
    recordName: "internal.qr",
    value: platformOutputs.loadBalancerIp as pulumi.Output<string>,
    ttl: 3601,
    id: "110512942",
  },
  // Stack-specific records (alpha)
  {
    type: "A",
    recordName: "alpha",
    value: platformOutputs.loadBalancerIp as pulumi.Output<string>,
    ttl: 3601,
    id: "55308033",
  },
  {
    type: "A",
    recordName: "alpha.api",
    value: platformOutputs.loadBalancerIp as pulumi.Output<string>,
    ttl: 3601,
    id: "57525603",
  },
  {
    type: "A",
    recordName: "alpha.qr",
    value: "174.138.102.21", // Use static IP for now
    ttl: 3601,
    id: "1701541452",
  },
  // Local development
  {
    type: "A",
    recordName: "local",
    value: "127.0.0.1",
    ttl: 3600,
    id: "1740791288",
  },
  {
    type: "A",
    recordName: "*.local",
    value: "127.0.0.1",
    ttl: 3600,
    id: "1740790703",
  },
  // Other services
  {
    type: "A",
    recordName: "website",
    value: "161.35.206.64",
    ttl: 3600,
    id: "1762512106",
  },
  {
    type: "A",
    recordName: "listmonk",
    value: platformOutputs.loadBalancerIp as pulumi.Output<string>,
    ttl: 3600,
    id: "1762904294",
  },
  {
    type: "CNAME",
    recordName: "newsletter-files",
    value: "democracy-newsletter.fra1.cdn.digitaloceanspaces.com.",
    ttl: 3600,
    id: "1762913181",
  },
  // Google verification
  {
    type: "TXT",
    recordName: "@",
    value:
      "google-site-verification=9uoux3a7RTacinXBi5NHOgqa_TX-j6Yl07zeQ3k3whc",
    ttl: 3600,
    id: "58758694",
  },
  {
    type: "TXT",
    recordName: "@",
    value:
      "google-site-verification=aGopIWHEXUBiJKifY3TAZxxFKknOTUoDzO9vuW2apw8",
    ttl: 60,
    id: "116836878",
  },
];

// Create DNS records
export const dnsRecordResources = dnsRecords.map((record, index) =>
  createDnsRecord({
    ...record,
    domainName,
    name:
      record.recordName === "@" && record.type === "TXT"
        ? `${domainName}-google-verification-${index > 13 ? "2" : "1"}`
        : undefined,
  })
);

// Export domain for cross-stack references
export const democracyAppDeOutputs = {
  domainName: democracyAppDe.name,
  domainUrn: democracyAppDe.urn,
  // DNS records are available in dnsRecordResources array
  dnsRecords: dnsRecordResources,
};
