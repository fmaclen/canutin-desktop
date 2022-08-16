// Creates a Canutin.base.vault and seeds it with the default values.
// This vault is copied to the resources folder when the app is packaged
// which is then copied again to the user's desired path when "Creating new vault".

// FIXME
// It'd be nice to run `npx prisma migrate deploy` and `npx prisma db seed` on the user's
// device but more work needs to be done to run npm scripts from within an Electron app.

const { execSync } = require("child_process");
const { join } = require("path");
const { unlink } = require("fs");

const vaultPath = join(process.cwd(), "resources/vault/Canutin.base.vault");
const databaseUrl = `DATABASE_URL=file:${vaultPath}`;

// Remove the vault (if it exists)
unlink(vaultPath, () => {});

// Create the new vault
execSync(`${databaseUrl} npx prisma migrate deploy`, {
  stdio: "inherit",
});

// Seed the new vault
execSync(`${databaseUrl} npx prisma db seed`, {
  stdio: "inherit",
});
