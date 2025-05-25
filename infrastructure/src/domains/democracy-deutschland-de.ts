import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

export const democracyDeutschlandDe = new digitalocean.Domain(
  "democracy-deutschland.de",
  {
    name: "democracy-deutschland.de",
  },
  {
    protect: true,
  }
);
