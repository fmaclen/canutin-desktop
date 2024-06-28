import { BrowserWindow, app, screen } from "electron";

import TrayMenu from "./tray-menu";
import Vault from "./vault";
import { browserWindowConfig } from "./window";

enum ElectronEvents {
  READY = 'ready',
  BEFORE_QUIT = 'before-quit'
}

process.platform === "darwin" && app.dock.hide(); // Hide dock icon on macOS

let trayMenu: TrayMenu | undefined;

app.on(ElectronEvents.READY, () => {
  // Prompt the user to choose a vault if one isn't set yet
  const vault = new Vault();
  if (!vault.path) vault.dialog();

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const window = new BrowserWindow(browserWindowConfig(width, height));

  trayMenu = new TrayMenu(vault, window);
});

app.on(ElectronEvents.BEFORE_QUIT, () => {
  trayMenu?.server?.stop();
});
