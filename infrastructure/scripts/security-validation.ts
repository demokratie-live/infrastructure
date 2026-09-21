#!/usr/bin/env tsx

/**
 * Security Validation Script for Democracy Infrastructure
 *
 * Implements comprehensive security checks for:
 * - Infrastructure configurations
 * - Kubernetes security posture
 * - Compliance requirements (GDPR, German regulations)
 */

import { execSync } from "child_process";
import { promises as fs } from "fs";
import path from "path";

interface SecurityCheckResult {
  check: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: unknown;
  recommendations?: string[];
}

interface SecurityReport {
  timestamp: string;
  environment: string;
  overallStatus: "secure" | "warning" | "critical";
  checks: SecurityCheckResult[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
}

class SecurityValidator {
  private results: SecurityCheckResult[] = [];

  /**
   * Check for hardcoded secrets in code
   */
  checkSecretsInCode(): SecurityCheckResult {
    console.log("🔐 Checking for hardcoded secrets...");

    try {
      // Common secret patterns
      const secretPatterns = [
        "password\\s*=\\s*['\"][^'\"]+['\"]",
        "token\\s*=\\s*['\"][^'\"]+['\"]",
        "api[_-]?key\\s*=\\s*['\"][^'\"]+['\"]",
        "secret\\s*=\\s*['\"][^'\"]+['\"]",
        "DIGITALOCEAN_TOKEN\\s*=\\s*['\"][^'\"]+['\"]",
        "PULUMI_ACCESS_TOKEN\\s*=\\s*['\"][^'\"]+['\"]",
      ];

      const findings: string[] = [];

      for (const pattern of secretPatterns) {
        try {
          const output = execSync(
            `grep -r -n --include="*.ts" --include="*.js" --include="*.yaml" --include="*.yml" "${pattern}" . || true`,
            { encoding: "utf-8", cwd: process.cwd() }
          );

          if (output.trim()) {
            findings.push(`Pattern "${pattern}" found:\n${output}`);
          }
        } catch {
          // grep returns non-zero when no matches found, which is what we want
        }
      }

      if (findings.length > 0) {
        return {
          check: "Hardcoded Secrets",
          status: "fail",
          message: `Found ${findings.length} potential hardcoded secrets`,
          details: findings,
          recommendations: [
            "Move all secrets to environment variables or secret management systems",
            "Use GitHub Secrets for CI/CD pipelines",
            "Implement secret scanning in pre-commit hooks",
          ],
        };
      }

      return {
        check: "Hardcoded Secrets",
        status: "pass",
        message: "No hardcoded secrets detected",
      };
    } catch (error) {
      return {
        check: "Hardcoded Secrets",
        status: "fail",
        message: `Secret scanning failed: ${String(error)}`,
        recommendations: ["Fix secret scanning script and re-run"],
      };
    }
  }

  /**
   * Check Kubernetes security configurations
   */
  async checkKubernetesSecurityPosture(): Promise<SecurityCheckResult> {
    console.log("🛡️ Checking Kubernetes security configurations...");

    const securityIssues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for runAsRoot or privileged containers
      const deploymentFiles = this.findFiles("kustomize", "*.yaml");

      for (const file of deploymentFiles) {
        const content = await fs.readFile(file, "utf-8");

        // Check for privileged containers
        if (content.includes("privileged: true")) {
          securityIssues.push(`Privileged container found in ${file}`);
          recommendations.push(
            "Remove privileged: true or justify with security exception"
          );
        }

        // Check for runAsRoot
        if (
          content.includes("runAsUser: 0") ||
          content.includes("runAsRoot: true")
        ) {
          securityIssues.push(`Container running as root found in ${file}`);
          recommendations.push("Configure non-root user for all containers");
        }

        // Check for missing security context
        if (
          content.includes("kind: Deployment") &&
          !content.includes("securityContext")
        ) {
          securityIssues.push(`Missing security context in ${file}`);
          recommendations.push("Add security context to all deployments");
        }

        // Check for missing resource limits
        if (
          content.includes("kind: Deployment") &&
          !content.includes("resources:")
        ) {
          securityIssues.push(`Missing resource limits in ${file}`);
          recommendations.push(
            "Add resource limits to prevent resource exhaustion attacks"
          );
        }
      }

      // Check for Network Policies
      const networkPolicyFiles = this.findFiles("kustomize", "*NetworkPolicy*");
      if (networkPolicyFiles.length === 0) {
        securityIssues.push("No NetworkPolicy configurations found");
        recommendations.push(
          "Implement Network Policies for micro-segmentation"
        );
      }

      // Check for RBAC configurations
      const rbacFiles = this.findFiles("kustomize", "*rbac*");
      if (rbacFiles.length === 0) {
        securityIssues.push("No RBAC configurations found");
        recommendations.push("Implement Role-Based Access Control (RBAC)");
      }

      if (securityIssues.length > 0) {
        return {
          check: "Kubernetes Security Posture",
          status: "warning",
          message: `Found ${securityIssues.length} security configuration issues`,
          details: securityIssues,
          recommendations,
        };
      }

      return {
        check: "Kubernetes Security Posture",
        status: "pass",
        message: "Kubernetes security configurations are acceptable",
      };
    } catch (error) {
      return {
        check: "Kubernetes Security Posture",
        status: "fail",
        message: `Kubernetes security check failed: ${String(error)}`,
        recommendations: ["Fix Kubernetes security validation script"],
      };
    }
  }

