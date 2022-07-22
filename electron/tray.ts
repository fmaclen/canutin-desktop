import path from "path";
import { app, Tray, Menu, shell } from "electron";

import { serverUrl, startServer, stopServer } from "./server";

const SERVER_STATUS_NEGATIVE = "tray-server-status-negative";
const SERVER_STATUS_POSITIVE = "tray-server-status-positive";
const SERVER_START = "tray-server-start";
const SERVER_STOP = "tray-server-stop";
const OPEN_CANUTIN = "tray-open-canutin";

let isServerRunning: boolean = false;

const imgPath = (fileName: string) =>
  app.isPackaged
    ? path.join(process.resourcesPath, `assets/${fileName}.png`)
    : `./resources/assets/${fileName}.png`;

// Default tray menu template
const trayTemplate = Menu.buildFromTemplate([
  {
    label: "Canutin is not running",

    icon: imgPath("status-negative"),
    id: SERVER_STATUS_NEGATIVE,
    enabled: false,
  },
  {
    label: "Canutin is running",
    icon: imgPath("status-positive"),
    id: SERVER_STATUS_POSITIVE,
    enabled: false,
    visible: false,
  },
  { type: "separator" },
  {
    label: "Run Canutin",
    id: SERVER_START,
    click: () => toggleServer(),
  },
  {
    label: "Stop Canutin",
    id: SERVER_STOP,
    visible: false,
    click: () => toggleServer(),
  },
  { type: "separator" },
  {
    label: "Open Canutin",
    id: OPEN_CANUTIN,
    visible: false,
    click: () => openBrowser(),
  },
  { label: "About", click: () => app.showAboutPanel() },
  {
    label: "Quit",
    accelerator: process.platform === "darwin" ? "Command+Q" : "Alt+F4",
    click: () => app.quit(),
  },
]);

let tray: Tray;
export const setTray = () => {
  tray = new Tray(imgPath("canutin-tray-idle"));
  tray.setToolTip("Canutin");
  tray.setContextMenu(trayTemplate);

  toggleServer(); // Server runs when the app starts

  // FIXME:
  // To prevent opening the browser before the server is ready we wait 500ms.
  // Server boot up time is likely to vary so ideally we would "ping"
  // the server until it's ready and only then open the user's browser.
  //
  // Open the user's browser to the server's URL
  app.isPackaged && setTimeout(() => openBrowser(), 500);
};

const openBrowser = () => {
  shell.openExternal(serverUrl);
};

const serverStatusNegative = trayTemplate.getMenuItemById(
  SERVER_STATUS_NEGATIVE
);
const serverStatusPositive = trayTemplate.getMenuItemById(
  SERVER_STATUS_POSITIVE
);
const serverStart = trayTemplate.getMenuItemById(SERVER_START);
const serverStop = trayTemplate.getMenuItemById(SERVER_STOP);
const openCanutin = trayTemplate.getMenuItemById(OPEN_CANUTIN);

const toggleServer = () => {
  if (
    serverStatusNegative &&
    serverStatusPositive &&
    serverStart &&
    serverStop &&
    openCanutin
  ) {
    if (isServerRunning) {
      stopServer();
      tray.setImage(imgPath("canutin-tray-idle"));
      serverStatusNegative.visible = true;
      serverStatusPositive.visible = false;
      serverStart.visible = true;
      serverStop.visible = false;
      openCanutin.visible = false;
    } else {
      startServer();
      tray.setImage(imgPath("canutin-tray-active"));
      serverStatusNegative.visible = false;
      serverStatusPositive.visible = true;
      serverStart.visible = false;
      serverStop.visible = true;
      openCanutin.visible = true;
    }
    isServerRunning = !isServerRunning;
  }
};

export default setTray;
