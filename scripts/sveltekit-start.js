// Starts Sveltekit's dev server with `DATABASE_URL` pointing to the dev vault.

const path = require("path");
const execSync = require("child_process").execSync;

const svelteKitDevPath = path.join(__dirname, "..", "sveltekit");
const vaultDevPath = path.join(svelteKitDevPath, "prisma", "Canutin.dev.vault");

console.info(`-> Running SvelteKit`);
console.info(`   DATABASE_URL: ${vaultDevPath}`);
console.info(`   SHOULD_CHECK_VAULT: "true"`);
console.info(`   APP_VERSION: "0.0.0-development"`);

execSync(`npm run dev`, {
  cwd: svelteKitDevPath,
  env: {
    ...process.env,
    DATABASE_URL: `file:${vaultDevPath}`,
    SHOULD_CHECK_VAULT: "true",
    APP_VERSION: "0.0.0-development",
  },
  stdio: "inherit",
});
