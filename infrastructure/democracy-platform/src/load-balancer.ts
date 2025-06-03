import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import { cluster } from "./kubernetes-cluster";
import { vpcOutputs } from "./foundation-stack-refs";

// Get project dynamically to avoid circular dependencies
const config = new pulumi.Config();
const projectName = config.require("projectName");
const project = digitalocean.getProject({ name: projectName });

export const loadBalancer = new digitalocean.LoadBalancer(
  "load-balancer",
  {
    dropletIds: cluster.nodePool.nodes.apply(nodes =>
      nodes.map(node => Number(node.dropletId))
    ),
    enableProxyProtocol: true,
    forwardingRules: [
      {
        entryPort: 443,
        entryProtocol: "tcp",
        targetPort: 31713,
        targetProtocol: "tcp",
      },
      {
        entryPort: 80,
        entryProtocol: "tcp",
        targetPort: 32263,
        targetProtocol: "tcp",
      },
    ],
    healthcheck: {
      checkIntervalSeconds: 3,
      path: "/healthz",
      port: 31220,
      protocol: "http",
    },
    httpIdleTimeoutSeconds: 60,
    name: "a3c41d38353c14b6f879aa95e2d558a9",
    projectId: project.then(p => p.id),
    region: digitalocean.Region.FRA1,
    sizeUnit: 1,
    type: "REGIONAL",
    vpcUuid: vpcOutputs.mainVpcId,
  },
  {
    protect: true,
  }
);

// Export für Cross-Stack-Zugriff
export const loadBalancerId = loadBalancer.id;
export const loadBalancerIp = loadBalancer.ip;
