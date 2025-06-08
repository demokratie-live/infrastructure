import { createFoundationReference } from "../../shared/src/stack-refs";

/**
 * Foundation stack references for accessing shared infrastructure resources
 * Created by: democracy-foundation project
 * Consumed by: democracy-platform project
 */

// Reference to the foundation stack using shared utility
const foundationStackRef = createFoundationReference("production");

// VPC outputs from foundation
export const vpcOutputs = {
  mainVpc: foundationStackRef.getOutput("mainVpc"),
  mainVpcId: foundationStackRef.getOutput("mainVpcId"),
};
