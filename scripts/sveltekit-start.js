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

console.info(`-> Running SvelteKit`);
console.info(`   DATABASE_URL: ${pathToDevVault}`);
console.info(`   ELECTRON_SWITCHED_VAULT: "true"`);

execSync(`cd sveltekit && npm run dev`, {
  env: {
    ...process.env,
    DATABASE_URL: `file:${pathToDevVault}`,
    ELECTRON_SWITCHED_VAULT: "true",
  },
  stdio: "inherit",
});
