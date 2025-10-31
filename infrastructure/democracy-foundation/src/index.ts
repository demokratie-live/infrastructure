import * as pulumi from "@pulumi/pulumi";
import { StackReference } from "@pulumi/pulumi";
import { createAllDomainsDnsRecords } from "./dns-records-all-domains";

// Get the current stack name to determine environment
const currentStack = pulumi.getStack();

// Create a stack reference to the infrastructure-base project for domain dependencies
const infrastructureBaseStackRef = new StackReference(
  `ManAnRuck/infrastructure-base/prod`
);

// Create a stack reference to the democracy-platform project for load balancer IP
// Note: Using prod stack for load balancer reference as it's the only one currently deployed
const platformStackRef = new StackReference(
  currentStack === "prod"
    ? `ManAnRuck/democracy-platform/${currentStack}`
    : `ManAnRuck/democracy-platform/prod` // Fallback to prod for other environments
);

// Create DNS records based on Pulumi configuration
const dnsRecords = createAllDomainsDnsRecords(platformStackRef);

// Export outputs
export const dnsRecordsCount = dnsRecords.length;
export const createdDnsRecords = dnsRecords.map((record, index) => ({
  id: record.id,
  fqdn: record.fqdn,
  name: `dns-record-${index}`,
}));

// Export infrastructure dependencies for reference
export const infrastructureDependencies = {
  domains: infrastructureBaseStackRef.getOutput("domainOutputs"),
  loadBalancer: platformStackRef.getOutput("loadBalancerIp"),
};
