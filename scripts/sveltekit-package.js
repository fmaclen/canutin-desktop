// This script is used to prepare the SvelteKit build to be packaged with Electron.

console.info(`\n-> Packaging SvelteKit for production\n`);

const copySync = require("fs-extra").copySync;
const execSync = require("child_process").execSync;
const path = require("path");

// Copy /sveltekit/build to /resources/sveltekit
copySync(
  path.join(__dirname, "..", "sveltekit", "build"),
  path.join(__dirname, "..", "resources", "sveltekit")
);

// Copy /sveltekit/package.json to /resources/sveltekit
copySync(
  path.join(__dirname, "..", "sveltekit", "package.json"),
  path.join(__dirname, "..", "resources", "sveltekit", "package.json")
);

// Copy /sveltekit/package-lock.json to /resources/sveltekit
copySync(
  path.join(__dirname, "..", "sveltekit", "package-lock.json"),
  path.join(__dirname, "..", "resources", "sveltekit", "package-lock.json")
);

// Install SvelteKit's production dependencies
execSync("npm ci --prod", {
  cwd: path.join(__dirname, "..", "resources", "sveltekit"),
});

// Copy Prisma's migrations and schema to /resources/sveltekit
copySync(
  path.join(__dirname, "..", "sveltekit", "prisma"),
  path.join(__dirname, "..", "resources", "sveltekit", "prisma")
);

// Install Prisma's production dependencies
execSync("npx prisma generate", {
  cwd: path.join(__dirname, "..", "resources", "sveltekit"),
});
