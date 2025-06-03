import { cluster } from "./kubernetes-cluster";
import { loadBalancer } from "./load-balancer";
import { teamDemocracy } from "./projects/team-democracy";
import { exportStackHealth } from "../../shared/src/monitoring";

// Import foundation stack references to ensure dependency
import "./foundation-stack-refs";

// Collect all resources for monitoring
const allResources = [cluster, loadBalancer, teamDemocracy];

// Export stack health monitoring
export const stackHealth = exportStackHealth(allResources);

// Export platform resources for other stacks to consume
export { cluster, kubeconfig, endpoint, clusterId } from "./kubernetes-cluster";
export { loadBalancer, loadBalancerId, loadBalancerIp } from "./load-balancer";
export { teamDemocracy } from "./projects/team-democracy";
