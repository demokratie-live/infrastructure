import * as pulumi from "@pulumi/pulumi";
import { vpcOutputs } from "./vpcs";
import { firewallOutputs } from "./firewalls";
import { bundestagIoOutputs } from "./domains/bundestag-io";
import { democracyDeutschlandDeOutputs } from "./domains/democracy-deutschland-de";
import { democracyAppDeOutputs } from "./domains/democracy-app-de";

// Export all outputs for cross-stack references
export { vpcOutputs, firewallOutputs };
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
