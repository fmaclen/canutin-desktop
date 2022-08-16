import { app, dialog } from "electron";

import Server from "./server";
import TrayMenu from "./tray-menu";
import Vault from "./vault";

process.platform === "darwin" && app.dock.hide(); // Hide dock icon on macOS
let server: Server | undefined;

app.whenReady().then(() => {
  const vault = new Vault();
  const trayMenu = new TrayMenu(vault);

  // Prompt the user to choose a vault if they haven't
  if (!vault.path) vault.openPrompt();

  server = trayMenu.server;
});

app.on("before-quit", () => {
  server?.stop();
});
