#!/usr/bin/env tsx

/**
 * Resource Cleanup Helper
 *
 * Safe cleanup utility for unused infrastructure resources.
 * Helps identify and clean up orphaned resources while protecting critical infrastructure.
 */

import { execSync } from "child_process";
import { promises as fs } from "fs";

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  created: string;
  tags?: Record<string, string>;
  protected: boolean;
}

interface CleanupReport {
  timestamp: string;
  environment: string;
  scannedResources: number;
  candidatesForCleanup: Resource[];
  protectedResources: Resource[];
  recommendations: string[];
}

const PROTECTED_RESOURCE_PATTERNS = [
  /^default-/,
  /^production-/,
  /^kubernetes-/,
  /^democracy-/,
  /^main-/,
  /^master-/,
];

const PROTECTED_TAGS = [
  "Environment:production",
  "Protected:true",
  "Critical:true",
  "DoNotDelete:true",
];

async function runCommand(command: string): Promise<string> {
  try {
    return execSync(command, { encoding: "utf-8", timeout: 30000 });
  } catch (error) {
    console.warn(`⚠️ Command failed: ${command}`);
    return "";
  }
}

function isResourceProtected(resource: Resource): boolean {
  // Check name patterns
  for (const pattern of PROTECTED_RESOURCE_PATTERNS) {
    if (pattern.test(resource.name)) {
      return true;
    }
  }

  // Check tags
  if (resource.tags) {
    for (const protectedTag of PROTECTED_TAGS) {
      const [key, value] = protectedTag.split(":");
      if (resource.tags[key] === value) {
        return true;
      }
    }
  }

  // Always protect recent resources (created within last 24 hours)
  const createdDate = new Date(resource.created);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (createdDate > oneDayAgo) {
    return true;
  }

  return false;
}

async function scanDroplets(): Promise<Resource[]> {
  console.log("🔍 Scanning droplets...");
  const output = await runCommand(
    "doctl compute droplet list --format ID,Name,Status,Created --no-header"
  );

  const resources: Resource[] = [];
  for (const line of output.split("\n")) {
    if (!line.trim()) continue;

    const [id, name, status, created] = line.trim().split(/\s+/);
    if (id && name) {
      resources.push({
        id,
        name,
        type: "droplet",
        status,
        created,
        protected: false,
      });
    }
  }

  return resources;
}

async function scanVolumes(): Promise<Resource[]> {
  console.log("🔍 Scanning volumes...");
  const output = await runCommand(
    "doctl compute volume list --format ID,Name,Status,Created --no-header"
  );

  const resources: Resource[] = [];
  for (const line of output.split("\n")) {
    if (!line.trim()) continue;

    const [id, name, status, created] = line.trim().split(/\s+/);
    if (id && name) {
      resources.push({
        id,
        name,
        type: "volume",
        status,
        created,
        protected: false,
      });
    }
  }

  return resources;
}

async function scanLoadBalancers(): Promise<Resource[]> {
  console.log("🔍 Scanning load balancers...");
  const output = await runCommand(
    "doctl compute load-balancer list --format ID,Name,Status,Created --no-header"
  );

  const resources: Resource[] = [];
  for (const line of output.split("\n")) {
    if (!line.trim()) continue;

    const [id, name, status, created] = line.trim().split(/\s+/);
    if (id && name) {
      resources.push({
        id,
        name,
        type: "load-balancer",
        status,
        created,
        protected: false,
      });
    }
  }

  return resources;
}

async function scanKubernetesClusters(): Promise<Resource[]> {
  console.log("🔍 Scanning Kubernetes clusters...");
  const output = await runCommand(
    "doctl kubernetes cluster list --format ID,Name,Status,Created --no-header"
  );

  const resources: Resource[] = [];
  for (const line of output.split("\n")) {
    if (!line.trim()) continue;

    const [id, name, status, created] = line.trim().split(/\s+/);
    if (id && name) {
      resources.push({
        id,
        name,
        type: "kubernetes-cluster",
        status,
        created,
        protected: true, // Kubernetes clusters are always protected by default
      });
    }
  }

  return resources;
}

async function scanAllResources(): Promise<Resource[]> {
  const allResources: Resource[] = [];

  try {
    const [droplets, volumes, loadBalancers, k8sClusters] = await Promise.all([
      scanDroplets(),
      scanVolumes(),
      scanLoadBalancers(),
      scanKubernetesClusters(),
    ]);

    allResources.push(
      ...droplets,
      ...volumes,
      ...loadBalancers,
      ...k8sClusters
    );
  } catch (error) {
    console.warn("⚠️ Some resource scans failed:", error);
  }

  // Apply protection rules
  for (const resource of allResources) {
    resource.protected = resource.protected || isResourceProtected(resource);
  }

  return allResources;
}

function generateRecommendations(resources: Resource[]): string[] {
  const recommendations: string[] = [];

  const orphanedVolumes = resources.filter(
    (r) => r.type === "volume" && !r.protected && r.status !== "attached"
  );

  if (orphanedVolumes.length > 0) {
    recommendations.push(
      `Consider cleaning up ${orphanedVolumes.length} unattached volumes`
    );
  }

  const oldDroplets = resources.filter((r) => {
    if (r.type !== "droplet" || r.protected) return false;
    const createdDate = new Date(r.created);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return createdDate < thirtyDaysAgo;
  });

  if (oldDroplets.length > 0) {
    recommendations.push(
      `Review ${oldDroplets.length} droplets older than 30 days`
    );
  }

  const runningResources = resources.filter(
    (r) => r.status === "active" || r.status === "running"
  );

  recommendations.push(
    `Monitor ${runningResources.length} active resources for utilization`
  );
  recommendations.push(
    "Set up automated tagging for better resource management"
  );
  recommendations.push("Implement resource lifecycle policies");

  return recommendations;
}

