import * as digitalocean from "@pulumi/digitalocean";

// democracy-app.de domain
export const democracyAppDe = new digitalocean.Domain(
  "democracy-app.de",
  {
    name: "democracy-app.de",
  },
  {
    protect: true,
    import: "democracy-app.de",
  }
);

// bundestag.io domain
export const bundestagIo = new digitalocean.Domain(
  "bundestag.io",
  {
    name: "bundestag.io",
  },
  {
    protect: true,
    import: "bundestag.io",
  }
);

// democracy-deutschland.de domain
export const democracyDeutschlandDe = new digitalocean.Domain(
  "democracy-deutschland.de",
  {
    name: "democracy-deutschland.de",
  },
  {
    protect: true,
    import: "democracy-deutschland.de",
  }
);

// Export domain outputs for other projects to reference
export const domainOutputs = {
  democracyAppDe: {
    name: democracyAppDe.name,
    urn: democracyAppDe.urn,
  },
  bundestagIo: {
    name: bundestagIo.name,
    urn: bundestagIo.urn,
  },
  democracyDeutschlandDe: {
    name: democracyDeutschlandDe.name,
    urn: democracyDeutschlandDe.urn,
  },
};
