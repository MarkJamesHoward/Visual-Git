const { _electron: electron } = require("playwright");
const path = require("path");
const fs = require("fs");

async function runAccessibilityTests() {
  console.log("Starting accessibility tests...");

  // Get the path to the Electron executable
  const electronPath = require("electron");

  console.log("Electron path:", electronPath);
  console.log("Main script:", path.join(__dirname, "..", "dist", "main", "main.js"));

  // Launch Electron app
  const electronApp = await electron.launch({
    executablePath: electronPath,
    args: [path.join(__dirname, "..", "dist", "main", "main.js")],
    env: {
      ...process.env,
      NODE_ENV: "test",
    },
  });

  // Get the first window
  const window = await electronApp.firstWindow();

  // Wait for the app to load
  await window.waitForLoadState("domcontentloaded");
  await window.waitForTimeout(2000); // Give app time to fully render

  console.log("App loaded, injecting axe-core...");

  // Read axe-core from node_modules
  const axeCorePath = require.resolve("axe-core");
  const axeSource = fs.readFileSync(axeCorePath, "utf8");

  // Inject axe-core into the page
  await window.evaluate(axeSource);

  console.log("Running accessibility audit...");

  try {
    // Run axe and get results
    const results = await window.evaluate(() => {
      return new Promise((resolve, reject) => {
        window.axe
          .run(document, {
            runOnly: {
              type: "tag",
              values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
            },
          })
          .then(resolve)
          .catch(reject);
      });
    });

    const violations = results.violations;

    if (violations.length > 0) {
      console.log("\n❌ Accessibility violations found:\n");

      violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   Affected elements:`);
        violation.nodes.forEach((node) => {
          console.log(`     - ${node.target.join(", ")}`);
          if (node.failureSummary) {
            console.log(`       ${node.failureSummary}`);
          }
        });
        console.log("");
      });

      // Count by impact level
      const critical = violations.filter((v) => v.impact === "critical").length;
      const serious = violations.filter((v) => v.impact === "serious").length;
      const moderate = violations.filter((v) => v.impact === "moderate").length;
      const minor = violations.filter((v) => v.impact === "minor").length;

      console.log("Summary:");
      console.log(`  Critical: ${critical}`);
      console.log(`  Serious: ${serious}`);
      console.log(`  Moderate: ${moderate}`);
      console.log(`  Minor: ${minor}`);
      console.log(`  Total: ${violations.length}`);

      await electronApp.close();

      // Fail on critical or serious violations
      if (critical > 0 || serious > 0) {
        console.log(
          "\n❌ Test FAILED: Critical or serious accessibility violations found",
        );
        process.exit(1);
      } else {
        console.log(
          "\n⚠️  Test PASSED with warnings: Only minor/moderate violations found",
        );
        process.exit(0);
      }
    } else {
      console.log("\n✅ No accessibility violations found!");
      await electronApp.close();
      process.exit(0);
    }
  } catch (error) {
    console.error("Error running accessibility tests:", error);
    await electronApp.close();
    process.exit(1);
  }
}

runAccessibilityTests();
