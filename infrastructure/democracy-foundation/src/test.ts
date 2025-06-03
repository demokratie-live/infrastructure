import { runFoundationTests } from "@democracy/shared-infrastructure";

async function main(): Promise<void> {
  console.log("🏗️  Testing Democracy Foundation Infrastructure...");

  try {
    await runFoundationTests();
    console.log("✅ Foundation tests completed successfully!");
  } catch (error) {
    console.error("❌ Foundation tests failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
