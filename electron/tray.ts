import path from "path";
import {
  app,
  Tray,
  Menu,
  shell,
  dialog,
  MenuItemConstructorOptions,
  MenuItem,
} from "electron";
import Store from "electron-store";

import { serverUrl, startServer, stopServer } from "./server";

const MENU_SERVER_STATUS = "menu-server-status";
const MENU_SERVER_TOGGLE = "menu-server-toggle";
const MENU_OPEN_IN_BROWSER = "menu-open-in-browser";
const MENU_VAULT_PATH = "menu-vault-path";
const MENU_VAULT_OPEN = "menu-vault-open";

const store = new Store();
let tray: Tray;
let vaultPath: string | undefined;
let isServerRunning: boolean = false;

const imgPath = (fileName: string) =>
  app.isPackaged
    ? path.join(process.resourcesPath, `assets/${fileName}.png`)
    : `./resources/assets/${fileName}.png`;

const openBrowser = () => {
  shell.openExternal(serverUrl);
};

const menuServerStatus = {
  label: "Canutin is not running",
  icon: imgPath("status-negative"),
  id: MENU_SERVER_STATUS,
  enabled: false,
} as MenuItemConstructorOptions;

const menuServerToggle = {
  label: "Start Canutin",
  click: () => toggleServer(),
  id: MENU_SERVER_TOGGLE,
  visible: false,
} as MenuItemConstructorOptions;

const menuOpenInBrowser = {
  label: "Open in browser",
  id: MENU_OPEN_IN_BROWSER,
  accelerator: process.platform === "darwin" ? "Command+O" : "Ctrl+0",
  visible: false,
  click: () => openBrowser(),
} as MenuItemConstructorOptions;

const menuVaultPath = {
  label: "No vault chosen",
  id: MENU_VAULT_PATH,
  enabled: false,
} as MenuItemConstructorOptions;

const menuOpenVault = {
  label: "Open vault...",
  id: MENU_VAULT_OPEN,
  click: () => openVault(),
} as MenuItemConstructorOptions;

const menuPresistentOptions = [
  {
    label: "About",
    click: () => app.showAboutPanel(),
  },
  {
    label: "Quit",
    accelerator: process.platform === "darwin" ? "Command+Q" : "Alt+F4",
    click: () => app.quit(),
  },
] as MenuItemConstructorOptions[];

const menuSeparator = { type: "separator" } as MenuItem;

let currentTemplate = [
  menuServerStatus,
  menuSeparator,
  menuServerToggle,
  menuOpenInBrowser,
  menuSeparator,
  menuVaultPath,
  menuOpenVault,
  menuSeparator,
  ...menuPresistentOptions,
] as MenuItemConstructorOptions[];

const updateContextMenu = () => {
  tray.setContextMenu(Menu.buildFromTemplate(currentTemplate));
};

const openVault = () => {
  const dialogPaths = dialog.showOpenDialogSync({
    properties: ["openFile"],
    filters: [{ name: "Canutin Vault", extensions: ["vault"] }],
  });

  if (!dialogPaths) return;

  setVaultPath(dialogPaths[0]);

  // Starting (or restarting) the server
  if (isServerRunning) {
    toggleServer();
    toggleServer();
  } else {
    toggleServer();
  }
};

const setVaultPath = (path: string | undefined) => {
  if (!path) return;

  vaultPath = path;
  menuVaultPath.label = vaultPath;
  store.set({ vaultPath: vaultPath });
  updateContextMenu();
};

const toggleServer = () => {
  if (isServerRunning) {
    // Stop the server
    stopServer();
    tray.setImage(imgPath("canutin-tray-idle"));
    menuServerToggle.label = "Start Canutin";
    menuServerStatus.label = "Canutin is not running";
    menuServerStatus.icon = imgPath("status-negative");
    updateContextMenu();
  } else if (vaultPath) {
    // Start the server
    startServer(vaultPath);
    tray.setImage(imgPath("canutin-tray-active"));
    menuServerToggle.visible = true;
    menuServerToggle.label = "Stop Canutin";
    menuServerStatus.label = "Canutin is running";
    menuServerStatus.icon = imgPath("status-positive");
    updateContextMenu();
  }
  isServerRunning = !isServerRunning;
};

const setTray = () => {
  tray = new Tray(imgPath("canutin-tray-idle"));
  tray.setToolTip("Canutin");
  tray.setContextMenu(Menu.buildFromTemplate(currentTemplate));

  // Read vault path from the user's settings
  setVaultPath(store.get("vaultPath") as string | undefined);

  // Start the server when the app boots up if there is a vault set
  vaultPath && toggleServer();

  // FIXME:
  // To prevent opening the browser before the server is ready we wait 500ms.
  // Server boot up time is likely to vary so ideally we would "ping"
  // the server until it's ready and only then open the user's browser.
  app.isPackaged && setTimeout(() => openBrowser(), 500);
};

export default setTray;
