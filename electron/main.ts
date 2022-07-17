import { app } from "electron";

import setTray from "./tray";

app.whenReady().then(() => {
  setTray();
});
