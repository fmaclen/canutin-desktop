// Starts Sveltekit's dev server with `DATABASE_URL` pointing to the dev vault.

const path = require("path");
const execSync = require("child_process").execSync;

const pathToDevVault = path.join(
  __dirname,
  "..",
  "sveltekit",
  "prisma",
  "Canutin.dev.vault"
);

console.info(`\n-> Running SvelteKit with DATABASE_URL: ${pathToDevVault}\n`);

execSync(`cd sveltekit && DATABASE_URL=file:${pathToDevVault} npm run dev`, {
  stdio: "inherit",
});
