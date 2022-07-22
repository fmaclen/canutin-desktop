// Starts Sveltekit's dev server with `DATABASE_URL` pointing to the dev vault.

const absolutePathToDevVault = require("path").resolve(
  "./prisma/Canutin.dev.vault"
);

require("child_process").execSync(
  `cd app && DATABASE_URL=file:${absolutePathToDevVault} npm run dev`,
  {
    stdio: "inherit",
  }
);
