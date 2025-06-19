import * as pulumi from "@pulumi/pulumi";
import { StackReference } from "@pulumi/pulumi";
import { createEnvironmentDnsRecords } from "./dns-records-stack-ref";
import { platformOutputs } from "./platform-stack-refs";

// Type definitions for infrastructure outputs
interface DomainOutput {
  name: pulumi.Output<string>;
  urn: pulumi.Output<string>;
}

interface DomainsOutput {
  democracyAppDe: DomainOutput;
  democracyDeutschlandDe: DomainOutput;
  bundestagIo: DomainOutput;
}

interface SharedInfrastructure {
  domains: DomainsOutput;
  vpcs: unknown;
  firewalls: unknown;
}

// Get the current stack name to determine environment
const currentStack = pulumi.getStack();

// Create a stack reference to the infrastructure-base project
const infraBaseStackRef = new StackReference(
  `ManAnRuck/infrastructure-base/prod`
);

// Get shared infrastructure outputs from the base stack
const sharedInfrastructure = infraBaseStackRef.getOutput(
  "sharedInfrastructure"
) as pulumi.Output<SharedInfrastructure>;
const sharedDomains = sharedInfrastructure.apply(
  (infra: SharedInfrastructure) => infra.domains
);

// Create environment-specific DNS records
const dnsRecords = createEnvironmentDnsRecords({
  democracyAppDomain: sharedDomains.apply(
    (domains: DomainsOutput) => domains.democracyAppDe
  ),
  democracyDeutschlandDomain: sharedDomains.apply(
    (domains: DomainsOutput) => domains.democracyDeutschlandDe
  ),
  bundestagIoDomain: sharedDomains.apply(
    (domains: DomainsOutput) => domains.bundestagIo
  ),
  environment: currentStack,
  platformOutputs,
});

// Export outputs
export const dnsRecordsOutputs = dnsRecords;
