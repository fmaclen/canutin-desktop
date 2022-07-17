import { app, Tray, Menu } from "electron";

app.whenReady().then(() => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Start server",
      enabled: false,
      click: () => console.log("Starting server..."),
    },
    {
      label: "Stop server",
      enabled: false,
      click: () => console.log("Stopping server..."),
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);

  const tray = new Tray("./electron/assets/canutin-tray-icon.png");
  tray.setToolTip("Canutin Agent");
  tray.setContextMenu(contextMenu);
});
