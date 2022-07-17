import { app, Tray, Menu } from "electron";

const SERVER_STATUS_NEGATIVE = "tray-server-status-negative";
const SERVER_STATUS_POSITIVE = "tray-server-status-positive";
const SERVER_START = "tray-server-start";
const SERVER_STOP = "tray-server-stop";

let isServerRunning: boolean = false;

// Default state
const trayTemplate = Menu.buildFromTemplate([
  {
    label: "Canutin is not running",
    icon: "./electron/icons/status-negative.png",
    id: SERVER_STATUS_NEGATIVE,
    enabled: false,
  },
  {
    label: "Canutin is running",
    icon: "./electron/icons/status-positive.png",
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
  { label: "Quit", click: () => app.quit() },
]);

const toggleServer = () => {
  const serverStatusNegative = trayTemplate.getMenuItemById(
    SERVER_STATUS_NEGATIVE
  );
  const serverStatusPositive = trayTemplate.getMenuItemById(
    SERVER_STATUS_POSITIVE
  );
  const serverStart = trayTemplate.getMenuItemById(SERVER_START);
  const serverStop = trayTemplate.getMenuItemById(SERVER_STOP);

  if (
    serverStatusNegative &&
    serverStatusPositive &&
    serverStart &&
    serverStop
  ) {
    if (isServerRunning) {
      serverStatusNegative.visible = true;
      serverStatusPositive.visible = false;
      serverStart.visible = true;
      serverStop.visible = false;
    } else {
      serverStatusNegative.visible = false;
      serverStatusPositive.visible = true;
      serverStart.visible = false;
      serverStop.visible = true;
    }
    isServerRunning = !isServerRunning;
  }
};

export const setTray = () => {
  const tray = new Tray("./electron/icons/canutin-tray.png");
  tray.setToolTip("Canutin");
  tray.setContextMenu(trayTemplate);
};

export default setTray;
