import * as digitalocean from "@pulumi/digitalocean";

const domainName = "democracy-app.de";

export const democracyAppDe = new digitalocean.Domain(
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
export const democracyAppDeOutputs = {
  domainName: democracyAppDe.name,
  domainUrn: democracyAppDe.urn,
};
