import * as pulumi from "@pulumi/pulumi";

export interface InfrastructureTest {
  name: string;
  description: string;
  test: () => Promise<boolean>;
}

export class InfrastructureTester {
  private tests: InfrastructureTest[] = [];

  addTest(test: InfrastructureTest) {
    this.tests.push(test);
  }

  async runTests(): Promise<{
    passed: number;
    failed: number;
    results: Array<{ name: string; passed: boolean; error?: string }>;
  }> {
    const results = [];
    let passed = 0;
    let failed = 0;

    for (const test of this.tests) {
      try {
        const result = await test.test();
        if (result) {
          passed++;
          results.push({ name: test.name, passed: true });
        } else {
          failed++;
          results.push({
            name: test.name,
            passed: false,
            error: "Test returned false",
          });
        }
      } catch (error) {
        failed++;
        results.push({
          name: test.name,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { passed, failed, results };
  }
}

// Common infrastructure tests
export const commonTests = {
  stackReference: (
    stackRef: pulumi.StackReference,
    expectedOutputs: string[]
  ): InfrastructureTest => ({
    name: "Stack Reference Connectivity",
    description: "Verify that stack reference can access expected outputs",
    test: async () => {
      try {
        for (const output of expectedOutputs) {
          await stackRef.getOutput(output);
        }
        return true;
      } catch {
        return false;
      }
    },
  }),

  resourceHealth: (
    resourceName: string,
    healthCheck: () => Promise<boolean>
  ): InfrastructureTest => ({
    name: `${resourceName} Health Check`,
    description: `Verify that ${resourceName} is healthy and operational`,
    test: healthCheck,
  }),
};

// Re-export advanced testing utilities
export {
  StackValidator,
  StackValidationRule,
  ValidationResult,
} from "./testing/stack-validator";
export {
  runFoundationTests,
  runPlatformTests,
  runAllTests,
} from "./testing/test-runner";
export {
  LiveStackValidator,
  EnhancedValidationRules,
} from "./testing/live-stack-validator";
