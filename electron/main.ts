import { app, dialog } from "electron";

import Server from "./server";
import TrayMenu from "./tray-menu";
import Vault from "./vault";

process.platform === "darwin" && app.dock.hide(); // Hide dock icon on macOS
let server: Server | undefined;

app.whenReady().then(() => {
  const vault = new Vault();

  // No vault prompt
  if (!vault.path) {
    const openVaultPrompt = () => {
      const dialogOption = dialog.showMessageBoxSync({
        type: "info",
        buttons: ["Create new vault", "Open existing vault", "Do it later"],
        message: "Canutin Vault",
        detail:
          "A vault is a file that stores all the data required to run the app",
        cancelId: 2,
      });

      let isVaultSet = false;
      switch (dialogOption) {
        case 0:
          isVaultSet = vault.create();
          break;
        case 1:
          isVaultSet = vault.load();
          break;
        case 2:
          return;
      }
      !isVaultSet && openVaultPrompt();
    };

    openVaultPrompt();
  }

  const trayMenu = new TrayMenu(vault);
  server = trayMenu.server;
});

app.on("before-quit", () => {
  server?.stop();
});
