// Electron-builder matches the version in tagged commits and package.json.

// Our default `package.json` has a dummy version (0.0.0-development) that is
// managed by `semantic-release` when merging PRs to `master`.

// This script temporarily overrides the version in `package.json` during the
// release workflow to match the version in the tagged commit.

// Get the version from the tagged commit
const version = require("child_process")
  .execSync("git describe --tags --abbrev=0")
  .toString()
  .replace(/\n/, "");

console.info(`\n-> Latest tag detected: ${version}`);

// Check version matches semantic versioning (without the leading "v")
// REGEX source: https://gist.github.com/jhorsman/62eeea161a13b80e39f5249281e17c39?permalink_comment_id=3034996#gistcomment-3034996
const isVersionValid =
  /^([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/gm.test(
    version.replace("v", "")
  );

if (isVersionValid) {
  console.info(`\n-> Updating version in package.json\n`);

  // Get the package.json contents and update version
  const pathToPackageJson = require("path").join(
    __dirname,
    "..",
    "package.json"
  );
  const packageJson = require(pathToPackageJson);
  packageJson.version = version;

  // Write the updated package.json
  require("fs").writeFileSync(
    pathToPackageJson,
    JSON.stringify(packageJson, null, 2)
  );
} else {
  throw new Error(`'${version}' is not a valid semantically versioned tag`);
}
