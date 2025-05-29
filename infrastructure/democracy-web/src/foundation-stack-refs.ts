import * as pulumi from "@pulumi/pulumi";

// Import foundation stack to get shared VPCs and other foundation resources
const foundationStack = new pulumi.StackReference(
  "ManAnRuck/democracy-foundation/production"
);

// Export foundation resources for use in this stack
export const websiteVpcId = foundationStack
  .getOutput("websiteVpc")
  .apply((vpc: any) => vpc.id);
export const kubernetesVpcId = foundationStack
  .getOutput("kubernetesTestVpc")
  .apply((vpc: any) => vpc.id);
export const mongoFirewall = foundationStack.getOutput("mongoFirewall");
export const webFirewall = foundationStack.getOutput("webFirewall");
