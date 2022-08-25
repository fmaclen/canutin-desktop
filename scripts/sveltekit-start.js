// Starts Sveltekit's dev server with `DATABASE_URL` pointing to the dev vault.

const path = require("path");
const execSync = require("child_process").execSync;

const svelteKitDevPath = path.join(__dirname, "..", "sveltekit");
const vaultDevPath = path.join(svelteKitDevPath, "prisma", "Canutin.dev.vault");

console.info(`-> Running SvelteKit`);
console.info(`   DATABASE_URL: ${vaultDevPath}`);
console.info(`   ELECTRON_SWITCHED_VAULT: "true"`);

execSync(`npm run dev`, {
  cwd: svelteKitDevPath,
  env: {
    ...process.env,
    DATABASE_URL: `file:${vaultDevPath}`,
    ELECTRON_SWITCHED_VAULT: "true",
  },
  stdio: "inherit",
});
