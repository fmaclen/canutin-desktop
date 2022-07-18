import { app } from "electron";

import { stopServer } from "./server";
import setTray from "./tray";

app.dock.hide(); // Hide dock on macOS

app.whenReady().then(() => {
  setTray();
});

app.on("before-quit", () => {
  stopServer();
});
