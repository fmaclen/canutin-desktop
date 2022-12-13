// This script prepares the SvelteKit build to be packaged with Electron.

console.info(`\n-> Packaging SvelteKit for standalone server\n`);

const path = require("path");
const rimraf = require("rimraf");
const { readdirSync, unlinkSync, copySync } = require("fs-extra");
// const execSync = require("child_process").execSync;

const svelteKitDevPath = path.join(__dirname, "..", "sveltekit");
const serverProdPath = path.join(
  __dirname,
  "..",
  "dist",
  "linux-server",
  "canutin"
);
const linuxServerDevPath = path.join(__dirname, "..", "linux-server");

// Remove directory /resources/sveltekit and it's files
rimraf(serverProdPath, () => {
  // Copy /sveltekit/build to /resources/sveltekit
  copySync(path.join(svelteKitDevPath, "build"), serverProdPath);

  // Copy Prisma's migrations and schema to /resources/sveltekit

  // FIXME:
  // Don't include *.vault files
  copySync(
    path.join(svelteKitDevPath, "prisma"),
    path.join(serverProdPath, "prisma")
  );

  // Copy /sveltekit/package.json to /resources/sveltekit
  copySync(
    path.join(svelteKitDevPath, "package.json"),
    path.join(serverProdPath, "package.json")
  );

  // Copy /sveltekit/package-lock.json to /resources/sveltekit
  copySync(
    path.join(svelteKitDevPath, "package-lock.json"),
    path.join(serverProdPath, "package-lock.json")
  );

  // Copy server dependencies

  // FIXME:
  // See if we can copy all the files at the same time
  copySync(
    path.join(linuxServerDevPath, ".env.sample"),
    path.join(serverProdPath, ".env.sample")
  );
  copySync(
    path.join(linuxServerDevPath, ".gitignore"),
    path.join(serverProdPath, ".gitignore")
  );
  copySync(
    path.join(linuxServerDevPath, "README.md"),
    path.join(serverProdPath, "README.md")
  );
  copySync(
    path.join(linuxServerDevPath, "start"),
    path.join(serverProdPath, "start")
  );
});
