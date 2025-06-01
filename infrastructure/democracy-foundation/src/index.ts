import * as pulumi from "@pulumi/pulumi";
import { vpcOutputs } from "./vpcs";
import { firewallOutputs } from "./firewalls";
import { bundestagIoOutputs } from "./domains/bundestag-io";
import { democracyDeutschlandDeOutputs } from "./domains/democracy-deutschland-de";
import { democracyAppDeOutputs } from "./domains/democracy-app-de";
import { platformOutputs } from "./platform-stack-refs";
import { exportStackHealth } from "../../shared/src/monitoring";

// Collect all resources for monitoring
const allResources = [
  // VPCs
  require("./vpcs").defaultFra1Vpc,
  require("./vpcs").websiteVpc,
  require("./vpcs").kubernetesTestVpc,
  // Firewalls
  require("./firewalls").k8sPublicAccessFirewall,
  require("./firewalls").k8sWorkerFirewall,
  // Domains
  require("./domains/bundestag-io").bundestagIo,
  require("./domains/democracy-deutschland-de").democracyDeutschlandDe,
  require("./domains/democracy-app-de").democracyAppDe,
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
export { defaultFra1Vpc, websiteVpc, kubernetesTestVpc } from "./vpcs";
export { k8sPublicAccessFirewall, k8sWorkerFirewall } from "./firewalls";
export { bundestagIo } from "./domains/bundestag-io";
export { democracyDeutschlandDe } from "./domains/democracy-deutschland-de";
export { democracyAppDe } from "./domains/democracy-app-de";
