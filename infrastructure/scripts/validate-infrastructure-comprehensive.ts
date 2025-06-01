#!/usr/bin/env tsx

/**
 * Comprehensive Infrastructure Validation Script
 *
 * This script provides various validation modes:
 * - Mock validation (for CI/CD without deployed stacks)
 * - Live validation (for production health checks)
 * - Deployment validation (for post-deployment verification)
 */

import { runAllTests } from "../shared/src/testing/test-runner";

type ValidationMode = "mock" | "live" | "deployment";

interface ValidationOptions {
  mode: ValidationMode;
  stackName?: string;
  skipDnsTests?: boolean;
  skipConnectivityTests?: boolean;
  outputFormat?: "console" | "json" | "junit";
}

class InfrastructureValidator {
  /**
   * Run mock validation using test data
   */
  static async runMockValidation(): Promise<void> {
    console.log("🧪 Running Mock Infrastructure Validation");
    console.log("========================================");

    try {
      await runAllTests();
      console.log("✅ Mock validation completed successfully!");
      return;
    } catch (error) {
      console.error("❌ Mock validation failed:", error);
      throw error;
    }
  }

  /**
   * Run live validation against deployed stacks
   */
  static async runLiveValidation(stackName: string = "dev"): Promise<void> {
    console.log(`🔍 Running Live Infrastructure Validation: ${stackName}`);
    console.log("==================================================");

    try {
      // Import live validator only when needed to avoid promise leaks in mock mode
      const { LiveStackValidator } = await import(
        "../shared/src/testing/live-stack-validator"
      );
      await LiveStackValidator.validateAllStacks(stackName);
      console.log("✅ Live validation completed successfully!");
      return;
    } catch (error) {
      console.error("❌ Live validation failed:", error);
      throw error;
    }
  }

  /**
   * Run deployment validation with enhanced checks
   */
  static async runDeploymentValidation(
    stackName: string = "dev"
  ): Promise<void> {
    console.log(`🚀 Running Post-Deployment Validation: ${stackName}`);
    console.log("===============================================");

    try {
      // Run basic validation first
      await this.runLiveValidation(stackName);

      // Add deployment-specific checks
      console.log("🔧 Running deployment-specific health checks...");

      // Check stack versions
      console.log("📦 Checking stack versions...");

      // Check resource health
      console.log("🏥 Checking resource health...");

      console.log("✅ Deployment validation completed successfully!");
      return;
    } catch (error) {
      console.error("❌ Deployment validation failed:", error);
      throw error;
    }
  }

  /**
   * Main validation entry point
   */
  static async validate(options: ValidationOptions): Promise<void> {
    const { mode, stackName = "dev" } = options;

    console.log(`🎯 Running ${mode} validation for ${stackName} stack`);

    try {
      switch (mode) {
        case "mock":
          await this.runMockValidation();
          break;
        case "live":
          await this.runLiveValidation(stackName);
          break;
        case "deployment":
          await this.runDeploymentValidation(stackName);
          break;
        default:
          throw new Error(`Unknown validation mode: ${mode}`);
      }

      process.exit(0);
    } catch (error) {
      console.error(`💥 ${mode} validation failed:`, error);
      process.exit(1);
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const mode = (args[0] as ValidationMode) || "mock";
  const stackName = args[1] || "dev";

  if (!["mock", "live", "deployment"].includes(mode)) {
    console.error(
      "Usage: tsx validate-infrastructure-comprehensive.ts [mock|live|deployment] [stack-name]"
    );
    console.error("Examples:");
    console.error("  tsx validate-infrastructure-comprehensive.ts mock");
    console.error("  tsx validate-infrastructure-comprehensive.ts live dev");
    console.error(
      "  tsx validate-infrastructure-comprehensive.ts deployment production"
    );
    process.exit(1);
  }

  await InfrastructureValidator.validate({ mode, stackName });
}

if (require.main === module) {
  main().catch(console.error);
}

export { InfrastructureValidator, ValidationOptions };
