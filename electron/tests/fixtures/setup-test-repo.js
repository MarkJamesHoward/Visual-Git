const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const TEST_REPO_PATH = path.join(__dirname, "test-repo");
const GIT_DIR = path.join(TEST_REPO_PATH, ".git");

function setupTestRepo() {
  // If test repo already exists, skip setup
  if (fs.existsSync(GIT_DIR)) {
    console.log("Test repo already exists, skipping setup");
    return TEST_REPO_PATH;
  }

  console.log("Creating test repository...");

  // Create directory
  fs.mkdirSync(TEST_REPO_PATH, { recursive: true });

  const run = (cmd) => {
    execSync(cmd, { cwd: TEST_REPO_PATH, stdio: "pipe" });
  };

  // Initialize repo
  run("git init");
  run('git config user.email "test@example.com"');
  run('git config user.name "Test User"');

  // Commit 1: Add README
  fs.writeFileSync(path.join(TEST_REPO_PATH, "README.md"), "# Test Project\n");
  run("git add README.md");
  run('git commit -m "Initial commit: Add README"');

  // Commit 2: Add index.js
  fs.writeFileSync(
    path.join(TEST_REPO_PATH, "index.js"),
    "module.exports = { name: 'test' };\n",
  );
  run("git add index.js");
  run('git commit -m "Add index.js"');

  // Create feature branch from this point
  run("git checkout -b feature");
  fs.writeFileSync(
    path.join(TEST_REPO_PATH, "feature.js"),
    "// Feature implementation\n",
  );
  run("git add feature.js");
  run('git commit -m "Add feature implementation"');

  // Switch back to main and add third commit
  run("git checkout main");
  fs.writeFileSync(
    path.join(TEST_REPO_PATH, "config.json"),
    '{ "name": "test-repo" }\n',
  );
  run("git add config.json");
  run('git commit -m "Add config.json"');

  console.log("Test repository created successfully");
  return TEST_REPO_PATH;
}

module.exports = { setupTestRepo, TEST_REPO_PATH };

// Run setup if called directly
if (require.main === module) {
  setupTestRepo();
}
