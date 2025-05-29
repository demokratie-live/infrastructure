import * as pulumi from "@pulumi/pulumi";
import "./projects/team-democracy";
import "./kubernetes-cluster";
import "./load-balancer";
import "./droplets/democracy-website";

// Import foundation stack references to ensure dependency
import "./foundation-stack-refs";
