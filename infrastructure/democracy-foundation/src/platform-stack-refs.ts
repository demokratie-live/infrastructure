import * as pulumi from "@pulumi/pulumi";

// Reference to the democracy-platform stack to get load balancer IP
const platformStackRef = new pulumi.StackReference(
  "ManAnRuck/democracy-platform/prod"
);

// Platform stack outputs
export const platformOutputs = {
  loadBalancerIp: platformStackRef.getOutput("loadBalancerIp"),
  loadBalancerId: platformStackRef.getOutput("loadBalancerId"),
};
