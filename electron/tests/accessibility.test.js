const { _electron: electron } = require("playwright");
const path = require("path");
const fs = require("fs");
const { setupTestRepo } = require("./fixtures/setup-test-repo");

async function runAxeAudit(window, pageName) {
  console.log(`\n--- Running accessibility audit on: ${pageName} ---`);

  // Read axe-core from node_modules
  const axeCorePath = require.resolve("axe-core");
  const axeSource = fs.readFileSync(axeCorePath, "utf8");

  // Inject axe-core into the page
  await window.evaluate(axeSource);

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

  return results.violations;
}

function reportViolations(violations, pageName) {
  if (violations.length > 0) {
    console.log(`\n❌ Accessibility violations on ${pageName}:\n`);

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
  } else {
    console.log(`✅ No accessibility violations on ${pageName}`);
  }

  return violations;
}

async function runAccessibilityTests() {
  console.log("Starting accessibility tests...");

  // Get the path to the Electron executable
  const electronPath = require("electron");

  console.log("Electron path:", electronPath);
  console.log(
    "Main script:",
    path.join(__dirname, "..", "dist", "main", "main.js"),
  );

  // Launch Electron app (--no-sandbox needed for CI/container environments)
  const isCI = process.env.CI === "true" || process.env.CI === true;
  const electronApp = await electron.launch({
    executablePath: electronPath,
    args: [
      path.join(__dirname, "..", "dist", "main", "main.js"),
      ...(isCI ? ["--no-sandbox", "--disable-gpu"] : []),
    ],
    env: {
      ...process.env,
      NODE_ENV: "test",
    },
  });

  const allViolations = [];

  try {
    // Get the first window
    const window = await electronApp.firstWindow();

    // Wait for the app to load
    await window.waitForLoadState("domcontentloaded");
    await window.waitForTimeout(2000);

    console.log("App loaded successfully");

    // ========== TEST 1: Welcome Screen ==========
    const welcomeViolations = await runAxeAudit(window, "Welcome Screen");
    reportViolations(welcomeViolations, "Welcome Screen");
    allViolations.push(...welcomeViolations);

    // ========== TEST 2: Repository View ==========
    // Create/ensure test repo with minimal commits for clean visualization
    const repoPath = setupTestRepo();
    const gitDir = path.join(repoPath, ".git");

    if (fs.existsSync(gitDir)) {
      console.log(`\nOpening repository: ${repoPath}`);

      // Trigger the IPC to read the git repo directly (simulating repo selection)
      await window.evaluate(async (repoPath) => {
        // Hide welcome screen, show app container
        const welcomeScreen = document.getElementById("welcome-screen");
        const appContainer = document.getElementById("app-container");

        if (welcomeScreen) welcomeScreen.style.display = "none";
        if (appContainer) appContainer.style.display = "block";

        // Call the electronAPI to load the repo
        if (window.electronAPI && window.electronAPI.readGitRepo) {
          try {
            await window.electronAPI.readGitRepo(repoPath);
          } catch (e) {
            console.error("Error loading repo:", e);
          }
        }
      }, repoPath);

      // Wait for the visualization to render
      await window.waitForTimeout(3000);

      // Check if app container is now visible
      const isAppVisible = await window.evaluate(() => {
        const appContainer = document.getElementById("app-container");
        return (
          appContainer &&
          window.getComputedStyle(appContainer).display !== "none"
        );
      });

      if (isAppVisible) {
        console.log("Repository view loaded, running accessibility audit...");

        const repoViolations = await runAxeAudit(window, "Repository View");
        reportViolations(repoViolations, "Repository View");
        allViolations.push(...repoViolations);
      } else {
        console.log(
          "⚠️  Could not switch to repository view, skipping that test",
        );
      }
    } else {
      console.log(
        `⚠️  No git repository found at ${repoPath}, skipping repository view test`,
      );
    }

    // ========== SUMMARY ==========
    console.log("\n========== SUMMARY ==========");

    const critical = allViolations.filter((v) => v.impact === "critical").length;
    const serious = allViolations.filter((v) => v.impact === "serious").length;
    const moderate = allViolations.filter((v) => v.impact === "moderate").length;
    const minor = allViolations.filter((v) => v.impact === "minor").length;

    console.log(`  Critical: ${critical}`);
    console.log(`  Serious: ${serious}`);
    console.log(`  Moderate: ${moderate}`);
    console.log(`  Minor: ${minor}`);
    console.log(`  Total: ${allViolations.length}`);

    await electronApp.close();

    // Fail on critical or serious violations
    if (critical > 0 || serious > 0) {
      console.log(
        "\n❌ Test FAILED: Critical or serious accessibility violations found",
      );
      process.exit(1);
    } else if (allViolations.length > 0) {
      console.log(
        "\n⚠️  Test PASSED with warnings: Only minor/moderate violations found",
      );
      process.exit(0);
    } else {
      console.log("\n✅ All accessibility tests passed!");
      process.exit(0);
    }
  } catch (error) {
    console.error("Error running accessibility tests:", error);
    await electronApp.close();
    process.exit(1);
  }
}

runAccessibilityTests();
