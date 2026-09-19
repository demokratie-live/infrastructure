import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

// Get stack configuration
const config = new pulumi.Config();
const stackName = pulumi.getStack();

// Stack-specific firewall configurations - fully config-driven
const getFirewallConfig = () => ({
  k8sPublicAccess: {
    name: config.require("firewallK8sPublicAccessName"),
    tags: [config.require("firewallK8sPublicAccessTag")],
    importId: config.get("firewallK8sPublicAccessImportId") || undefined,
  },
  k8sWorker: {
    name: config.require("firewallK8sWorkerName"),
    tags: [config.require("firewallK8sWorkerTag")],
    importId: config.get("firewallK8sWorkerImportId") || undefined,
  },
});

// Get current stack config
const currentConfig = getFirewallConfig();

// k8s-public-access firewall
export const k8sPublicAccessFirewall = new digitalocean.Firewall(
  "k8s-public-access",
  {
    name: currentConfig.k8sPublicAccess.name,
    inboundRules: [],
    outboundRules: [
      {
        protocol: "icmp",
        destinationAddresses: ["0.0.0.0/0", "::/0"],
      },
      {
        protocol: "tcp",
        portRange: "all",
        destinationAddresses: ["0.0.0.0/0", "::/0"],
      },
      {
        protocol: "udp",
        portRange: "all",
        destinationAddresses: ["0.0.0.0/0", "::/0"],
      },
    ],
    tags: currentConfig.k8sPublicAccess.tags,
  },
  {
    protect: stackName === "prod",
    ...(currentConfig.k8sPublicAccess.importId && {
      import: currentConfig.k8sPublicAccess.importId,
    }),
  }
);

// k8s worker firewall
export const k8sWorkerFirewall = new digitalocean.Firewall(
  "k8s-worker",
  {
    name: currentConfig.k8sWorker.name,
    inboundRules: [
      {
        protocol: "icmp",
        sourceAddresses: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
      },
      {
        protocol: "tcp",
        portRange: "all",
        sourceAddresses: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
      },
      {
        protocol: "udp",
        portRange: "all",
        sourceAddresses: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
      },
    ],
    outboundRules: [
      {
        protocol: "icmp",
        destinationAddresses: ["0.0.0.0/0"],
      },
      {
        protocol: "tcp",
        portRange: "all",
        destinationAddresses: ["0.0.0.0/0"],
      },
      {
        protocol: "udp",
        portRange: "all",
        destinationAddresses: ["0.0.0.0/0"],
      },
    ],
    tags: currentConfig.k8sWorker.tags,
  },
  {
    protect: stackName === "prod",
    ...(currentConfig.k8sWorker.importId && {
      import: currentConfig.k8sWorker.importId,
    }),
  }
);

// Export firewall outputs for other projects to reference
export const firewallOutputs = {
  k8sPublicAccessFirewallId: k8sPublicAccessFirewall.id,
  k8sPublicAccessFirewallUrn: k8sPublicAccessFirewall.urn,
  k8sWorkerFirewallId: k8sWorkerFirewall.id,
  k8sWorkerFirewallUrn: k8sWorkerFirewall.urn,
};
