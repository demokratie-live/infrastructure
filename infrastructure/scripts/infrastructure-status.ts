#!/usr/bin/env tsx

/**
 * Infrastructure Status Dashboard
 *
 * Provides a comprehensive overview of the entire infrastructure health,
 * costs, and operational status in a single command.
 */

import { execSync } from "child_process";
import { promises as fs } from "fs";
import path from "path";

interface StatusCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  message: string;
  details?: string;
}

interface StatusSummary {
  timestamp: string;
  environment: string;
  overall: "healthy" | "degraded" | "unhealthy";
  checks: StatusCheck[];
  costs: {
    monthly: number;
    annual: number;
  };
  recommendations: string[];
}

async function runCommand(
  command: string
): Promise<{ success: boolean; output: string; error?: string }> {
  try {
    const output = execSync(command, { encoding: "utf-8", timeout: 30000 });
    return { success: true, output };
  } catch (error: any) {
    return {
      success: false,
      output: "",
      error: error.message || "Unknown error",
    };
  }
}

async function checkStackHealth(): Promise<StatusCheck[]> {
  const checks: StatusCheck[] = [];

  // Check foundation stack
  const foundationResult = await runCommand(
    "cd democracy-foundation && pulumi stack --show-name"
  );
  checks.push({
    name: "Foundation Stack",
    status: foundationResult.success ? "healthy" : "unhealthy",
    message: foundationResult.success
      ? "Active and accessible"
      : "Not accessible",
    details: foundationResult.error,
  });

  // Check platform stack
  const platformResult = await runCommand(
    "cd democracy-platform && pulumi stack --show-name"
  );
  checks.push({
    name: "Platform Stack",
    status: platformResult.success ? "healthy" : "unhealthy",
    message: platformResult.success
      ? "Active and accessible"
      : "Not accessible",
    details: platformResult.error,
  });

  return checks;
}

async function checkDNSHealth(): Promise<StatusCheck[]> {
  const domains = [
    "democracy-deutschland.de",
    "democracy-app.de",
    "bundestag.io",
  ];
  const checks: StatusCheck[] = [];

  for (const domain of domains) {
    const result = await runCommand(`nslookup ${domain}`);
    checks.push({
      name: `DNS: ${domain}`,
      status: result.success ? "healthy" : "unhealthy",
      message: result.success ? "Resolves correctly" : "DNS resolution failed",
      details: result.error,
    });
  }

  return checks;
}

async function checkKubernetesHealth(): Promise<StatusCheck> {
  const result = await runCommand("kubectl cluster-info --request-timeout=10s");
  return {
    name: "Kubernetes Cluster",
    status: result.success ? "healthy" : "unhealthy",
    message: result.success ? "Cluster accessible" : "Cluster not accessible",
    details: result.error,
  };
}

async function getCostEstimate(): Promise<{ monthly: number; annual: number }> {
  // Simplified cost calculation based on our cost analyzer
  const environments = ["dev", "staging", "production"];
  const costs = {
    dev: 39,
    staging: 39,
    production: 56,
  };

  const monthly = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  return {
    monthly,
    annual: monthly * 12,
  };
}

async function getRecommendations(): Promise<string[]> {
  return [
    "Review and optimize Kubernetes node sizes based on actual usage",
    "Implement automated scaling for cost efficiency",
    "Set up monitoring alerts for cost thresholds",
    "Regular security updates and vulnerability scanning",
    "Backup verification and disaster recovery testing",
    "Performance monitoring and optimization",
  ];
}

async function generateStatusReport(): Promise<StatusSummary> {
  console.log("🔍 Gathering infrastructure status...");

  const checks: StatusCheck[] = [];

  // Collect all health checks
  const stackChecks = await checkStackHealth();
  const dnsChecks = await checkDNSHealth();
  const k8sCheck = await checkKubernetesHealth();

  checks.push(...stackChecks, ...dnsChecks, k8sCheck);

  // Determine overall health
  const healthyCount = checks.filter((c) => c.status === "healthy").length;
  const totalCount = checks.length;
  let overall: "healthy" | "degraded" | "unhealthy";

  if (healthyCount === totalCount) {
    overall = "healthy";
  } else if (healthyCount >= totalCount * 0.7) {
    overall = "degraded";
  } else {
    overall = "unhealthy";
  }

  const costs = await getCostEstimate();
  const recommendations = await getRecommendations();

  return {
    timestamp: new Date().toISOString(),
    environment: process.env.PULUMI_STACK || "dev",
    overall,
    checks,
    costs,
    recommendations,
  };
}

function formatStatus(status: string): string {
  const icons = {
    healthy: "✅",
    degraded: "⚠️",
    unhealthy: "❌",
    unknown: "❓",
  };
  return icons[status as keyof typeof icons] || "❓";
}

function printStatusReport(summary: StatusSummary): void {
  console.log("\n📊 Infrastructure Status Dashboard");
  console.log("====================================");
  console.log(`🕐 Timestamp: ${summary.timestamp}`);
  console.log(`🏗️ Environment: ${summary.environment}`);
  console.log(
    `🎯 Overall Status: ${formatStatus(
      summary.overall
    )} ${summary.overall.toUpperCase()}`
  );
  console.log("");

  console.log("🔍 Component Health:");
  summary.checks.forEach((check) => {
    console.log(
      `   ${formatStatus(check.status)} ${check.name}: ${check.message}`
    );
    if (check.details && check.status !== "healthy") {
      console.log(`      Details: ${check.details.substring(0, 100)}...`);
    }
  });

  console.log("");
  console.log("💰 Cost Summary:");
  console.log(`   Monthly: $${summary.costs.monthly}`);
  console.log(`   Annual: $${summary.costs.annual}`);

  console.log("");
  console.log("💡 Recommendations:");
  summary.recommendations.slice(0, 3).forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });

  // Health summary
  const healthyCount = summary.checks.filter(
    (c) => c.status === "healthy"
  ).length;
  const totalCount = summary.checks.length;
  console.log("");
  console.log(`📈 Summary: ${healthyCount}/${totalCount} components healthy`);

  if (summary.overall !== "healthy") {
    console.log("\n⚠️ Action required: Some components need attention!");
  } else {
    console.log("\n🎉 All systems operational!");
  }
}

async function saveStatusReport(summary: StatusSummary): Promise<void> {
  const reportsDir = path.join(process.cwd(), "reports");
  try {
    await fs.mkdir(reportsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  const filename = `infrastructure-status-${
    new Date().toISOString().split("T")[0]
  }.json`;
  const filepath = path.join(reportsDir, filename);

  await fs.writeFile(filepath, JSON.stringify(summary, null, 2));
  console.log(`\n💾 Status report saved to: ${filepath}`);
}

async function main(): Promise<void> {
  try {
    const summary = await generateStatusReport();
    printStatusReport(summary);

    if (process.argv.includes("--save")) {
      await saveStatusReport(summary);
    }

    // Exit with appropriate code
    process.exit(summary.overall === "healthy" ? 0 : 1);
  } catch (error) {
    console.error("❌ Failed to generate status report:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
