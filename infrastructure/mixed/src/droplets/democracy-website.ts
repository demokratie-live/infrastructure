import * as digitalocean from "@pulumi/digitalocean";
import { websiteVpc } from "../foundation-stack-refs";

export const democracyWebsiteDroplet = new digitalocean.Droplet(
  "democracy-website",
  {
    name: "democracy-website",
    image: "ubuntu-24-10-x64",
    region: digitalocean.Region.FRA1,
    size: "s-1vcpu-2gb",
    backups: true,
    monitoring: true,
    vpcUuid: websiteVpc.id,
    tags: ["democracy", "website"],
  },
  {
    protect: true,
  }
);
