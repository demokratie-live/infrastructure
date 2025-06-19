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
  dnsRecords?: Array<{
    name: string;
    type: string;
    value: string;
    ttl: number;
    importId: string;
  }>;
}

interface StackManagedRecord {
  recordName: string;
  type: string;
  managedByStack: string;
  id: pulumi.Output<string>;
}

interface EnvironmentDnsRecords {
  democracyAppDe: {
    dnsRecords: digitalocean.DnsRecord[];
    stackManagedRecords: StackManagedRecord[];
  };
  democracyDeutschlandDe?: {
    dnsRecords: digitalocean.DnsRecord[];
    stackManagedRecords: StackManagedRecord[];
  };
}

export function createEnvironmentDnsRecords(
  config: DnsRecordConfig
): EnvironmentDnsRecords {
  const { environment, dnsRecords: configDnsRecords, platformOutputs } = config;

  const dnsRecords: digitalocean.DnsRecord[] = [];
  const stackManagedRecords: StackManagedRecord[] = [];

  // Get DNS records from Pulumi config if available
  const pulumiConfig = new pulumi.Config();
  const configDnsRecordsRaw = pulumiConfig.getObject("dnsRecords");

  let stackDnsRecords: Array<{
    name: string;
    type: string;
    value: string;
    ttl: number;
    importId: string;
  }> = [];

  if (configDnsRecords) {
    stackDnsRecords = configDnsRecords;
  } else if (configDnsRecordsRaw) {
    // Handle the case where Pulumi wraps the array in a {value: [...]} object
    const recordsConfig = configDnsRecordsRaw as
      | { value?: unknown }
      | unknown[];
    let recordsArray: unknown;

    if (Array.isArray(recordsConfig)) {
      recordsArray = recordsConfig;
    } else if (
      recordsConfig &&
      typeof recordsConfig === "object" &&
      "value" in recordsConfig
    ) {
      recordsArray = recordsConfig.value;
    }

    if (Array.isArray(recordsArray)) {
      stackDnsRecords = recordsArray as Array<{
        name: string;
        type: string;
        value: string;
        ttl: number;
        importId: string;
      }>;
    } else {
      console.warn(
        `DNS records configuration is not an array for stack: ${environment}`
      );
    }
  } else {
    console.warn(
      `No DNS records configuration found for stack: ${environment}`
    );
  }

  // Create DNS records based on environment and configuration
  stackDnsRecords.forEach(recordConfig => {
    const recordName = `democracy-app.de-${recordConfig.name.replace(/[@.]/g, "-")}-${recordConfig.type.toLowerCase()}`;

    // Determine the IP value - use load balancer IP if specified
    const recordValue =
      recordConfig.value === "LOAD_BALANCER_IP"
        ? platformOutputs.loadBalancerIp
        : recordConfig.value;

    const dnsRecord = new digitalocean.DnsRecord(
      recordName,
      {
        domain: "democracy-app.de",
        type: recordConfig.type,
        name: recordConfig.name,
        value: recordValue,
        ttl: recordConfig.ttl,
      },
      {
        import: `democracy-app.de,${recordConfig.importId}`,
      }
    );

    dnsRecords.push(dnsRecord);

    stackManagedRecords.push({
      recordName: recordConfig.name,
      type: recordConfig.type,
      managedByStack: environment,
      id: dnsRecord.id,
    });
  });

  return {
    democracyAppDe: {
      dnsRecords,
      stackManagedRecords,
    },
  };
}
