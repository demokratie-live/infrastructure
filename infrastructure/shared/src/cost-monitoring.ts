import * as pulumi from "@pulumi/pulumi";

export interface CostTag {
  project: string;
  environment: string;
  component: string;
  owner: string;
  budget?: string;
}

export interface CostMonitoringConfig {
  enableCostAlerts: boolean;
  monthlyBudget?: number;
  alertThresholds: {
    warning: number; // percentage of budget
    critical: number; // percentage of budget
  };
  notificationChannels: string[];
}

export class CostMonitor {
  constructor(private config: CostMonitoringConfig) {}

  createCostTags(
    projectName: string,
    environment: string,
    component: string
  ): CostTag {
    return {
      project: projectName,
      environment: environment,
      component: component,
      owner: "democracy-dev-team",
      budget: this.config.monthlyBudget
        ? `${this.config.monthlyBudget}`
        : undefined,
    };
  }

  // Convert cost tags to DigitalOcean tag format
  toPulumiTags(costTags: CostTag): Record<string, string> {
    const tags: Record<string, string> = {
      project: costTags.project,
      environment: costTags.environment,
      component: costTags.component,
      owner: costTags.owner,
      "managed-by": "pulumi",
    };

    if (costTags.budget) {
      tags["budget"] = costTags.budget;
    }

    return tags;
  }

  exportCostMetrics(): Record<string, pulumi.Output<any>> {
    return {
      costMonitoringEnabled: pulumi.output(this.config.enableCostAlerts),
      monthlyBudget: pulumi.output(this.config.monthlyBudget || 0),
      warningThreshold: pulumi.output(this.config.alertThresholds.warning),
      criticalThreshold: pulumi.output(this.config.alertThresholds.critical),
    };
  }
}

// Default cost monitoring configuration
export const defaultCostConfig: CostMonitoringConfig = {
  enableCostAlerts: true,
  monthlyBudget: 200, // $200 USD monthly budget
  alertThresholds: {
    warning: 80, // Alert at 80% of budget
    critical: 95, // Critical alert at 95% of budget
  },
  notificationChannels: ["dev-team@democracy-deutschland.de"],
};
