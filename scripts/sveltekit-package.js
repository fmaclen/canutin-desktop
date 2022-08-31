// This script prepares the SvelteKit build to be packaged with Electron.

console.info(`\n-> Packaging SvelteKit for production\n`);

const path = require("path");
const rimraf = require("rimraf");
const { readdirSync, unlinkSync, copySync } = require("fs");
const execSync = require("child_process").execSync;

const svelteKitDevPath = path.join(__dirname, "..", "sveltekit");
const svelteKitProdPath = path.join(__dirname, "..", "resources", "sveltekit");

// Remove directory /resources/sveltekit and it's files
rimraf(svelteKitProdPath, () => {
  // Copy /sveltekit/build to /resources/sveltekit
  copySync(path.join(svelteKitDevPath, "build"), svelteKitProdPath);

  // Copy /sveltekit/package.json to /resources/sveltekit
  copySync(
    path.join(svelteKitDevPath, "package.json"),
    path.join(svelteKitProdPath, "package.json")
  );

  // Copy /sveltekit/package-lock.json to /resources/sveltekit
  copySync(
    path.join(svelteKitDevPath, "package-lock.json"),
    path.join(svelteKitProdPath, "package-lock.json")
  );

  // Install SvelteKit's production dependencies
  execSync("npm ci --prod", {
    cwd: svelteKitProdPath,
  });

  // Copy Prisma's migrations and schema to /resources/sveltekit
  copySync(
    path.join(svelteKitDevPath, "prisma"),
    path.join(svelteKitProdPath, "prisma")
  );

  // Install Prisma's production dependencies
  execSync("npx prisma generate", {
    cwd: svelteKitProdPath,
  });

  // Delete Prisma's unused dependencies
  const prismaEnginesProdPath = path.join(
    svelteKitProdPath,
    "node_modules",
    "@prisma",
    "engines"
  );
  const filesToDelete = [
    { path: path.join(svelteKitProdPath, "prisma"), pattern: /[.]vault$/ },
    {
      path: path.join(svelteKitProdPath, "node_modules", "prisma"),
      pattern: /[.]node$/,
    },
    {
      path: prismaEnginesProdPath,
      pattern: /[.]node$/,
    },
    {
      path: prismaEnginesProdPath,
      pattern: /introspection-engine/,
    },
    {
      path: prismaEnginesProdPath,
      pattern: /prisma-fmt/,
    },
  ];

  for (const fileToDelete of filesToDelete) {
    readdirSync(fileToDelete.path)
      .filter((filename) => fileToDelete.pattern.test(filename))
      .forEach((file) => unlinkSync(path.join(fileToDelete.path, file)));
  }

  // Delete the cached engines Prisma generates in Windows
  if (process.platform === "win32") {
    rimraf(path.join(prismaEnginesProdPath, "node_modules"), () => {});
  }
});
