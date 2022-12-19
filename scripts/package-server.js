// This script prepares the SvelteKit build to be packaged with Electron.

console.info(`\n-> Packaging SvelteKit for standalone server\n`);

const path = require("path");
const rimraf = require("rimraf");
const { copySync } = require("fs-extra");
const { execSync } = require("child_process");

const svelteKitDevPath = path.join(__dirname, "..", "sveltekit");
const serverProdPath = path.join(__dirname, "..", "dist", "server", "canutin");
const linuxServerDevPath = path.join(__dirname, "..", "server");

// Remove directory /resources/sveltekit and it's files
rimraf(serverProdPath, () => {
  // Copy /sveltekit/build to /resources/sveltekit
  copySync(path.join(svelteKitDevPath, "build"), serverProdPath);

  // Copy Prisma's migrations and schema to /resources/sveltekit
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
  copySync(path.join(linuxServerDevPath), path.join(serverProdPath));

  // Create tar ball
  execSync(
    `tar -czf canutin-server_${process.env.APP_VERSION}.tar.gz -C ${serverProdPath} .`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Couldn't create a tar ball: ${error}`);
        return;
      }
      console.info(`stdout: ${stdout}`);
      console.info(`stderr: ${stderr}`);
    }
  );
});
