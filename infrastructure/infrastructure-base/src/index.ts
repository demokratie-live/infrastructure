/**
 * Infrastructure Base Stack
 *
 * This project manages shared infrastructure resources that are used across
 * multiple environments and projects:
 *
 * - Domains (democracy-app.de, bundestag.io, democracy-deutschland.de)
 * - Firewalls (k8s-public-access, k8s-worker)
 *
 * These resources are managed here once and referenced by other projects
 * via Pulumi stack references to avoid resource ownership conflicts.
 */

import { firewallOutputs } from "./firewalls";
import { domainOutputs } from "./domains";

// Export all shared resource outputs for other projects to reference
export { firewallOutputs };
export { domainOutputs };

// Export combined outputs for easier stack references
export const sharedInfrastructure = {
  firewalls: firewallOutputs,
  domains: domainOutputs,
};
