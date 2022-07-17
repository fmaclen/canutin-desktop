import { app } from "electron";

import setTray from "./tray";

app.dock.hide(); // Hide dock on macOS

app.whenReady().then(() => {
  setTray();
});
