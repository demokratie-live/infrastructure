import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import { clusterId } from "../kubernetes-cluster";
import { bundestagIo } from "../domains/bundestag-io";
import { democracyAppDe } from "../domains/democracy-app-de";
import { democracyDeutschlandDe } from "../domains/democracy-deutschland-de";

// Load configuration values
const config = new pulumi.Config();
const projectName = config.require("projectName");
const environment = config.require("environment");
const description =
  config.get("description") || "Democracy project infrastructure";
const isDefault = config.getBoolean("isDefault") || true;

export const teamDemocracy = new digitalocean.Project(
  "team-democracy",
  {
    description,
    environment,
    isDefault,
    name: projectName,
    resources: [
      pulumi.interpolate`do:domain:${bundestagIo.name}`,
      pulumi.interpolate`do:domain:${democracyAppDe.name}`,
      pulumi.interpolate`do:domain:${democracyDeutschlandDe.name}`,
      pulumi.interpolate`do:kubernetes:${clusterId}`,
      "do:space:democracy",
      "do:space:democracy-develop-terraform-state",
      "do:space:democracy-newsletter",
      "do:space:mbackups-internal",
      "do:volumesnapshot:0b72f032-9ccd-11ea-9aea-0a58ac14d0a1",
      "do:volumesnapshot:18dcf89c-824c-11ea-9e2c-0a58ac14d166",
      "do:volumesnapshot:3a30f253-ae1c-11ea-b929-0a58ac14d014",
      "do:volumesnapshot:4230d2e3-9377-11ea-aed1-0a58ac14d008",
      "do:volumesnapshot:5546046d-95bc-11ea-9aea-0a58ac14d0a1",
      "do:volumesnapshot:7a2f9b3c-938b-11ea-aed1-0a58ac14d008",
      "do:volumesnapshot:874d94b0-7890-11ee-a8f4-0a58ac14db3c",
      "do:volumesnapshot:ab04ad39-9137-11ea-a72f-0a58ac14d106",
      "do:volumesnapshot:afcb0651-b6c9-11ea-a2bb-0a58ac14d176",
    ],
  },
  {
    protect: true,
  }
);
