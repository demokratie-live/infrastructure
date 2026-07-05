import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

export interface BaseConfig {
  region: digitalocean.Region;
  environment: string;
  tags: string[];
  team: string;
  managedBy: string;
}

export const getBaseConfig = (): BaseConfig => {
  const config = new pulumi.Config();
  const environment = config.require("environment");

  return {
    region:
      (config.get("region") as digitalocean.Region) || digitalocean.Region.FRA1,
    environment,
    tags: config.getObject<string[]>("tags") || ["democracy", environment],
    team: config.get("team") || "democracy",
    managedBy: config.get("managedBy") || "pulumi",
  };
};

export const createBaseTags = (additionalTags: string[] = []): string[] => {
  const baseConfig = getBaseConfig();
  return [...baseConfig.tags, ...additionalTags];
};

export const createResourceTags = (
  resourceType: string,
  additionalTags: Record<string, string> = {}
): Record<string, string> => {
  const baseConfig = getBaseConfig();

  return {
    team: baseConfig.team,
    environment: baseConfig.environment,
    "managed-by": baseConfig.managedBy,
    "resource-type": resourceType,
    ...additionalTags,
  };
};
