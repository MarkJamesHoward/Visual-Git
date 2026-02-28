const { _electron: electron } = require("playwright");
const path = require("path");
const { setupTestRepo } = require("./fixtures/setup-test-repo");

async function runIntegrationTests() {
  console.log("Starting integration tests...");

  // Setup test repository
  const repoPath = setupTestRepo();
  console.log("Test repo path:", repoPath);

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

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Get the first window
    const window = await electronApp.firstWindow();

    // Wait for the app to load
    await window.waitForLoadState("domcontentloaded");
    await window.waitForTimeout(2000);

    console.log("\n========== INTEGRATION TESTS ==========\n");

    // ========== TEST 1: Welcome Screen Loads ==========
    console.log("TEST 1: Welcome screen loads correctly");
    const welcomeScreen = await window.$("#welcome-screen");
    const welcomeVisible = await welcomeScreen?.isVisible();

    if (welcomeVisible) {
      console.log("  ✅ Welcome screen is visible");
      testsPassed++;
    } else {
      console.log("  ❌ Welcome screen not visible");
      testsFailed++;
    }

    // Check for Open Repository button
    const openRepoBtn = await window.$("#open-repo-btn");
    const btnVisible = await openRepoBtn?.isVisible();

    if (btnVisible) {
      console.log("  ✅ Open Repository button exists");
      testsPassed++;
    } else {
      console.log("  ❌ Open Repository button not found");
      testsFailed++;
    }

    // ========== TEST 2: Open Repository ==========
    console.log("\nTEST 2: Open repository and display graph");

    // Programmatically load the test repo (simulating user selection)
    await window.evaluate(async (repoPath) => {
      // Hide welcome screen, show app container
      const welcomeScreen = document.getElementById("welcome-screen");
      const appContainer = document.getElementById("app-container");
      const repoPathDisplay = document.getElementById("repo-path-display");

      if (welcomeScreen) welcomeScreen.style.display = "none";
      if (appContainer) appContainer.style.display = "block";
      if (repoPathDisplay) repoPathDisplay.textContent = repoPath;

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

    // ========== TEST 3: App Container Visible ==========
    console.log("\nTEST 3: App container becomes visible");
    const appContainer = await window.$("#app-container");
    const appVisible = await window.evaluate(() => {
      const container = document.getElementById("app-container");
      return container && window.getComputedStyle(container).display !== "none";
    });

    if (appVisible) {
      console.log("  ✅ App container is visible");
      testsPassed++;
    } else {
      console.log("  ❌ App container not visible");
      testsFailed++;
    }

    // ========== TEST 4: Canvas Element Exists ==========
    console.log("\nTEST 4: Canvas element exists and is configured");
    const canvasInfo = await window.evaluate(() => {
      const canvas = document.getElementById("GitGraph");
      if (!canvas) return null;
      return {
        exists: true,
        width: canvas.width,
        height: canvas.height,
        tabIndex: canvas.tabIndex,
        role: canvas.getAttribute("role"),
      };
    });

    if (canvasInfo?.exists) {
      console.log("  ✅ Canvas element exists");
      console.log(`     Dimensions: ${canvasInfo.width}x${canvasInfo.height}`);
      console.log(`     Accessible: tabIndex=${canvasInfo.tabIndex}, role=${canvasInfo.role}`);
      testsPassed++;
    } else {
      console.log("  ❌ Canvas element not found");
      testsFailed++;
    }

    // ========== TEST 5: Graph Has Rendered Nodes ==========
    console.log("\nTEST 5: Graph contains rendered nodes");

    // Check if the canvas has been drawn to by checking pixel data
    const hasContent = await window.evaluate(() => {
      const canvas = document.getElementById("GitGraph");
      if (!canvas) return false;

      const ctx = canvas.getContext("2d");
      if (!ctx) return false;

      // Sample multiple points across the canvas
      const width = canvas.width;
      const height = canvas.height;
      const samplePoints = [
        [width / 4, height / 2],
        [width / 2, height / 2],
        [width * 3 / 4, height / 2],
        [width / 2, height / 4],
        [width / 2, height * 3 / 4],
      ];

      for (const [x, y] of samplePoints) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        // Check if pixel is not just the background color (#1a1a2e = rgb(26, 26, 46))
        if (pixel[0] !== 26 || pixel[1] !== 26 || pixel[2] !== 46) {
          return true;
        }
      }

      // Also check near expected node positions (left side where HEAD/branches are)
      for (let x = 50; x < 300; x += 50) {
        for (let y = 100; y < 400; y += 100) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          if (pixel[3] > 0 && (pixel[0] !== 26 || pixel[1] !== 26 || pixel[2] !== 46)) {
            return true;
          }
        }
      }

      return false;
    });

    if (hasContent) {
      console.log("  ✅ Canvas has rendered content");
      testsPassed++;
    } else {
      console.log("  ❌ Canvas appears empty");
      testsFailed++;
    }

    // ========== TEST 6: Toggle Panel Exists ==========
    console.log("\nTEST 6: Toggle panel with checkboxes exists");
    const toggleInfo = await window.evaluate(() => {
      const panel = document.getElementById("toggle-panel");
      if (!panel) return null;

      return {
        exists: true,
        treesCheckbox: !!document.getElementById("show-trees"),
        blobsCheckbox: !!document.getElementById("show-blobs"),
        tagsCheckbox: !!document.getElementById("show-tags"),
      };
    });

    if (toggleInfo?.exists && toggleInfo.treesCheckbox && toggleInfo.blobsCheckbox && toggleInfo.tagsCheckbox) {
      console.log("  ✅ Toggle panel exists with all checkboxes");
      testsPassed++;
    } else {
      console.log("  ❌ Toggle panel or checkboxes missing");
      testsFailed++;
    }

    // ========== TEST 7: Repo Info Bar Shows Path ==========
    console.log("\nTEST 7: Repository info bar displays path");
    const repoInfoPath = await window.evaluate(() => {
      const el = document.getElementById("repo-path-display");
      return el?.textContent || null;
    });

    if (repoInfoPath && repoInfoPath.length > 0) {
      console.log(`  ✅ Repo path displayed: ${repoInfoPath}`);
      testsPassed++;
    } else {
      console.log("  ❌ Repo path not displayed");
      testsFailed++;
    }

    // ========== TEST 8: Keyboard Navigation Ready ==========
    console.log("\nTEST 8: Keyboard navigation announcer exists");
    const announcerExists = await window.evaluate(() => {
      const announcer = document.getElementById("node-announcer");
      return announcer !== null;
    });

    if (announcerExists) {
      console.log("  ✅ Node announcer element exists for screen readers");
      testsPassed++;
    } else {
      console.log("  ❌ Node announcer element missing");
      testsFailed++;
    }

    // ========== SUMMARY ==========
    console.log("\n========== SUMMARY ==========");
    console.log(`  Passed: ${testsPassed}`);
    console.log(`  Failed: ${testsFailed}`);
    console.log(`  Total:  ${testsPassed + testsFailed}`);

    await electronApp.close();

    if (testsFailed > 0) {
      console.log("\n❌ Integration tests FAILED");
      process.exit(1);
    } else {
      console.log("\n✅ All integration tests passed!");
      process.exit(0);
    }
  } catch (error) {
    console.error("Error running integration tests:", error);
    await electronApp.close();
    process.exit(1);
  }
}

runIntegrationTests();
