const fs = require("fs");
const path = require("path");

exports.default = async function (context) {
  // Only apply to Linux builds
  if (context.electronPlatformName !== "linux") {
    return;
  }

  const appDir = context.appOutDir;
  const binaryName = context.packager.executableName;
  const binaryPath = path.join(appDir, binaryName);
  const renamedPath = path.join(appDir, `${binaryName}.bin`);
  const wrapperSource = path.join(__dirname, "..", "build", "linux", "launcher.sh");

  console.log(`Linux afterPack: Setting up --no-sandbox wrapper`);
  console.log(`  Binary: ${binaryPath}`);

  // Rename the original binary
  if (fs.existsSync(binaryPath)) {
    fs.renameSync(binaryPath, renamedPath);
    console.log(`  Renamed to: ${renamedPath}`);

    // Copy wrapper script as the main binary name
    fs.copyFileSync(wrapperSource, binaryPath);
    fs.chmodSync(binaryPath, 0o755);
    console.log(`  Wrapper installed: ${binaryPath}`);
  }
};
