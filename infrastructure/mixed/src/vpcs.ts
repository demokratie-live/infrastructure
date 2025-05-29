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
  }
);
