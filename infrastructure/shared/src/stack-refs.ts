import * as pulumi from "@pulumi/pulumi";

// Standard pattern for cross-stack references
export const createStackReference = (project: string, stack: string) => {
  return new pulumi.StackReference(`ManAnRuck/${project}/${stack}`);
};

// Utility to get current stack name
export const getCurrentStack = (): string => {
  return pulumi.getStack();
};

// Helper to create consistent stack references
export const createFoundationReference = (stack?: string) => {
  return createStackReference(
    "democracy-foundation",
    stack || getCurrentStack()
  );
};

export const createPlatformReference = (stack?: string) => {
  return createStackReference("democracy-platform", stack || getCurrentStack());
};
