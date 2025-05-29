import * as pulumi from "@pulumi/pulumi";
import "./droplets/democracy-website";

// Import foundation stack references to ensure dependency
import "./foundation-stack-refs";

// Export web application resources for other stacks to consume
export {
  democracyWebsiteDroplet,
  democracyWebsiteDropletId,
  democracyWebsiteDropletIpv4Address,
} from "./droplets/democracy-website";
