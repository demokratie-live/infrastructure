#!/usr/bin/env tsx

/**
 * Infrastructure Cost Analysis and Monitoring Tool
 *
 * Provides cost tracking, budget analysis, and optimization recommendations
 * for DigitalOcean infrastructure.
 */

import * as fs from "fs";
import * as path from "path";

interface ResourceCost {
  resourceType: string;
  resourceName: string;
  monthlyEstimate: number;
  unit: string;
  quantity: number;
  environment: string;
  component: string;
}

interface CostAnalysis {
  totalMonthlyCost: number;
  costByEnvironment: Record<string, number>;
  costByComponent: Record<string, number>;
  costByResourceType: Record<string, number>;
  recommendations: string[];
}

class InfrastructureCostAnalyzer {
  /**
   * DigitalOcean pricing reference (USD per month)
   */
  private static readonly DO_PRICING = {
    droplet: {
      "s-1vcpu-1gb": 6, // Basic droplet
      "s-2vcpu-2gb": 12, // Development workload
      "s-2vcpu-4gb": 18, // Production workload
      "s-4vcpu-8gb": 48, // High performance
    },
    kubernetes: {
      node: 12, // Per node per month
      loadBalancer: 10, // Per load balancer per month
    },
    storage: {
      volume: 0.1, // Per GB per month
      snapshot: 0.05, // Per GB per month
    },
    networking: {
      floatingIp: 4, // Per IP per month
      vpc: 0, // Free
      firewall: 0, // Free
    },
    dns: {
      domain: 0, // Free for DigitalOcean domains
      records: 0, // Free
    },
  };

  /**
   * Estimate costs for foundation stack
   */
  static estimateFoundationCosts(environment: string = "dev"): ResourceCost[] {
    const costs: ResourceCost[] = [];

    // VPCs (Free)
    costs.push({
      resourceType: "vpc",
      resourceName: "default-fra1-vpc",
      monthlyEstimate: 0,
      unit: "vpc",
      quantity: 1,
      environment,
      component: "networking",
    });

    costs.push({
      resourceType: "vpc",
      resourceName: "website-vpc",
      monthlyEstimate: 0,
      unit: "vpc",
      quantity: 1,
      environment,
      component: "networking",
    });

    // Firewalls (Free)
    costs.push({
      resourceType: "firewall",
      resourceName: "kubernetes-access",
      monthlyEstimate: 0,
      unit: "firewall",
      quantity: 2,
      environment,
      component: "security",
    });

    // Domains (Free for DigitalOcean managed)
    const domains = [
      "democracy-deutschland.de",
      "bundestag.io",
      "democracy-app.de",
    ];
    domains.forEach((domain) => {
      costs.push({
        resourceType: "domain",
        resourceName: domain,
        monthlyEstimate: 0,
        unit: "domain",
        quantity: 1,
        environment,
        component: "dns",
      });
    });

    return costs;
  }

  /**
   * Estimate costs for platform stack
   */
  static estimatePlatformCosts(environment: string = "dev"): ResourceCost[] {
    const costs: ResourceCost[] = [];

    // Kubernetes cluster nodes
    const nodeCount = environment === "production" ? 3 : 2;
    costs.push({
      resourceType: "kubernetes-node",
      resourceName: "democracy-k8s-cluster",
      monthlyEstimate: this.DO_PRICING.kubernetes.node * nodeCount,
      unit: "node",
      quantity: nodeCount,
      environment,
      component: "platform",
    });

    // Load balancer
    costs.push({
      resourceType: "load-balancer",
      resourceName: "democracy-lb",
      monthlyEstimate: this.DO_PRICING.kubernetes.loadBalancer,
      unit: "load-balancer",
      quantity: 1,
      environment,
      component: "platform",
    });

    // Storage volumes (estimated)
    const storageGB = environment === "production" ? 100 : 50;
    costs.push({
      resourceType: "storage-volume",
      resourceName: "k8s-storage",
      monthlyEstimate: this.DO_PRICING.storage.volume * storageGB,
      unit: "GB",
      quantity: storageGB,
      environment,
      component: "storage",
    });

    return costs;
  }

  /**
   * Generate complete cost analysis
   */
  static generateCostAnalysis(environment: string = "dev"): CostAnalysis {
    const foundationCosts = this.estimateFoundationCosts(environment);
    const platformCosts = this.estimatePlatformCosts(environment);
    const allCosts = [...foundationCosts, ...platformCosts];

    const totalMonthlyCost = allCosts.reduce(
      (sum, cost) => sum + cost.monthlyEstimate,
      0
    );

    const costByEnvironment: Record<string, number> = {};
    const costByComponent: Record<string, number> = {};
    const costByResourceType: Record<string, number> = {};

    allCosts.forEach((cost) => {
      costByEnvironment[cost.environment] =
        (costByEnvironment[cost.environment] || 0) + cost.monthlyEstimate;
      costByComponent[cost.component] =
        (costByComponent[cost.component] || 0) + cost.monthlyEstimate;
      costByResourceType[cost.resourceType] =
        (costByResourceType[cost.resourceType] || 0) + cost.monthlyEstimate;
    });

    const recommendations = this.generateRecommendations(
      allCosts,
      totalMonthlyCost,
      environment
    );

    return {
      totalMonthlyCost,
      costByEnvironment,
      costByComponent,
      costByResourceType,
      recommendations,
    };
  }

