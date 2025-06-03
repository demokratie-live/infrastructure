import { runPlatformTests } from "@democracy/shared-infrastructure";

async function main(): Promise<void> {
  console.log("🚀 Testing Democracy Platform Infrastructure...");

  try {
    await runPlatformTests();

    console.log("✅ Platform tests completed successfully!");
  } catch (error) {
    console.error("❌ Platform tests failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
