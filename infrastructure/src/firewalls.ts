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
  }
);

// SSH-only firewall
export const onlySSHFirewall = new digitalocean.Firewall(
  "only-ssh",
  {
    name: "onlySSH",
    inboundRules: [
      {
        protocol: "tcp",
        portRange: "22",
        sourceAddresses: ["0.0.0.0/0", "::/0"],
      },
    ],
    outboundRules: [],
  },
  {
    protect: true,
  }
);

// Search production firewall
export const searchProductionFirewall = new digitalocean.Firewall(
  "search-production",
  {
    name: "search-production",
    inboundRules: [
      {
        protocol: "tcp",
        portRange: "22",
        sourceAddresses: ["0.0.0.0/0", "::/0"],
      },
      {
        protocol: "tcp",
        portRange: "80",
      },
      {
        protocol: "tcp",
        portRange: "9200",
      },
      {
        protocol: "tcp",
        portRange: "9300",
      },
      {
        protocol: "udp",
        portRange: "9200",
      },
      {
        protocol: "udp",
        portRange: "9300",
      },
    ],
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
  },
  {
    protect: true,
  }
);

// Search beta firewall
export const searchBetaFirewall = new digitalocean.Firewall(
  "search-beta",
  {
    name: "search-beta",
    inboundRules: [
      {
        protocol: "tcp",
        portRange: "22",
        sourceAddresses: ["0.0.0.0/0", "::/0"],
      },
      {
        protocol: "tcp",
        portRange: "80",
      },
      {
        protocol: "tcp",
        portRange: "9200",
      },
      {
        protocol: "tcp",
        portRange: "9300",
      },
      {
        protocol: "udp",
        portRange: "9200",
      },
      {
        protocol: "udp",
        portRange: "9300",
      },
    ],
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
  },
  {
    protect: true,
  }
);

// Search alpha firewall
export const searchAlphaFirewall = new digitalocean.Firewall(
  "search-alpha",
  {
    name: "search-alpha",
    inboundRules: [
      {
        protocol: "tcp",
        portRange: "22",
        sourceAddresses: ["0.0.0.0/0", "::/0"],
      },
      {
        protocol: "tcp",
        portRange: "80",
      },
      {
        protocol: "tcp",
        portRange: "80",
      },
      {
        protocol: "tcp",
        portRange: "9200",
      },
      {
        protocol: "tcp",
        portRange: "9200",
      },
      {
        protocol: "tcp",
        portRange: "9300",
      },
      {
        protocol: "tcp",
        portRange: "9300",
      },
      {
        protocol: "udp",
        portRange: "9200",
      },
      {
        protocol: "udp",
        portRange: "9200",
      },
      {
        protocol: "udp",
        portRange: "9300",
      },
      {
        protocol: "udp",
        portRange: "9300",
      },
    ],
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
  },
  {
    protect: true,
  }
);
