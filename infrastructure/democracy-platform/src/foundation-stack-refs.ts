import { createFoundationReference } from "../../shared/src/stack-refs";

/**
 * Foundation stack references for accessing shared infrastructure resources
 * Created by: democracy-foundation project
 * Consumed by: democracy-platform project
 *
 * @deprecated VPCs have been moved to democracy-platform stacks for better isolation
 * This file is kept for backward compatibility but should not be used for new resources
 */

// Reference to the foundation stack using shared utility
const foundationStackRef = createFoundationReference("production");

// VPC outputs from foundation - DEPRECATED
// @deprecated Use VPC from ./vpc.ts instead
export const vpcOutputs = {
  mainVpc: foundationStackRef.getOutput("mainVpc"),
  mainVpcId: foundationStackRef.getOutput("mainVpcId"),
};
