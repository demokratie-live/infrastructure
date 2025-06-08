/**
 * DNS Records management using Stack References
 *
 * This module creates environment-specific DNS records for domains that are
 * managed in the infrastructure-base project. It uses stack references to
 * get domain information and creates only the necessary DNS records.
 */

import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

interface DomainOutput {
  name: pulumi.Output<string>;
  urn: pulumi.Output<string>;
}

interface PlatformOutputs {
  loadBalancerIp: pulumi.Output<string>;
  loadBalancerId: pulumi.Output<string>;
}

interface DnsRecordConfig {
  democracyAppDomain: pulumi.Output<DomainOutput>;
  democracyDeutschlandDomain: pulumi.Output<DomainOutput>;
  bundestagIoDomain: pulumi.Output<DomainOutput>;
  environment: string;
  platformOutputs: PlatformOutputs;
}

interface EnvironmentDnsRecords {
  democracyAppDe: {
    dnsRecords: digitalocean.DnsRecord[];
    stackManagedRecords: digitalocean.DnsRecord[];
  };
  democracyDeutschlandDe?: {
    dnsRecords: digitalocean.DnsRecord[];
    stackManagedRecords: digitalocean.DnsRecord[];
  };
}

export function createEnvironmentDnsRecords(
  config: DnsRecordConfig
): EnvironmentDnsRecords {
  const { environment } = config; // platformOutputs nicht verwendet für Test

  const dnsRecords: digitalocean.DnsRecord[] = [];
  const stackManagedRecords: digitalocean.DnsRecord[] = [];

  // Environment-specific DNS records for democracy-app.de
  if (environment === "internal") {
    // Test with just one DNS record first
    const internalRecord = new digitalocean.DnsRecord(
      "democracy-app.de-internal-a",
      {
        domain: "democracy-app.de", // Hard-coded string
        type: "A",
        name: "internal",
        value: "174.138.102.21", // Hard-coded IP for import test
        ttl: 3601,
      },
      {
        import: "democracy-app.de,55308007", // domain,ID format
      }
    );

    dnsRecords.push(internalRecord);

    stackManagedRecords.push({
      recordName: "internal",
      type: "A",
      managedByStack: environment,
      id: internalRecord.id,
    });
  }

  return {
    democracyAppDe: {
      dnsRecords,
      stackManagedRecords,
    },
  };
}
