import * as pulumi from "@pulumi/pulumi";

// Get configuration to determine which foundation stack to reference
const config = new pulumi.Config();
const environment = config.get("environment") || "dev";

// Create stack reference to democracy-foundation
const foundationStackName = `ManAnRuck/democracy-foundation/${environment}`;
const foundationStack = new pulumi.StackReference(foundationStackName);

// Export VPC references
export const defaultFra1Vpc = {
  id: foundationStack
    .getOutput("vpcOutputs")
    .apply((outputs: any) => outputs.defaultFra1VpcId),
};

export const websiteVpc = {
  id: foundationStack
    .getOutput("vpcOutputs")
    .apply((outputs: any) => outputs.websiteVpcId),
};

export const kubernetesTestVpc = {
  id: foundationStack
    .getOutput("vpcOutputs")
    .apply((outputs: any) => outputs.kubernetesTestVpcId),
};

// Export firewall references
export const k8sPublicAccessFirewall = {
  id: foundationStack
    .getOutput("firewallOutputs")
    .apply((outputs: any) => outputs.k8sPublicAccessFirewallId),
};

export const k8sWorkerFirewall = {
  id: foundationStack
    .getOutput("firewallOutputs")
    .apply((outputs: any) => outputs.k8sWorkerFirewallId),
};

// Export domain references
export const bundestagIo = {
  name: foundationStack
    .getOutput("bundestagIoOutputs")
    .apply((outputs: any) => outputs.domainName),
};

export const democracyDeutschlandDe = {
  name: foundationStack
    .getOutput("democracyDeutschlandDeOutputs")
    .apply((outputs: any) => outputs.domainName),
};

export const democracyAppDe = {
  name: foundationStack
    .getOutput("democracyAppDeOutputs")
    .apply((outputs: any) => outputs.domainName),
};
