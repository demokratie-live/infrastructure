/**
 * Basic test to validate the DNS records configuration
 */

import * as pulumi from "@pulumi/pulumi";

function testDnsRecordsConfiguration(): void {
  console.log("🧪 Testing DNS Records Configuration...");

  // Create a mock config to test the configuration parsing
  const config = new pulumi.Config();

  try {
    // Test that we can read the DNS records configuration
    const dnsRecordsRaw = config.getObject("dnsRecords");

    if (!dnsRecordsRaw) {
      console.log(
        "⚠️  No DNS records configuration found - this is expected in test environment"
      );
      return;
    }

    // Handle the configuration format
    let dnsRecords: unknown[];
    if (Array.isArray(dnsRecordsRaw)) {
      dnsRecords = dnsRecordsRaw;
    } else if (
      dnsRecordsRaw &&
      typeof dnsRecordsRaw === "object" &&
      "value" in dnsRecordsRaw
    ) {
      const recordsConfig = dnsRecordsRaw as { value: unknown };
      if (Array.isArray(recordsConfig.value)) {
        dnsRecords = recordsConfig.value;
      } else {
        throw new Error("DNS records configuration value is not an array");
      }
    } else {
      throw new Error("DNS records configuration is not in expected format");
    }

    console.log(`✅ Found ${dnsRecords.length} DNS records configured`);

    // Validate each record has required fields
    dnsRecords.forEach((record, index) => {
      const dnsRecord = record as {
        domain?: string;
        name?: string;
        type?: string;
        value?: string;
      };
      if (
        !dnsRecord.domain ||
        !dnsRecord.name ||
        !dnsRecord.type ||
        !dnsRecord.value
      ) {
        throw new Error(`DNS record ${index} is missing required fields`);
      }
    });

    console.log("✅ All DNS records have valid configuration");
  } catch (error) {
    console.error("❌ DNS records configuration test failed:", error);
    throw error;
  }
}

function main(): void {
  console.log("🏗️  Testing Democracy Foundation Infrastructure...");

  try {
    testDnsRecordsConfiguration();
    console.log("✅ Foundation tests completed successfully!");
  } catch (error) {
    console.error("❌ Foundation tests failed:", error);
    process.exit(1);
  }
}

main();
