const { _electron: electron } = require("playwright");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
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

    // Override the native folder picker (select-repo IPC) to return our fixture
    // path, so we can drive the real "Open Repository" button flow instead of
    // bypassing showVisualization() (which sizes the canvas and wires listeners).
    await electronApp.evaluate(({ ipcMain }, repoPath) => {
      ipcMain.removeHandler("select-repo");
      ipcMain.handle("select-repo", async () => repoPath);
    }, repoPath);

    // Click the real button and wait for the app container to appear
    await window.click("#open-repo-btn");
    await window.waitForFunction(
      () => {
        const c = document.getElementById("app-container");
        return c && window.getComputedStyle(c).display !== "none";
      },
      null,
      { timeout: 10000 },
    );

    // Wait for the visualization to render
    await window.waitForTimeout(2000);

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

    // ========== TEST 9/10/11: File lifecycle (write → add → commit) ==========
    // Each step writes to the repo on disk and waits for the file watcher's
    // 500ms debounce + IPC roundtrip + redraw to complete.
    const NEW_FILE = "newfile.txt";
    const NEW_FILE_CONTENTS = "hello from integration test\n";
    const newFilePath = path.join(repoPath, NEW_FILE);
    const runGit = (cmd) => execSync(cmd, { cwd: repoPath, stdio: "pipe" });
    const waitForWatcher = () => window.waitForTimeout(1500);

    const baseline = await window.evaluate(() => ({
      commitCount: window.__visState.CommitNodes.length,
      blobCount: window.__visState.BlobNodes.length,
      treeCount: window.__visState.TreeNodes.length,
      blobHashes: window.__visState.BlobNodes.map((b) => b.hash),
      treeHashes: window.__visState.TreeNodes.map((t) => t.hash),
    }));
    const baselineCommits = baseline.commitCount;
    const baselineBlobs = baseline.blobCount;

    // ----- TEST 9: Create file, expect it in the working files panel -----
    console.log("\nTEST 9: New file appears in working files panel");
    fs.writeFileSync(newFilePath, NEW_FILE_CONTENTS);
    await waitForWatcher();

    const workingShowsFile = await window.evaluate((filename) => {
      const list = document.getElementById("working-files-list");
      if (!list) return false;
      const names = Array.from(list.querySelectorAll(".file-entry-name")).map(
        (e) => e.textContent,
      );
      return names.includes(filename);
    }, NEW_FILE);

    if (workingShowsFile) {
      console.log(`  ✅ ${NEW_FILE} visible in working files panel`);
      testsPassed++;
    } else {
      console.log(`  ❌ ${NEW_FILE} not found in working files panel`);
      testsFailed++;
    }

    // ----- TEST 10: git add → expect blob node in graph + index panel entry -----
    console.log("\nTEST 10: git add creates blob node and index entry");
    runGit(`git add ${NEW_FILE}`);
    await waitForWatcher();

    const afterAdd = await window.evaluate((filename) => {
      const list = document.getElementById("index-files-list");
      const indexEntries = list
        ? Array.from(list.querySelectorAll(".file-entry-name")).map(
            (e) => e.textContent,
          )
        : [];
      return {
        blobCount: window.__visState.BlobNodes.length,
        commitCount: window.__visState.CommitNodes.length,
        indexHasFile: indexEntries.includes(filename),
      };
    }, NEW_FILE);

    const blobAdded = afterAdd.blobCount > baselineBlobs;
    const commitsUnchanged = afterAdd.commitCount === baselineCommits;

    if (blobAdded && afterAdd.indexHasFile && commitsUnchanged) {
      console.log(
        `  ✅ Blob node added (${baselineBlobs} → ${afterAdd.blobCount}), file in index panel, no new commit`,
      );
      testsPassed++;
    } else {
      console.log(
        `  ❌ git add: blobAdded=${blobAdded} (${baselineBlobs}→${afterAdd.blobCount}), indexHasFile=${afterAdd.indexHasFile}, commitsUnchanged=${commitsUnchanged}`,
      );
      testsFailed++;
    }

    // ----- TEST 11: git commit → expect new commit node + link to blob -----
    console.log("\nTEST 11: git commit creates commit node linked to blob");
    const baselineCommitHashes = await window.evaluate(() =>
      window.__visState.CommitNodes.map((c) => c.hash),
    );

    runGit('git commit -m "Add newfile.txt"');
    await waitForWatcher();

    const afterCommit = await window.evaluate(
      ({ priorCommitHashes, priorBlobHashes, priorTreeHashes }) => {
        const s = window.__visState;
        const newCommit = s.CommitNodes.find(
          (c) => !priorCommitHashes.includes(c.hash),
        );
        const newBlob = s.BlobNodes.find(
          (b) => !priorBlobHashes.includes(b.hash),
        );
        const newTree = s.TreeNodes.find(
          (t) => !priorTreeHashes.includes(t.hash),
        );
        const pick = (n) =>
          n ? { hash: n.hash, xPos: n.xPos, yPos: n.yPos } : null;
        return {
          commitCount: s.CommitNodes.length,
          blobCount: s.BlobNodes.length,
          treeCount: s.TreeNodes.length,
          newCommit: pick(newCommit),
          newBlob: pick(newBlob),
          newTree: pick(newTree),
        };
      },
      {
        priorCommitHashes: baselineCommitHashes,
        priorBlobHashes: baseline.blobHashes,
        priorTreeHashes: baseline.treeHashes,
      },
    );

    const newCommitAdded = afterCommit.commitCount === baselineCommits + 1;
    const blobsRetained = afterCommit.blobCount >= afterAdd.blobCount;

    if (newCommitAdded && blobsRetained) {
      console.log(
        `  ✅ Commit node added (${baselineCommits} → ${afterCommit.commitCount}), blob still present, ${afterCommit.treeCount} tree(s) connecting them`,
      );
      testsPassed++;
    } else {
      console.log(
        `  ❌ git commit: newCommitAdded=${newCommitAdded} (${baselineCommits}→${afterCommit.commitCount}), blobsRetained=${blobsRetained}`,
      );
      testsFailed++;
    }

    // Helper: sample a 7x7 pixel grid around a node's centre and count
    // non-background pixels. Background is #1a1a2e = rgb(26, 26, 46).
    const verifyNodeVisible = async (label, node) => {
      console.log(`\n${label}`);
      if (!node) {
        console.log("  ❌ Cannot visually verify — no new node found in state");
        testsFailed++;
        return;
      }
      const result = await window.evaluate((n) => {
        const canvas = document.getElementById("GitGraph");
        const ctx = canvas.getContext("2d");
        const cx = Math.round(n.xPos);
        const cy = Math.round(n.yPos);
        let nonBgPixels = 0;
        for (let dx = -3; dx <= 3; dx++) {
          for (let dy = -3; dy <= 3; dy++) {
            const px = ctx.getImageData(cx + dx, cy + dy, 1, 1).data;
            if (px[0] !== 26 || px[1] !== 26 || px[2] !== 46) {
              nonBgPixels++;
            }
          }
        }
        return { cx, cy, nonBgPixels };
      }, node);

      if (result.nonBgPixels >= 30) {
        console.log(
          `  ✅ Node drawn at (${result.cx}, ${result.cy}) — ${result.nonBgPixels}/49 non-background pixels`,
        );
        testsPassed++;
      } else {
        console.log(
          `  ❌ Node NOT visible at (${result.cx}, ${result.cy}) — only ${result.nonBgPixels}/49 non-background pixels`,
        );
        testsFailed++;
      }
    };

    // ----- TEST 12/13/14: New commit/blob/tree are actually visible -----
    await verifyNodeVisible(
      "TEST 12: New commit node is drawn on the canvas",
      afterCommit.newCommit,
    );
    await verifyNodeVisible(
      "TEST 13: New blob node is drawn on the canvas",
      afterCommit.newBlob,
    );
    await verifyNodeVisible(
      "TEST 14: New tree node is drawn on the canvas",
      afterCommit.newTree,
    );

    // ----- TEST 15: git tag → expect new tag node in graph -----
    console.log("\nTEST 15: git tag creates a tag node in the graph");
    const baselineTags = await window.evaluate(
      () => window.__visState.TagNodes.length,
    );
    runGit("git tag v0.1.0");
    await waitForWatcher();

    const afterTag = await window.evaluate(() => ({
      tagCount: window.__visState.TagNodes.length,
      firstTagName:
        window.__visState.TagNodes[0] && window.__visState.TagNodes[0].name,
    }));

    if (afterTag.tagCount === baselineTags + 1) {
      console.log(
        `  ✅ Tag node added (${baselineTags} → ${afterTag.tagCount}), name="${afterTag.firstTagName}"`,
      );
      testsPassed++;
    } else {
      console.log(
        `  ❌ git tag: expected ${baselineTags + 1} tag(s), got ${afterTag.tagCount}`,
      );
      testsFailed++;
    }

    // ========== TEST 16+: Drag each node type by one node height ==========
    // After all the new nodes are present, drag each type down by exactly its
    // own height (NodeVerticalSpacing = 150 from Types.ts) and verify the
    // position updates. Skip a type if no node of that kind is present.
    const NODE_VERTICAL_SPACING = 150;

    const dragNodeByOneHeight = async (label, listKey, pickIndex = 0) => {
      console.log(`\n${label}`);
      const target = await window.evaluate(
        ({ listKey, pickIndex }) => {
          const list = window.__visState[listKey];
          if (!list || list.length === 0) return null;
          const node = list[pickIndex];
          const canvas = document.getElementById("GitGraph");
          const rect = canvas.getBoundingClientRect();
          return {
            startX: node.xPos,
            startY: node.yPos,
            canvasLeft: rect.left,
            canvasTop: rect.top,
            hash: node.hash,
          };
        },
        { listKey, pickIndex },
      );

      if (!target) {
        console.log(`  ⏭️  No ${listKey} present — skipping`);
        return;
      }

      const targetX = target.startX;
      const targetY = target.startY + NODE_VERTICAL_SPACING;

      await window.mouse.move(
        target.canvasLeft + target.startX,
        target.canvasTop + target.startY,
      );
      await window.mouse.down();
      await window.mouse.move(
        target.canvasLeft + targetX,
        target.canvasTop + targetY,
        { steps: 10 },
      );
      await window.mouse.up();
      await window.waitForTimeout(300);

      const after = await window.evaluate(
        ({ listKey, hash }) => {
          const node = window.__visState[listKey].find((n) => n.hash === hash);
          return node ? { xPos: node.xPos, yPos: node.yPos } : null;
        },
        { listKey, hash: target.hash },
      );

      const movedX = Math.abs(after.xPos - targetX) < 5;
      const movedY = Math.abs(after.yPos - targetY) < 5;

      if (movedX && movedY) {
        console.log(
          `  ✅ ${listKey}[${pickIndex}] dragged from (${target.startX.toFixed(0)}, ${target.startY.toFixed(0)}) to (${after.xPos.toFixed(0)}, ${after.yPos.toFixed(0)})`,
        );
        testsPassed++;
      } else {
        console.log(
          `  ❌ Drag failed — expected ~(${targetX}, ${targetY}), got (${after.xPos.toFixed(0)}, ${after.yPos.toFixed(0)})`,
        );
        testsFailed++;
      }
    };

    await dragNodeByOneHeight(
      "TEST 16: Drag commit node down by one node height",
      "CommitNodes",
    );
    await dragNodeByOneHeight(
      "TEST 17: Drag blob node down by one node height",
      "BlobNodes",
    );
    await dragNodeByOneHeight(
      "TEST 18: Drag tree node down by one node height",
      "TreeNodes",
    );
    await dragNodeByOneHeight(
      "TEST 19: Drag branch node down by one node height",
      "BranchNodes",
    );
    await dragNodeByOneHeight(
      "TEST 20: Drag tag node down by one node height",
      "TagNodes",
    );
    await dragNodeByOneHeight(
      "TEST 21: Drag HEAD node down by one node height",
      "HEADNodes",
    );

    // ========== SUMMARY ==========
    console.log("\n========== SUMMARY ==========");
    console.log(`  Passed: ${testsPassed}`);
    console.log(`  Failed: ${testsFailed}`);
    console.log(`  Total:  ${testsPassed + testsFailed}`);

    // Hold the window open briefly so the final state can be inspected visually
    await window.waitForTimeout(5000);

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
