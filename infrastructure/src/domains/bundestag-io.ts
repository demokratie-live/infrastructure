import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

export const bundestagIo = new digitalocean.Domain(
  "bundestag.io",
  {
    name: "bundestag.io",
  },
  {
    protect: true,
  }
);
