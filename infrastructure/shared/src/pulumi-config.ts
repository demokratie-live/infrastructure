import * as pulumi from "@pulumi/pulumi";

/**
 * Centralized Pulumi configuration management
 * Provides type-safe access to configuration values across all stacks
 */
export class PulumiConfig {
  private static instance: PulumiConfig;
  private config: pulumi.Config;

  private constructor() {
    this.config = new pulumi.Config();
  }

  /**
   * Get singleton instance of PulumiConfig
   */
  public static getInstance(): PulumiConfig {
    if (!PulumiConfig.instance) {
      PulumiConfig.instance = new PulumiConfig();
    }
    return PulumiConfig.instance;
  }

  /**
   * Get required configuration value
   */
  public require(key: string): string {
    return this.config.require(key);
  }

  /**
   * Get optional configuration value with default
   */
  public get(key: string, defaultValue?: string): string | undefined {
    return this.config.get(key) ?? defaultValue;
  }

  /**
   * Get required boolean configuration value
   */
  public requireBoolean(key: string): boolean {
    return this.config.requireBoolean(key);
  }

  /**
   * Get optional boolean configuration value with default
   */
  public getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    const value = this.config.getBoolean(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get required number configuration value
   */
  public requireNumber(key: string): number {
    return this.config.requireNumber(key);
  }

  /**
   * Get optional number configuration value with default
   */
  public getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.config.getNumber(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get project name from configuration
   */
  public getProjectName(): string {
    return this.require("projectName");
  }

  /**
   * Get environment name (dev, staging, prod)
   */
  public getEnvironment(): string {
    return this.get("environment") ?? "dev";
  }

  /**
   * Get region configuration
   */
  public getRegion(): string {
    return this.get("region") ?? "fra1";
  }

  /**
   * Check if this is a production environment
   */
  public isProduction(): boolean {
    return this.getEnvironment() === "prod";
  }

  /**
   * Get common resource tags
   */
  public getCommonTags(): Record<string, string> {
    return {
      environment: this.getEnvironment(),
      project: this.getProjectName(),
      managedBy: "pulumi",
      region: this.getRegion(),
    };
  }
}

/**
 * Convenience function to get the singleton config instance
 */
export const getConfig = (): PulumiConfig => PulumiConfig.getInstance();
