import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import { kubernetesTestVpc } from "./vpcs"; // or "./path/to/your/vpc/module"

// Load configuration values
const config = new pulumi.Config();

// Configurable Kubernetes cluster parameters
const kubernetesVersion = config.get("kubernetesVersion") || "1.30.10-do.1";
const autoUpgrade = config.getBoolean("autoUpgrade") ?? true;
const clusterName = config.get("clusterName") || "democracy";
const nodePoolSize = config.get("nodePoolSize") || "s-4vcpu-8gb";
const nodePoolCount = config.getNumber("nodePoolCount") || 1;
const clusterTags = config.getObject<string[]>("clusterTags") || [
  "kubernetes",
  "democracy",
];

// Validation
if (!kubernetesVersion.includes("do.")) {
  throw new Error(
    "Kubernetes version must be a valid DigitalOcean version (e.g., '1.30.10-do.1')"
  );
}

// EXISTIERENDEN Cluster importieren und managen
export const cluster = new digitalocean.KubernetesCluster(
  clusterName,
  {
    region: digitalocean.Region.FRA1,
    version: kubernetesVersion,
    autoUpgrade: autoUpgrade,
    nodePool: {
      name: "worker-pool-4c-6m",
      size: nodePoolSize,
      nodeCount: nodePoolCount,
    },
    tags: clusterTags,
    vpcUuid: kubernetesTestVpc.id,
  },
  {
    protect: true,
  }
);

// Exporte
export const kubeconfig = cluster.kubeConfigs[0].rawConfig;
export const endpoint = cluster.endpoint;
export const clusterId = cluster.id;
