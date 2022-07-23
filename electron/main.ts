import { app } from "electron";

import { stopServer } from "./server";
import setTray from "./tray";

process.platform === "darwin" && app.dock.hide(); // Hide dock icon on macOS

app.whenReady().then(() => {
  setTray();
});

app.on("before-quit", () => {
  stopServer();
});