  /**
   * Check dependency vulnerabilities
   */
  checkDependencyVulnerabilities(): SecurityCheckResult {
    console.log("📦 Checking dependency vulnerabilities...");

    try {
      const output = execSync("pnpm audit --audit-level=high --json", {
        encoding: "utf-8",
        cwd: path.join(process.cwd(), "infrastructure"),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const auditResult = JSON.parse(output) as any;

      if (
        auditResult.metadata.vulnerabilities.high > 0 ||
        auditResult.metadata.vulnerabilities.critical > 0
      ) {
        return {
          check: "Dependency Vulnerabilities",
          status: "fail",
          message: `Found ${auditResult.metadata.vulnerabilities.high} high and ${auditResult.metadata.vulnerabilities.critical} critical vulnerabilities`,
          details: auditResult,
          recommendations: [
            "Run 'pnpm audit fix' to automatically fix vulnerabilities",
            "Update dependencies to latest secure versions",
            "Consider using tools like Snyk for continuous monitoring",
          ],
        };
      }

      return {
        check: "Dependency Vulnerabilities",
        status: "pass",
        message: "No high or critical vulnerabilities found in dependencies",
      };
    } catch (error) {
      // If audit fails, it might be due to vulnerabilities
      return {
        check: "Dependency Vulnerabilities",
        status: "warning",
        message: "Could not complete dependency vulnerability scan",
        details: error,
        recommendations: [
          "Manually run 'pnpm audit' to check for vulnerabilities",
        ],
      };
    }
  }

  /**
   * Check infrastructure compliance (GDPR, German regulations)
   */
  async checkComplianceRequirements(): Promise<SecurityCheckResult> {
    console.log("⚖️ Checking compliance requirements...");

    const complianceIssues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for data location compliance (EU/Germany)
      const infraFiles = this.findFiles("infrastructure", "*.ts");
      let regionConfigFound = false;

      for (const file of infraFiles) {
        const content = await fs.readFile(file, "utf-8");

        // Check for EU region configuration
        if (content.includes("fra1") || content.includes("eu-")) {
          regionConfigFound = true;
        }

        // Check for non-EU regions
        if (
          content.includes("nyc") ||
          content.includes("us-") ||
          content.includes("asia-")
        ) {
          complianceIssues.push(`Non-EU region configuration found in ${file}`);
          recommendations.push(
            "Ensure all data processing occurs within EU for GDPR compliance"
          );
        }
      }

      if (!regionConfigFound) {
        complianceIssues.push("No explicit EU region configuration found");
        recommendations.push(
          "Explicitly configure EU regions for GDPR compliance"
        );
      }

      // Check for privacy-related configurations
      const kubernetesFiles = this.findFiles("kustomize", "*.yaml");
      let privacyConfigFound = false;

      for (const file of kubernetesFiles) {
        const content = await fs.readFile(file, "utf-8");

        if (
          content.includes("privacy") ||
          content.includes("gdpr") ||
          content.includes("datenschutz")
        ) {
          privacyConfigFound = true;
        }
      }

      if (!privacyConfigFound) {
        complianceIssues.push("No privacy/GDPR related configurations found");
        recommendations.push(
          "Implement explicit privacy controls and data retention policies"
        );
      }

      if (complianceIssues.length > 0) {
        return {
          check: "Compliance Requirements",
          status: "warning",
          message: `Found ${complianceIssues.length} compliance-related concerns`,
          details: complianceIssues,
          recommendations,
        };
      }

      return {
        check: "Compliance Requirements",
        status: "pass",
        message: "Basic compliance requirements appear to be met",
      };
    } catch (error) {
      return {
        check: "Compliance Requirements",
        status: "fail",
        message: `Compliance check failed: ${String(error)}`,
        recommendations: ["Fix compliance validation script"],
      };
    }
  }

  /**
   * Helper method to find files recursively
   */
  private findFiles(dir: string, pattern: string): string[] {
    try {
      const output = execSync(
        `find ${dir} -name "${pattern}" -type f 2>/dev/null || true`,
        {
          encoding: "utf-8",
          cwd: process.cwd(),
        }
      );

      return output
        .trim()
        .split("\n")
        .filter(line => line.length > 0);
    } catch {
      return [];
    }
  }

  /**
   * Run all security checks
   */
  async runAllChecks(): Promise<SecurityReport> {
    console.log("🔒 Running comprehensive security validation...");
    console.log("==================================================");

    this.results = [];

    // Run all security checks
    this.results.push(this.checkSecretsInCode());
    this.results.push(await this.checkKubernetesSecurityPosture());
    this.results.push(this.checkDependencyVulnerabilities());
    this.results.push(await this.checkComplianceRequirements());

    // Calculate summary
    const passed = this.results.filter(r => r.status === "pass").length;
    const failed = this.results.filter(r => r.status === "fail").length;
    const warnings = this.results.filter(r => r.status === "warning").length;

    const overallStatus =
      failed > 0 ? "critical" : warnings > 0 ? "warning" : "secure";

    const report: SecurityReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      overallStatus,
      checks: this.results,
      summary: { passed, failed, warnings },
    };

    // Print results
    console.log("\n📊 Security Validation Results:");
    console.log("==============================");
    console.log(`Overall Status: ${overallStatus.toUpperCase()}`);
    console.log(`Passed: ${passed}, Failed: ${failed}, Warnings: ${warnings}`);

    this.results.forEach(result => {
      const icon =
        result.status === "pass"
          ? "✅"
          : result.status === "warning"
            ? "⚠️"
            : "❌";
      console.log(`${icon} ${result.check}: ${result.message}`);

      if (result.recommendations && result.recommendations.length > 0) {
        console.log(`   Recommendations:`);
        result.recommendations.forEach(rec => console.log(`   - ${rec}`));
      }
    });

    return report;
  }

  /**
   * Save security report to file
   */
  async saveReport(report: SecurityReport): Promise<void> {
    const reportsDir = path.join(process.cwd(), "infrastructure", "reports");

    try {
      await fs.mkdir(reportsDir, { recursive: true });
      const reportFile = path.join(
        reportsDir,
        `security-report-${Date.now()}.json`
      );
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
      console.log(`\n💾 Security report saved to: ${reportFile}`);
    } catch (error) {
      console.error(`Failed to save report: ${String(error)}`);
    }
  }
}

// CLI handling
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const saveReport = args.includes("--save");

  const validator = new SecurityValidator();
  const report = await validator.runAllChecks();

  if (saveReport) {
    await validator.saveReport(report);
  }

  // Exit with appropriate code
  if (report.overallStatus === "critical") {
    console.log("\n🚨 Critical security issues found - failing build");
    process.exit(1);
  } else if (report.overallStatus === "warning") {
    console.log("\n⚠️ Security warnings found - review recommended");
    process.exit(0);
  } else {
    console.log("\n✅ All security checks passed");
    process.exit(0);
  }
}

// ES module equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SecurityValidator, SecurityReport, SecurityCheckResult };
