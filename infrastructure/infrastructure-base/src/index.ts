/**
 * Infrastructure Base Stack
 *
 * This project manages shared infrastructure resources that are used across
 * multiple environments and projects:
 *
 * - Domains (democracy-app.de, bundestag.io, democracy-deutschland.de)
 *
 * These resources are managed here once and referenced by other projects
 * via Pulumi stack references to avoid resource ownership conflicts.
 */

import { domainOutputs } from "./domains";

// Export all shared resource outputs for other projects to reference
export { domainOutputs };

// Export combined outputs for easier stack references
export const sharedInfrastructure = {
  domains: domainOutputs,
};