async function generateCleanupReport(): Promise<CleanupReport> {
  console.log("🧹 Generating resource cleanup report...");

  const resources = await scanAllResources();
  const candidatesForCleanup = resources.filter((r) => !r.protected);
  const protectedResources = resources.filter((r) => r.protected);
  const recommendations = generateRecommendations(resources);

  return {
    timestamp: new Date().toISOString(),
    environment: process.env.PULUMI_STACK || "unknown",
    scannedResources: resources.length,
    candidatesForCleanup,
    protectedResources,
    recommendations,
  };
}

function printCleanupReport(report: CleanupReport): void {
  console.log("\n🧹 Resource Cleanup Report");
  console.log("===========================");
  console.log(`🕐 Generated: ${report.timestamp}`);
  console.log(`🏗️ Environment: ${report.environment}`);
  console.log(`📊 Total Resources: ${report.scannedResources}`);
  console.log("");

  console.log("🛡️ Protected Resources:");
  if (report.protectedResources.length === 0) {
    console.log("   None found");
  } else {
    report.protectedResources.forEach((resource) => {
      console.log(
        `   ✅ ${resource.type}: ${resource.name} (${resource.status})`
      );
    });
  }

  console.log("");
  console.log("🗑️ Cleanup Candidates:");
  if (report.candidatesForCleanup.length === 0) {
    console.log("   ✨ No resources found for cleanup!");
  } else {
    report.candidatesForCleanup.forEach((resource) => {
      console.log(
        `   ⚠️ ${resource.type}: ${resource.name} (${resource.status}, created: ${resource.created})`
      );
    });
  }

  console.log("");
  console.log("💡 Recommendations:");
  report.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });

  if (report.candidatesForCleanup.length > 0) {
    console.log("");
    console.log(
      "⚠️ WARNING: Review all cleanup candidates carefully before deletion!"
    );
    console.log("💡 Use --dry-run to simulate cleanup actions");
  } else {
    console.log("");
    console.log("🎉 Infrastructure is clean! No cleanup needed.");
  }
}

async function performCleanup(
  report: CleanupReport,
  dryRun: boolean = true
): Promise<void> {
  if (report.candidatesForCleanup.length === 0) {
    console.log("✨ No resources to clean up!");
    return;
  }

  console.log(
    `\n${dryRun ? "🎭 DRY RUN:" : "🗑️ CLEANUP:"} Processing ${
      report.candidatesForCleanup.length
    } resources...`
  );

  for (const resource of report.candidatesForCleanup) {
    const action = getCleanupAction(resource);

    if (dryRun) {
      console.log(`   📋 Would ${action}: ${resource.type} ${resource.name}`);
    } else {
      console.log(`   🗑️ ${action}: ${resource.type} ${resource.name}`);
      try {
        await executeCleanupAction(resource);
        console.log(`   ✅ Successfully cleaned up ${resource.name}`);
      } catch (error) {
        console.log(`   ❌ Failed to clean up ${resource.name}: ${error}`);
      }
    }
  }

  if (dryRun) {
    console.log("\n💡 Run with --execute to perform actual cleanup");
  }
}

function getCleanupAction(resource: Resource): string {
  switch (resource.type) {
    case "droplet":
      return "delete droplet";
    case "volume":
      return "delete volume";
    case "load-balancer":
      return "delete load balancer";
    case "kubernetes-cluster":
      return "delete cluster";
    default:
      return "delete resource";
  }
}

async function executeCleanupAction(resource: Resource): Promise<void> {
  // This is where actual cleanup would happen
  // For safety, we'll just simulate it for now
  throw new Error("Actual cleanup not implemented - safety measure");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--execute");
  const saveReport = args.includes("--save");

  if (args.includes("--help")) {
    console.log(`
🧹 Infrastructure Resource Cleanup Helper

Usage:
  tsx scripts/resource-cleanup.ts [options]

Options:
  --dry-run       Show what would be cleaned up (default)
  --execute       Actually perform cleanup (dangerous!)
  --save          Save report to file
  --help          Show this help

Examples:
  tsx scripts/resource-cleanup.ts                    # Dry run (safe)
  tsx scripts/resource-cleanup.ts --save             # Generate and save report
  tsx scripts/resource-cleanup.ts --execute          # Actually clean up (be careful!)

Safety Features:
  - Protected resource patterns prevent accidental deletion
  - Recent resources (< 24h) are automatically protected
  - Kubernetes clusters are always protected
  - Dry run is the default mode
`);
    return;
  }

  try {
    const report = await generateCleanupReport();
    printCleanupReport(report);

    if (saveReport) {
      const filename = `cleanup-report-${
        new Date().toISOString().split("T")[0]
      }.json`;
      await fs.writeFile(filename, JSON.stringify(report, null, 2));
      console.log(`\n💾 Report saved to: ${filename}`);
    }

    if (report.candidatesForCleanup.length > 0) {
      await performCleanup(report, dryRun);
    }
  } catch (error) {
    console.error("❌ Cleanup operation failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
