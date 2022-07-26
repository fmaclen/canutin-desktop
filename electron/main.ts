import { app } from "electron";

import TrayMenu from "./tray-menu";
import Vault from "./vault";

process.platform === "darwin" && app.dock.hide(); // Hide dock icon on macOS

app.whenReady().then(() => {
  const vault = new Vault();
  new TrayMenu(vault);
});
