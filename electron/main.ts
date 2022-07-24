import { app } from "electron";

import setTray from "./tray";

process.platform === "darwin" && app.dock.hide(); // Hide dock icon on macOS

app.whenReady().then(() => {
  setTray();
});
