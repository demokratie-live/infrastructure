import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

export const democracyAppDe = new digitalocean.Domain(
  "democracy-app.de",
  {
    name: "democracy-app.de",
  },
  {
    protect: true,
  }
);
