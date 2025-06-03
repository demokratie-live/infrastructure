import * as digitalocean from "@pulumi/digitalocean";

// Default VPC for fra1 region
export const defaultFra1Vpc = new digitalocean.Vpc(
  "default-fra1",
  {
    name: "default-fra1",
    region: digitalocean.Region.FRA1,
    ipRange: "10.135.0.0/16",
  },
  {
    protect: true,
    import: "fa3eddc8-dc84-11e8-8b13-3cfdfea9f160",
  }
);

// Website VPC
export const websiteVpc = new digitalocean.Vpc(
  "website",
  {
    name: "website",
    region: digitalocean.Region.FRA1,
    ipRange: "10.114.16.0/20",
  },
  {
    protect: true,
    import: "ae417d56-f22a-4590-bcc3-224b5645ae11",
  }
);

// Kubernetes test VPC
export const kubernetesTestVpc = new digitalocean.Vpc(
  "kubernetes-test",
  {
    name: "kubernetes-test",
    description:
      "this private network is for testing the first Kubernetes structure",
    region: digitalocean.Region.FRA1,
    ipRange: "10.114.0.0/20",
  },
  {
    protect: true,
    import: "64d3d4fa-f217-4832-8201-627bdd37690c",
  }
);

// Export VPC IDs for cross-stack references
export const vpcOutputs = {
  defaultFra1VpcId: defaultFra1Vpc.id,
  websiteVpcId: websiteVpc.id,
  kubernetesTestVpcId: kubernetesTestVpc.id,
};
