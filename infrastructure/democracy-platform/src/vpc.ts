import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

// Load configuration values
const config = new pulumi.Config();

// Get environment and VPC configuration from Pulumi config
const environment = config.get("environment") || "production";
const vpcName = config.require("vpcName");
const vpcIpRange = config.require("vpcIpRange");
const vpcDescription = config.get("vpcDescription") || "";
const vpcImportId = config.get("vpcImportId"); // Optional for import

// Environment-based settings
const isProduction = environment === "production";
const resourceProtection = isProduction;

// Create or import VPC based on configuration
export const platformVpc = new digitalocean.Vpc(
  vpcName,
  {
    name: vpcName,
    region: digitalocean.Region.FRA1,
    ipRange: vpcIpRange,
    ...(vpcDescription && { description: vpcDescription }),
  },
  {
    protect: resourceProtection,
    // Import if importId is provided
    ...(vpcImportId && { import: vpcImportId }),
  }
);

// Export VPC information for use in other resources
export const vpcOutputs = {
  vpcId: platformVpc.id,
  vpcUrn: platformVpc.urn,
  vpcName: platformVpc.name,
  vpcIpRange: platformVpc.ipRange,
};
