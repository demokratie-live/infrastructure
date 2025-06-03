import { createFoundationReference } from "../../shared/src/stack-refs";

/**
 * Foundation stack references for accessing shared infrastructure resources
 * Created by: democracy-foundation project
 * Consumed by: democracy-platform project
 */

// Reference to the foundation stack using shared utility
const foundationStackRef = createFoundationReference("production");

// VPC outputs from foundation
export const vpcOutputs = {
  mainVpc: foundationStackRef.getOutput("mainVpc"),
  mainVpcId: foundationStackRef.getOutput("mainVpcId"),
};

// Firewall outputs from foundation
export const firewallOutputs = {
  kubernetesFirewall: foundationStackRef.getOutput("kubernetesFirewall"),
  kubernetesFirewallId: foundationStackRef.getOutput("kubernetesFirewallId"),
  webServerFirewall: foundationStackRef.getOutput("webServerFirewall"),
  webServerFirewallId: foundationStackRef.getOutput("webServerFirewallId"),
};

// Domain outputs from foundation
export const domainOutputs = {
  democracyAppDomain: foundationStackRef.getOutput("democracyAppDomain"),
  democracyApiDomain: foundationStackRef.getOutput("democracyApiDomain"),
  bundestagioDomain: foundationStackRef.getOutput("bundestagioDomain"),
  bundestagioAdminDomain: foundationStackRef.getOutput(
    "bundestagioAdminDomain"
  ),
  bundestagioDipDomain: foundationStackRef.getOutput("bundestagioDipDomain"),
};
