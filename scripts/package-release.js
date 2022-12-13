// Electron-builder matches the version in tagged commits and package.json.

// Our default `package.json` has a dummy version (0.0.0-development) that is
// managed by `semantic-release` when merging PRs to `master`.

// This script temporarily overrides the version in `package.json` during the
// release workflow to match the version in the tagged commit.

// Get the version from the tagged commit
const version = process.env.APP_VERSION;

// Check version matches semantic versioning (without the leading "v")
// REGEX source: https://gist.github.com/jhorsman/62eeea161a13b80e39f5249281e17c39?permalink_comment_id=3034996#gistcomment-3034996
const isVersionValid =
  /^([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/gm.test(
    version.replace("v", "")
  );

if (isVersionValid) {
  console.info(`\n-> Updating version in package.json\n`);

  // Get the package.json contents
  const pathToElectronPackageJson = require("path").join(__dirname, "..", "package.json"); // prettier-ignore
  const pathToSvelteKitPackageJson = require("path").join(__dirname, "..", "resources", "sveltekit", "package.json"); // prettier-ignore

  const electronPackageJson = require(pathToElectronPackageJson);
  const svelteKitPackageJson = require(pathToSvelteKitPackageJson);

  // Update the version on both package.json files
  electronPackageJson.version = version;
  svelteKitPackageJson.version = version;

  // Write the updated package.json
  require("fs").writeFileSync(pathToElectronPackageJson, JSON.stringify(electronPackageJson, null, 2)); // prettier-ignore
  require("fs").writeFileSync(pathToSvelteKitPackageJson, JSON.stringify(svelteKitPackageJson, null, 2)); // prettier-ignore
} else {
  throw new Error(`'${version}' is not a valid semantically versioned tag`);
}