  /**
   * Generate cost optimization recommendations
   */
  private static generateRecommendations(
    costs: ResourceCost[],
    totalCost: number,
    environment: string
  ): string[] {
    const recommendations: string[] = [];

    // Check for high-cost items
    const highCostItems = costs.filter((cost) => cost.monthlyEstimate > 20);
    if (highCostItems.length > 0) {
      recommendations.push(
        `Review high-cost resources: ${highCostItems
          .map((c) => c.resourceName)
          .join(", ")}`
      );
    }

    // Environment-specific recommendations
    if (environment === "dev" && totalCost > 50) {
      recommendations.push(
        "Consider using smaller node sizes for development environment"
      );
    }

    if (environment === "production" && totalCost > 200) {
      recommendations.push(
        "Production costs exceed recommended budget - review resource sizing"
      );
    }

    // Kubernetes-specific recommendations
    const k8sCosts = costs.filter((c) => c.resourceType.includes("kubernetes"));
    const k8sTotalCost = k8sCosts.reduce(
      (sum, cost) => sum + cost.monthlyEstimate,
      0
    );

    if (k8sTotalCost > totalCost * 0.8) {
      recommendations.push(
        "Kubernetes resources represent >80% of costs - consider optimization"
      );
    }

    // Storage recommendations
    const storageCosts = costs.filter((c) =>
      c.resourceType.includes("storage")
    );
    const storageTotalCost = storageCosts.reduce(
      (sum, cost) => sum + cost.monthlyEstimate,
      0
    );

    if (storageTotalCost > 20) {
      recommendations.push(
        "Consider implementing storage lifecycle policies to reduce costs"
      );
    }

    // General recommendations
    recommendations.push("Enable resource tagging for better cost tracking");
    recommendations.push("Set up billing alerts at 80% and 95% of budget");
    recommendations.push(
      "Review resource utilization monthly for right-sizing opportunities"
    );

    return recommendations;
  }

  /**
   * Generate cost report
   */
  static generateCostReport(
    environments: string[] = ["dev", "staging", "production"]
  ): void {
    console.log("💰 Infrastructure Cost Analysis Report");
    console.log("=====================================\n");

    let grandTotal = 0;

    environments.forEach((env) => {
      const analysis = this.generateCostAnalysis(env);
      grandTotal += analysis.totalMonthlyCost;

      console.log(`📊 ${env.toUpperCase()} Environment:`);
      console.log(`   Monthly Cost: $${analysis.totalMonthlyCost.toFixed(2)}`);
      console.log("   Breakdown by Component:");

      Object.entries(analysis.costByComponent).forEach(([component, cost]) => {
        console.log(`     ${component}: $${cost.toFixed(2)}`);
      });

      console.log("   Breakdown by Resource Type:");
      Object.entries(analysis.costByResourceType).forEach(([type, cost]) => {
        if (cost > 0) {
          console.log(`     ${type}: $${cost.toFixed(2)}`);
        }
      });

      console.log("\n");
    });

    console.log(`🎯 Total Estimated Monthly Cost: $${grandTotal.toFixed(2)}`);
    console.log(
      `🎯 Total Estimated Annual Cost: $${(grandTotal * 12).toFixed(2)}\n`
    );

    // Overall recommendations
    console.log("💡 Cost Optimization Recommendations:");
    console.log("====================================");

    const devAnalysis = this.generateCostAnalysis("dev");
    devAnalysis.recommendations.forEach((rec) => {
      console.log(`   • ${rec}`);
    });
  }

  /**
   * Export cost data to JSON
   */
  static exportCostData(outputPath: string = "./cost-analysis.json"): void {
    const environments = ["dev", "staging", "production"];
    const costData = {
      generatedAt: new Date().toISOString(),
      environments: {} as Record<string, any>,
    };

    environments.forEach((env) => {
      costData.environments[env] = {
        analysis: this.generateCostAnalysis(env),
        foundationCosts: this.estimateFoundationCosts(env),
        platformCosts: this.estimatePlatformCosts(env),
      };
    });

    fs.writeFileSync(outputPath, JSON.stringify(costData, null, 2));
    console.log(`📁 Cost data exported to: ${outputPath}`);
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "report";

  try {
    switch (command) {
      case "report":
        InfrastructureCostAnalyzer.generateCostReport();
        break;
      case "export":
        const outputPath = args[1] || "./cost-analysis.json";
        InfrastructureCostAnalyzer.exportCostData(outputPath);
        break;
      case "environment":
        const env = args[1] || "dev";
        const analysis = InfrastructureCostAnalyzer.generateCostAnalysis(env);
        console.log(`💰 ${env.toUpperCase()} Environment Cost Analysis:`);
        console.log(`Monthly Cost: $${analysis.totalMonthlyCost.toFixed(2)}`);
        console.log("Recommendations:");
        analysis.recommendations.forEach((rec) => console.log(`  • ${rec}`));
        break;
      default:
        console.error(
          "Usage: tsx cost-analyzer.ts [report|export|environment] [args...]"
        );
        console.error("Examples:");
        console.error("  tsx cost-analyzer.ts report");
        console.error("  tsx cost-analyzer.ts export cost-data.json");
        console.error("  tsx cost-analyzer.ts environment production");
        process.exit(1);
    }
  } catch (error) {
    console.error("💥 Cost analysis failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { InfrastructureCostAnalyzer, ResourceCost, CostAnalysis };
