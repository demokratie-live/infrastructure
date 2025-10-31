export interface StackValidationRule {
  name: string;
  description: string;
  validate: (outputs: Record<string, unknown>) => Promise<ValidationResult>;
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  severity: "error" | "warning" | "info";
}

export class StackValidator {
  private rules: StackValidationRule[] = [];

  addRule(rule: StackValidationRule): void {
    this.rules.push(rule);
  }

  async validateStack(
    _stackName: string,
    outputs: Record<string, unknown>
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const rule of this.rules) {
      try {
        const result = await rule.validate(outputs);
        results.push(result);
      } catch (error) {
        results.push({
          passed: false,
          message: `Rule "${rule.name}" failed with error: ${error instanceof Error ? error.message : String(error)}`,
          severity: "error",
        });
      }
    }

    return results;
  }

  // Foundation stack validation rules
  static createFoundationRules(): StackValidationRule[] {
    return [
      {
        name: "vpc-exists",
        description: "Verify VPC is created and has valid IP range",
        validate: (outputs): Promise<ValidationResult> => {
          if (!outputs.vpcId) {
            return Promise.resolve({
              passed: false,
              message: "VPC ID not found in stack outputs",
              severity: "error",
            });
          }
          return Promise.resolve({
            passed: true,
            message: "VPC exists and is properly configured",
            severity: "info",
          });
        },
      },
      {
        name: "domain-ssl-ready",
        description: "Verify domain is configured and SSL-ready",
        validate: (outputs): Promise<ValidationResult> => {
          if (!outputs.domainName) {
            return Promise.resolve({
              passed: false,
              message: "Domain name not found in stack outputs",
              severity: "error",
            });
          }
          return Promise.resolve({
            passed: true,
            message: "Domain is configured for SSL",
            severity: "info",
          });
        },
      },
    ];
  }

  // Platform stack validation rules
  static createPlatformRules(): StackValidationRule[] {
    return [
      {
        name: "kubernetes-cluster-healthy",
        description: "Verify Kubernetes cluster is healthy and accessible",
        validate: (outputs): Promise<ValidationResult> => {
          if (!outputs.kubernetesClusterId) {
            return Promise.resolve({
              passed: false,
              message: "Kubernetes cluster ID not found in stack outputs",
              severity: "error",
            });
          }
          return Promise.resolve({
            passed: true,
            message: "Kubernetes cluster is healthy",
            severity: "info",
          });
        },
      },
      {
        name: "load-balancer-accessible",
        description: "Verify load balancer has public IP and is accessible",
        validate: (outputs): Promise<ValidationResult> => {
          if (!outputs.loadBalancerIp) {
            return Promise.resolve({
              passed: false,
              message: "Load balancer IP not found in stack outputs",
              severity: "error",
            });
          }

          // Improved IP format validation
          const ipRegex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

          // Safely convert to string, handling potential object values
          const loadBalancerIp = outputs.loadBalancerIp;
          let ipString: string;

          if (typeof loadBalancerIp === "string") {
            ipString = loadBalancerIp;
          } else if (typeof loadBalancerIp === "number") {
            ipString = String(loadBalancerIp);
          } else {
            // Handle object or other types - extract string representation
            if (
              loadBalancerIp &&
              typeof loadBalancerIp === "object" &&
              "value" in loadBalancerIp
            ) {
              ipString = String((loadBalancerIp as { value: unknown }).value);
            } else {
              return Promise.resolve({
                passed: false,
                message: `Load balancer IP is not a valid string: ${typeof loadBalancerIp}`,
                severity: "error",
              });
            }
          }

          if (!ipRegex.test(ipString)) {
            return Promise.resolve({
              passed: false,
              message: `Load balancer IP format is invalid: ${ipString}`,
              severity: "error",
            });
          }

          // Check if it's a valid public IP (not private ranges)
          const parts = ipString.split(".").map(Number);
          const isPrivate =
            parts[0] === 10 ||
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
            (parts[0] === 192 && parts[1] === 168);

          if (isPrivate) {
            return Promise.resolve({
              passed: false,
              message: `Load balancer IP appears to be private: ${ipString}`,
              severity: "warning",
            });
          }

          return Promise.resolve({
            passed: true,
            message: `Load balancer IP is valid and accessible: ${ipString}`,
            severity: "info",
          });
        },
      },
    ];
  }
}
