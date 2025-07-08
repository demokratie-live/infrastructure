/**
 * Enhanced DNS Records management for all domains
 *
 * This module creates environment-specific DNS records for all managed domains
 * using configuration from Pulumi stack files (no hardcoded configurations).
 */

import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

interface DnsRecord {
  domain: string;
  name: string;
  type: string;
  value: string;
  ttl: number;
  importId?: string;
}

/**
 * Creates DNS records for all domains based on Pulumi configuration
 */
export function createAllDomainsDnsRecords(
  platformStackRef: pulumi.StackReference
): digitalocean.DnsRecord[] {
  const config = new pulumi.Config();

  // Get DNS records from config - handle both direct array and {value: array} format
  const dnsRecordsRaw = config.getObject("dnsRecords");
  let dnsRecords: DnsRecord[];

  if (!dnsRecordsRaw) {
    console.warn("No DNS records configuration found");
    return [];
  }

  // Handle the case where Pulumi wraps the array in a {value: [...]} object
  if (Array.isArray(dnsRecordsRaw)) {
    dnsRecords = dnsRecordsRaw as DnsRecord[];
  } else if (
    dnsRecordsRaw &&
    typeof dnsRecordsRaw === "object" &&
    "value" in dnsRecordsRaw
  ) {
    const recordsConfig = dnsRecordsRaw as { value: unknown };
    if (Array.isArray(recordsConfig.value)) {
      dnsRecords = recordsConfig.value as DnsRecord[];
    } else {
      console.error("DNS records configuration value is not an array");
      return [];
    }
  } else {
    console.error("DNS records configuration is not in expected format");
    return [];
  }

  // Get load balancer IP from platform stack
  const loadBalancerIp = platformStackRef.getOutput("loadBalancerIp");

  // Group records by domain
  const recordsByDomain = dnsRecords.reduce(
    (acc, record) => {
      if (!acc[record.domain]) {
        acc[record.domain] = [];
      }
      acc[record.domain].push(record);
      return acc;
    },
    {} as Record<string, DnsRecord[]>
  );

  const createdRecords: digitalocean.DnsRecord[] = [];

  // Create DNS records for each domain
  Object.entries(recordsByDomain).forEach(([, records]) => {
    records.forEach(record => {
      // Use old naming convention to match existing resources exactly
      let resourceName: string;
      if (record.name === "@") {
        resourceName = `${record.domain}---${record.type.toLowerCase()}`;
      } else {
        // Replace dots with dashes for resource names (but keep original name for DNS)
        const sanitizedName = record.name.replace(/\./g, "-");
        resourceName = `${record.domain}-${sanitizedName}-${record.type.toLowerCase()}`;
      }

      // Resolve the value - if it's "LOAD_BALANCER_IP", use the load balancer IP
      const resolvedValue =
        record.value === "LOAD_BALANCER_IP" ? loadBalancerIp : record.value;

      const dnsRecordOptions: digitalocean.DnsRecordArgs = {
        domain: record.domain,
        name: record.name,
        type: record.type,
        value: resolvedValue,
        ttl: record.ttl,
      };

      // Generate import property from domain and importId if importId is provided
      const importProperty = record.importId
        ? `${record.domain},${record.importId}`
        : undefined;

      // Create the resource with import option if available
      const dnsRecord = new digitalocean.DnsRecord(
        resourceName,
        dnsRecordOptions,
        {
          import: importProperty,
        }
      );

      createdRecords.push(dnsRecord);

      // Log import information for debugging
      if (importProperty) {
        console.log(
          `Importing DNS record: ${resourceName} with import ID: ${importProperty}`
        );
      }
    });
  });

  return createdRecords;
}
