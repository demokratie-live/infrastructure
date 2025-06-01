import * as pulumi from "@pulumi/pulumi";
import { createPlatformReference } from "../../shared/src/stack-refs";

// Reference to the democracy-platform stack to get load balancer IP
const platformStackRef = createPlatformReference("prod");

// Platform stack outputs
export const platformOutputs = {
  loadBalancerIp: platformStackRef.getOutput("loadBalancerIp"),
  loadBalancerId: platformStackRef.getOutput("loadBalancerId"),
};
