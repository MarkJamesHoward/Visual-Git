const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const TEST_REPO_PATH = path.join(__dirname, "test-repo");
const GIT_DIR = path.join(TEST_REPO_PATH, ".git");

function setupTestRepo() {
  // Always start from a clean slate so tests that mutate the repo (write/add/commit)
  // don't leak state between runs.
  if (fs.existsSync(TEST_REPO_PATH)) {
    fs.rmSync(TEST_REPO_PATH, { recursive: true, force: true });
  }

  console.log("Creating test repository...");

  // Create directory
  fs.mkdirSync(TEST_REPO_PATH, { recursive: true });

  const run = (cmd) => {
    execSync(cmd, { cwd: TEST_REPO_PATH, stdio: "pipe" });
  };

  // Initialize repo with main as default branch
  run("git init -b main");
  run('git config user.email "test@example.com"');
  run('git config user.name "Test User"');

  // Single commit with a single file — keeps the graph minimal for visual tests
  fs.writeFileSync(path.join(TEST_REPO_PATH, "README.md"), "# Test Project\n");
  run("git add README.md");
  run('git commit -m "Initial commit"');

  console.log("Test repository created successfully");
  return TEST_REPO_PATH;
}

module.exports = { setupTestRepo, TEST_REPO_PATH };

// Run setup if called directly
if (require.main === module) {
  setupTestRepo();
}
