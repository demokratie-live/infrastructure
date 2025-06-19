import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

// Get stack configuration
const config = new pulumi.Config();
const stackName = pulumi.getStack();

// Stack-specific firewall configurations
const firewallConfig: Record<
  string,
  {
    k8sPublicAccess: {
      name: string;
      tags: string[];
      importId?: string;
    };
    k8sWorker: {
      name: string;
      tags: string[];
      importId?: string;
    };
  }
> = {
  prod: {
    k8sPublicAccess: {
      name: "k8s-public-access-47f41c0b-f8b6-4c32-9364-c6f6beed456e",
      tags: ["k8s:47f41c0b-f8b6-4c32-9364-c6f6beed456e"],
      importId: config.get("firewallK8sPublicAccessImportId") || undefined,
    },
    k8sWorker: {
      name: "k8s-47f41c0b-f8b6-4c32-9364-c6f6beed456e-worker",
      tags: ["k8s:47f41c0b-f8b6-4c32-9364-c6f6beed456e"],
      importId: config.get("firewallK8sWorkerImportId") || undefined,
    },
  },
  dev: {
    k8sPublicAccess: {
      name:
        config.get("firewallK8sPublicAccessName") ||
        `k8s-public-access-${stackName}`,
      tags: [config.get("firewallK8sPublicAccessTag") || `k8s:${stackName}`],
      importId: config.get("firewallK8sPublicAccessImportId") || undefined,
    },
    k8sWorker: {
      name: config.get("firewallK8sWorkerName") || `k8s-${stackName}-worker`,
      tags: [config.get("firewallK8sWorkerTag") || `k8s:${stackName}`],
      importId: config.get("firewallK8sWorkerImportId") || undefined,
    },
  },
};

// Get current stack config
const currentConfig = firewallConfig[stackName] || firewallConfig.dev;

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
