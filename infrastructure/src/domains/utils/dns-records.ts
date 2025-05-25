import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

// DNS Records Configuration
export interface DnsRecordConfig {
  type: string;
  recordName: string;
  value: string | pulumi.Output<string>;
  ttl?: number;
  id?: string;
  name?: string;
}

interface DNSRecordConfigForDomain extends DnsRecordConfig {
  domainName: string;
}

export const generateName = ({
  recordName,
  type,
  domainName,
}: {
  recordName: string;
  type: string;
  domainName: string;
}) => {
  let sanitizedRecordName = recordName;

  // Handle special cases
  if (recordName === "@") {
    sanitizedRecordName = "root";
  } else if (recordName.startsWith("*.")) {
    sanitizedRecordName = `star-${recordName.substring(2)}`;
  } else {
    sanitizedRecordName = recordName.replace(/\./g, "-");
  }

  return `${domainName}-${sanitizedRecordName}-${type.toLowerCase()}`;
};

// Create DNS records from configuration
export const createDnsRecord = (config: DNSRecordConfigForDomain) => {
  const name = generateName({
    recordName: config.recordName,
    type: config.type,
    domainName: config.domainName,
  });
  const baseOptions: pulumi.CustomResourceOptions = { protect: true };

  return new digitalocean.DnsRecord(
    config.name ?? name,
    {
      domain: config.domainName,
      type: config.type,
      name: config.recordName,
      value: config.value,
      ttl: config.ttl ?? 3601,
    },
    {
      ...baseOptions,
      import: config.id ? `${config.domainName},${config.id}` : undefined,
    }
  );
};
