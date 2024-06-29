import { BrowserWindow, app } from "electron";

import TrayMenu from "./tray-menu";
import Vault from "./vault";
import { browserWindowConfig, setLoadingView } from "./window";

enum ElectronEvents {
  READY = 'ready',
  BEFORE_QUIT = 'before-quit'
}

let trayMenu: TrayMenu | undefined;

app.on(ElectronEvents.READY, () => {
  // Prompt the user to choose a vault if one isn't set yet
  const vault = new Vault();
  if (!vault.path) vault.dialog();

  const window = new BrowserWindow(browserWindowConfig());
  setLoadingView(window);

  trayMenu = new TrayMenu(vault, window);
});

app.on(ElectronEvents.BEFORE_QUIT, () => {
  trayMenu?.server?.stop();
});
