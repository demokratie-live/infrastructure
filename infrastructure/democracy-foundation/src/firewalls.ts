import * as digitalocean from "@pulumi/digitalocean";

// k8s-public-access firewall
export const k8sPublicAccessFirewall = new digitalocean.Firewall(
  "k8s-public-access",
  {
    name: "k8s-public-access-47f41c0b-f8b6-4c32-9364-c6f6beed456e",
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
    tags: ["k8s:47f41c0b-f8b6-4c32-9364-c6f6beed456e"],
  },
  {
    protect: true,
    import: "79db9db7-6f38-4cf5-bb61-fd9f6eabac1f",
  }
);

// k8s worker firewall
export const k8sWorkerFirewall = new digitalocean.Firewall(
  "k8s-worker",
  {
    name: "k8s-47f41c0b-f8b6-4c32-9364-c6f6beed456e-worker",
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
    tags: ["k8s:47f41c0b-f8b6-4c32-9364-c6f6beed456e"],
  },
  {
    protect: true,
    import: "3f0125df-c4b9-451a-9acf-9605963c953e",
  }
);

// Export firewall IDs for cross-stack references
export const firewallOutputs = {
  k8sPublicAccessFirewallId: k8sPublicAccessFirewall.id,
  k8sWorkerFirewallId: k8sWorkerFirewall.id,
};
