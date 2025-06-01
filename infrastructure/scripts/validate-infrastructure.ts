#!/usr/bin/env tsx

import { runAllTests } from "../shared/src/testing";

async function main() {
  console.log("🔍 Democracy Infrastructure Validation");
  console.log("=====================================");

  try {
    await runAllTests();
    console.log("✅ All infrastructure validation checks passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Infrastructure validation failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
