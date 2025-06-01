import * as pulumi from "@pulumi/pulumi";

export interface StackHealth {
  resourceCount: number;
  lastUpdated: string;
  version: string;
  project: string;
  stack: string;
}

export const createStackHealth = (resources: any[]): StackHealth => {
  const config = new pulumi.Config();

  return {
    resourceCount: resources.length,
    lastUpdated: new Date().toISOString(),
    version: config.get("version") || "1.0.0",
    project: pulumi.getProject(),
    stack: pulumi.getStack(),
  };
};

export const exportStackHealth = (resources: any[]) => {
  const health = createStackHealth(resources);
  return pulumi.output(health);
};
