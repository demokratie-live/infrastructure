import { cluster } from "./kubernetes-cluster";
import { loadBalancer } from "./load-balancer";
import { teamDemocracy } from "./projects/team-democracy";
import { platformVpc } from "./vpc";
import { exportStackHealth } from "../../shared/src/monitoring";

// Collect all resources for monitoring
const allResources = [cluster, loadBalancer, teamDemocracy, platformVpc];

// Export stack health monitoring
export const stackHealth = exportStackHealth(allResources);

// Export platform resources for other stacks to consume
export { cluster, kubeconfig, endpoint, clusterId } from "./kubernetes-cluster";
export { loadBalancer, loadBalancerId, loadBalancerIp } from "./load-balancer";
export { teamDemocracy } from "./projects/team-democracy";
export { platformVpc, vpcOutputs } from "./vpc";
export { firewallOutputs } from "./firewalls";
