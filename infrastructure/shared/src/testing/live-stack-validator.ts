#!/usr/bin/env tsx

import * as pulumi from "@pulumi/pulumi";
import { StackValidator } from "./stack-validator";

/**
 * Live stack validator that can be run within a Pulumi program context
 * to validate actual deployed infrastructure
 */
export class LiveStackValidator {
  /**
   * Validate foundation stack outputs against real stack
   */
  static async validateFoundationStack(
    stackName: string = "dev"
  ): Promise<void> {
    console.log(`🔍 Validating Foundation Stack: ${stackName}`);

    const validator = new StackValidator();
    const rules = StackValidator.createFoundationRules();
    rules.forEach((rule) => validator.addRule(rule));

    try {
      const stackRef = new pulumi.StackReference(
        `democracy-foundation/${stackName}`
      );
      const outputs = await stackRef.outputs;

      if (!outputs || typeof outputs !== "object") {
        throw new Error(`No outputs found for foundation stack: ${stackName}`);
      }

      const results = await validator.validateStack("foundation", outputs);

      let hasErrors = false;
      results.forEach((result) => {
        const icon = result.passed
          ? "✅"
          : result.severity === "error"
          ? "❌"
          : "⚠️";
        console.log(`${icon} ${result.message}`);
        if (!result.passed && result.severity === "error") {
          hasErrors = true;
        }
      });

      if (hasErrors) {
        throw new Error("Foundation stack validation failed");
      }

      console.log("✅ Foundation stack validation passed!");
    } catch (error) {
      console.error("❌ Foundation stack validation failed:", error);
      throw error;
    }
  }

  /**
   * Validate platform stack outputs against real stack
   */
  static async validatePlatformStack(stackName: string = "dev"): Promise<void> {
    console.log(`🔍 Validating Platform Stack: ${stackName}`);

    const validator = new StackValidator();
    const rules = StackValidator.createPlatformRules();
    rules.forEach((rule) => validator.addRule(rule));

    try {
      const stackRef = new pulumi.StackReference(
        `democracy-platform/${stackName}`
      );
      const outputs = await stackRef.outputs;

      if (!outputs || typeof outputs !== "object") {
        throw new Error(`No outputs found for platform stack: ${stackName}`);
      }

      const results = await validator.validateStack("platform", outputs);

      let hasErrors = false;
      results.forEach((result) => {
        const icon = result.passed
          ? "✅"
          : result.severity === "error"
          ? "❌"
          : "⚠️";
        console.log(`${icon} ${result.message}`);
        if (!result.passed && result.severity === "error") {
          hasErrors = true;
        }
      });

      if (hasErrors) {
        throw new Error("Platform stack validation failed");
      }

      console.log("✅ Platform stack validation passed!");
    } catch (error) {
      console.error("❌ Platform stack validation failed:", error);
      throw error;
    }
  }

  /**
   * Validate all stacks
   */
  static async validateAllStacks(stackName: string = "dev"): Promise<void> {
    console.log(`🚀 Validating All Infrastructure Stacks: ${stackName}`);

    try {
      await this.validateFoundationStack(stackName);
      await this.validatePlatformStack(stackName);

      console.log("🎉 All infrastructure validation passed!");
    } catch (error) {
      console.error("💥 Infrastructure validation failed:", error);
      throw error;
    }
  }
}

/**
 * Enhanced validation rules for deployed stacks
 */
export const EnhancedValidationRules = {
  /**
   * Check DNS resolution for domains
   */
  domainDnsResolution: {
    name: "domain-dns-resolution",
    description: "Verify domain DNS records are properly configured",
    validate: async (outputs: Record<string, any>) => {
      if (!outputs.domainName) {
        return {
          passed: false,
          message: "Domain name not found in stack outputs",
          severity: "error" as const,
        };
      }

      try {
        const dns = require("dns").promises;
        await dns.resolve4(outputs.domainName);
        return {
          passed: true,
          message: `Domain ${outputs.domainName} resolves correctly`,
          severity: "info" as const,
        };
      } catch (error) {
        return {
          passed: false,
          message: `Domain ${outputs.domainName} DNS resolution failed: ${error}`,
          severity: "warning" as const,
        };
      }
    },
  },

  /**
   * Check HTTP connectivity to load balancer
   */
  loadBalancerConnectivity: {
    name: "load-balancer-connectivity",
    description: "Verify load balancer is responding to HTTP requests",
    validate: async (outputs: Record<string, any>) => {
      if (!outputs.loadBalancerIp) {
        return {
          passed: false,
          message: "Load balancer IP not found in stack outputs",
          severity: "error" as const,
        };
      }

      try {
        const http = require("http");
        const options = {
          hostname: outputs.loadBalancerIp,
          port: 80,
          timeout: 5000,
        };

        return new Promise((resolve) => {
          const req = http.request(options, (res: any) => {
            resolve({
              passed: true,
              message: `Load balancer at ${outputs.loadBalancerIp} is responding (Status: ${res.statusCode})`,
              severity: "info" as const,
            });
          });

          req.on("error", (error: any) => {
            resolve({
              passed: false,
              message: `Load balancer connectivity test failed: ${error.message}`,
              severity: "warning" as const,
            });
          });

          req.on("timeout", () => {
            resolve({
              passed: false,
              message: `Load balancer connectivity test timed out`,
              severity: "warning" as const,
            });
          });

          req.end();
        });
      } catch (error) {
        return {
          passed: false,
          message: `Load balancer connectivity test error: ${error}`,
          severity: "warning" as const,
        };
      }
    },
  },
};

// Export for use in Pulumi programs
export {
  StackValidator,
  StackValidationRule,
  ValidationResult,
} from "./stack-validator";
