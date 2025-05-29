import * as pulumi from "@pulumi/pulumi";
import "./kubernetes-cluster";
import "./load-balancer";
import "./projects/team-democracy";

// Import foundation stack references to ensure dependency
import "./foundation-stack-refs";

// Export platform resources for other stacks to consume
export { cluster, kubeconfig, endpoint, clusterId } from "./kubernetes-cluster";
export { loadBalancer, loadBalancerId, loadBalancerIp } from "./load-balancer";
export { teamDemocracy } from "./projects/team-democracy";
