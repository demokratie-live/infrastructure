import * as digitalocean from "@pulumi/digitalocean";
import { websiteVpcId } from "../foundation-stack-refs";

export const democracyWebsiteDroplet = new digitalocean.Droplet(
  "democracy-website-new",
  {
    name: "democracy-website-new",
    image: "ubuntu-24-10-x64",
    region: digitalocean.Region.FRA1,
    size: "s-1vcpu-2gb",
    backups: true,
    monitoring: true,
    vpcUuid: websiteVpcId,
    tags: ["democracy", "website", "phase-3"],
  },
  {
    protect: true,
  }
);

export const democracyWebsiteDropletId = democracyWebsiteDroplet.id;
export const democracyWebsiteDropletIpv4Address =
  democracyWebsiteDroplet.ipv4Address;
