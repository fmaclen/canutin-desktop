import { app } from "electron";

import TrayMenu from "./tray-menu";
import Vault from "./vault";

process.platform === "darwin" && app.dock.hide(); // Hide dock icon on macOS

let trayMenu: TrayMenu | undefined;
app.whenReady().then(() => {
  const vault = new Vault();

  // Prompt the user to choose a vault if one isn't set yet
  if (!vault.path) vault.openPrompt();

  trayMenu = new TrayMenu(vault);
});

app.on("before-quit", () => {
  trayMenu?.server?.stop();
});
