// This script prepares the SvelteKit build to be packaged with Electron.

console.info(`\n-> Packaging SvelteKit for standalone server\n`);

const path = require("path");
const rimraf = require("rimraf");
const { copySync, moveSync } = require("fs-extra");
const { execSync } = require("child_process");

const svelteKitDevPath = path.join(__dirname, "..", "sveltekit");
const serverProdPath = path.join(__dirname, "..", "dist", "server");
const serverDevPath = path.join(__dirname, "..", "server");

// Remove directory /dist/server and it's files
rimraf(serverProdPath, () => {
  // Copy /sveltekit/build to /dist/server
  copySync(path.join(svelteKitDevPath, "build"), serverProdPath);

  // Copy Prisma's migrations and schema to /dist/server
  copySync(
    path.join(svelteKitDevPath, "prisma"),
    path.join(serverProdPath, "prisma")
  );

  // Copy /sveltekit/package.json to /dist/server
  copySync(
    path.join(svelteKitDevPath, "package.json"),
    path.join(serverProdPath, "package.json")
  );

  // Copy /sveltekit/package-lock.json to /dist/server
  copySync(
    path.join(svelteKitDevPath, "package-lock.json"),
    path.join(serverProdPath, "package-lock.json")
  );

  // Copy server dependencies
  copySync(path.join(serverDevPath), path.join(serverProdPath));

  // Create tar ball
  const filename = `canutin-server_${process.env.APP_VERSION}.tar.gz`;
  execSync(
    `tar -czf ${filename} -C ${serverProdPath} .`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Couldn't create a tar ball: ${error}`);
        return;
      }
      console.info(`stdout: ${stdout}`);
      console.info(`stderr: ${stderr}`);
    }
  );

  // Move tar ball to /dist
  moveSync(
    path.join(__dirname, "..", filename),
    path.join(__dirname, "..", "dist", filename)
  );
});
