import * as digitalocean from "@pulumi/digitalocean";

const domainName = "bundestag.io";

export const bundestagIo = new digitalocean.Domain(
  domainName,
  {
    name: domainName,
  },
  {
    protect: true,
    import: domainName,
  }
);

// Export domain for cross-stack references
export const bundestagIoOutputs = {
  domainName: bundestagIo.name,
  domainUrn: bundestagIo.urn,
};
