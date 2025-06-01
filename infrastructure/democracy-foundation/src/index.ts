import * as pulumi from "@pulumi/pulumi";
import {
  vpcOutputs,
  defaultFra1Vpc,
  websiteVpc,
  kubernetesTestVpc,
} from "./vpcs";
import {
  firewallOutputs,
  k8sPublicAccessFirewall,
  k8sWorkerFirewall,
} from "./firewalls";
import { bundestagIoOutputs, bundestagIo } from "./domains/bundestag-io";
import {
  democracyDeutschlandDeOutputs,
  democracyDeutschlandDe,
} from "./domains/democracy-deutschland-de";
import {
  democracyAppDeOutputs,
  democracyAppDe,
} from "./domains/democracy-app-de";
import { platformOutputs } from "./platform-stack-refs";
import { exportStackHealth } from "../../shared/src/monitoring";

// Collect all resources for monitoring
const allResources = [
  // VPCs
  defaultFra1Vpc,
  websiteVpc,
  kubernetesTestVpc,
  // Firewalls
  k8sPublicAccessFirewall,
  k8sWorkerFirewall,
  // Domains
  bundestagIo,
  democracyDeutschlandDe,
  democracyAppDe,
];

// Export stack health monitoring
export const stackHealth = exportStackHealth(allResources);

// Export all outputs for cross-stack references
export { vpcOutputs, firewallOutputs, platformOutputs };
export {
  bundestagIoOutputs,
  democracyDeutschlandDeOutputs,
  democracyAppDeOutputs,
};

// Export individual resources for easier reference
export { defaultFra1Vpc, websiteVpc, kubernetesTestVpc };
export { k8sPublicAccessFirewall, k8sWorkerFirewall };
export { bundestagIo };
export { democracyDeutschlandDe };
export { democracyAppDe };
