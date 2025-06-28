#!/usr/bin/env tsx

/**
 * Deployment Health Check Script
 *
 * Provides comprehensive health monitoring for deployed infrastructure
 */

import * as dns from "dns";
import * as http from "http";
import * as https from "https";

interface HealthCheckResult {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  message: string;
  responseTime?: number;
  details?: any;
}

class DeploymentHealthChecker {
  /**
   * Check DNS resolution for domains
   */
  static async checkDnsHealth(domains: string[]): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];

    for (const domain of domains) {
      const startTime = Date.now();
      try {
        await dns.promises.resolve4(domain);
        const responseTime = Date.now() - startTime;

        results.push({
          service: `DNS:${domain}`,
          status: "healthy",
          message: `Domain resolves correctly`,
          responseTime,
        });
      } catch (error) {
        results.push({
          service: `DNS:${domain}`,
          status: "unhealthy",
          message: `DNS resolution failed: ${error}`,
          details: { error: error.toString() },
        });
      }
    }

    return results;
  }

  /**
   * Check HTTP endpoint health
   */
  static async checkHttpHealth(
    url: string,
    timeout: number = 10000
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const isHttps = url.startsWith("https");
    const client = isHttps ? https : http;

    return new Promise((resolve) => {
      const req = client.request(url, { timeout }, (res) => {
        const responseTime = Date.now() - startTime;

        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
          resolve({
            service: `HTTP:${url}`,
            status: "healthy",
            message: `Endpoint responsive (Status: ${res.statusCode})`,
            responseTime,
            details: { statusCode: res.statusCode, headers: res.headers },
          });
        } else {
          resolve({
            service: `HTTP:${url}`,
            status: "degraded",
            message: `Endpoint returned non-2xx status: ${res.statusCode}`,
            responseTime,
            details: { statusCode: res.statusCode },
          });
        }
      });

      req.on("error", (error) => {
        resolve({
          service: `HTTP:${url}`,
          status: "unhealthy",
          message: `HTTP request failed: ${error.message}`,
          details: { error: error.toString() },
        });
      });

      req.on("timeout", () => {
        resolve({
          service: `HTTP:${url}`,
          status: "unhealthy",
          message: `HTTP request timed out after ${timeout}ms`,
          details: { timeout },
        });
      });

      req.end();
    });
  }

  /**
   * Check Kubernetes cluster health via kubectl
   */
  static async checkKubernetesHealth(): Promise<HealthCheckResult> {
    try {
      const { exec } = require("child_process");
      const { promisify } = require("util");
      const execPromise = promisify(exec);

      const startTime = Date.now();
      const { stdout } = await execPromise(
        "kubectl cluster-info --request-timeout=10s"
      );
      const responseTime = Date.now() - startTime;

      if (stdout.includes("is running")) {
        return {
          service: "Kubernetes:cluster",
          status: "healthy",
          message: "Kubernetes cluster is accessible and running",
          responseTime,
          details: { clusterInfo: stdout.trim() },
        };
      } else {
        return {
          service: "Kubernetes:cluster",
          status: "degraded",
          message: "Kubernetes cluster response is unexpected",
          responseTime,
          details: { output: stdout },
        };
      }
    } catch (error) {
      return {
        service: "Kubernetes:cluster",
        status: "unhealthy",
        message: `Kubernetes cluster check failed: ${error}`,
        details: { error: error.toString() },
      };
    }
  }

  /**
   * Check node health in Kubernetes cluster
   */
  static async checkKubernetesNodes(): Promise<HealthCheckResult> {
    try {
      const { exec } = require("child_process");
      const { promisify } = require("util");
      const execPromise = promisify(exec);

      const startTime = Date.now();
      const { stdout } = await execPromise(
        "kubectl get nodes --no-headers --request-timeout=10s"
      );
      const responseTime = Date.now() - startTime;

      const lines = stdout
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      const readyNodes = lines.filter((line) => line.includes("Ready"));
      const notReadyNodes = lines.filter((line) => !line.includes("Ready"));

      if (notReadyNodes.length === 0 && readyNodes.length > 0) {
        return {
          service: "Kubernetes:nodes",
          status: "healthy",
          message: `All ${readyNodes.length} nodes are Ready`,
          responseTime,
          details: { readyNodes: readyNodes.length, totalNodes: lines.length },
        };
      } else if (readyNodes.length > 0) {
        return {
          service: "Kubernetes:nodes",
          status: "degraded",
          message: `${readyNodes.length} ready, ${notReadyNodes.length} not ready`,
          responseTime,
          details: {
            readyNodes: readyNodes.length,
            notReadyNodes: notReadyNodes.length,
          },
        };
      } else {
        return {
          service: "Kubernetes:nodes",
          status: "unhealthy",
          message: "No nodes are Ready",
          responseTime,
          details: { totalNodes: lines.length },
        };
      }
    } catch (error) {
      return {
        service: "Kubernetes:nodes",
        status: "unhealthy",
        message: `Node check failed: ${error}`,
        details: { error: error.toString() },
      };
    }
  }

  /**
   * Run comprehensive deployment health check
   */
  static async runHealthCheck(
    config: {
      domains?: string[];
      endpoints?: string[];
      checkKubernetes?: boolean;
    } = {}
  ): Promise<HealthCheckResult[]> {
    const {
      domains = [
        "democracy-deutschland.de",
        "bundestag.io",
        "democracy-app.de",
      ],
      endpoints = [],
      checkKubernetes = true,
    } = config;

    console.log("🏥 Running Deployment Health Check");
    console.log("=================================");

    const results: HealthCheckResult[] = [];

    // DNS Health Checks
    if (domains.length > 0) {
      console.log("🌐 Checking DNS health...");
      const dnsResults = await this.checkDnsHealth(domains);
      results.push(...dnsResults);
    }

    // HTTP Health Checks
    if (endpoints.length > 0) {
      console.log("🔗 Checking HTTP endpoints...");
      for (const endpoint of endpoints) {
        const httpResult = await this.checkHttpHealth(endpoint);
        results.push(httpResult);
      }
    }

    // Kubernetes Health Checks
    if (checkKubernetes) {
      console.log("☸️ Checking Kubernetes health...");
      const k8sClusterResult = await this.checkKubernetesHealth();
      results.push(k8sClusterResult);

      if (k8sClusterResult.status !== "unhealthy") {
        const k8sNodesResult = await this.checkKubernetesNodes();
        results.push(k8sNodesResult);
      }
    }

    // Print results
    console.log("\n📊 Health Check Results:");
    console.log("========================");

    let healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;

    results.forEach((result) => {
      const icon =
        result.status === "healthy"
          ? "✅"
          : result.status === "degraded"
          ? "⚠️"
          : "❌";
      const responseTime = result.responseTime
        ? ` (${result.responseTime}ms)`
        : "";

      console.log(
        `${icon} ${result.service}: ${result.message}${responseTime}`
      );

      if (result.status === "healthy") healthyCount++;
      else if (result.status === "degraded") degradedCount++;
      else unhealthyCount++;
    });

    console.log("\n📈 Summary:");
    console.log(`   Healthy: ${healthyCount}`);
    console.log(`   Degraded: ${degradedCount}`);
    console.log(`   Unhealthy: ${unhealthyCount}`);

    return results;
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const configArg = args[0];

  let config = {};

  if (configArg === "kubernetes-only") {
    config = { domains: [], endpoints: [], checkKubernetes: true };
  } else if (configArg === "dns-only") {
    config = { checkKubernetes: false };
  } else if (configArg === "full") {
    config = {
      domains: ["democracy-deutschland.de", "bundestag.io", "democracy-app.de"],
      endpoints: ["https://democracy-deutschland.de", "https://bundestag.io"],
      checkKubernetes: true,
    };
  }

  try {
    const results = await DeploymentHealthChecker.runHealthCheck(config);

    const hasUnhealthy = results.some((r) => r.status === "unhealthy");
    const hasIssues = results.some((r) => r.status !== "healthy");

    if (hasUnhealthy) {
      console.log("\n❌ Critical health issues detected!");
      process.exit(1);
    } else if (hasIssues) {
      console.log("\n⚠️ Some services are degraded, but system is operational");
      process.exit(0);
    } else {
      console.log("\n✅ All services are healthy!");
      process.exit(0);
    }
  } catch (error) {
    console.error("💥 Health check failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { DeploymentHealthChecker, HealthCheckResult };
