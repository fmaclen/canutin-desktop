import path from "path";
import {
  app,
  dialog,
  Menu,
  MenuItemConstructorOptions,
  shell,
  Tray,
} from "electron";

import Vault from "./vault";
import Server from "./server";

class TrayMenu {
  static readonly OPEN_BROWSER_DELAY = 500;

  static readonly MENU_SERVER_STATUS = "menu-server-status";
  static readonly MENU_SERVER_TOGGLE = "menu-server-toggle";
  static readonly MENU_OPEN_IN_BROWSER = "menu-open-in-browser";
  static readonly MENU_VAULT_PATH = "menu-vault-path";
  static readonly MENU_VAULT_OPEN = "menu-vault-open";

  static readonly ICON_TRAY_IDLE = "canutin-tray-idle";
  static readonly ICON_TRAY_ACTIVE = "canutin-tray-active";
  static readonly ICON_STATUS_POSITIVE = "status-positive";
  static readonly ICON_STATUS_NEGATIVE = "status-negative";

  private isServerRunning: boolean;
  private isAppPackaged: boolean;
  private isMacOs: boolean;

  private tray: Tray;
  private vault: Vault;
  private server: Server | undefined;

  private menuServerStatus: MenuItemConstructorOptions;
  private menuServerToggle: MenuItemConstructorOptions;
  private menuOpenInBrowser: MenuItemConstructorOptions;
  private menuVaultPath: MenuItemConstructorOptions;
  private menuOpenVault: MenuItemConstructorOptions;
  private menuPresistentOptions: MenuItemConstructorOptions[];
  private menuSeparator: MenuItemConstructorOptions;
  private menuCurrentTemplate: MenuItemConstructorOptions[];

  constructor(vault: Vault) {
    this.vault = vault;
    this.isServerRunning = false;
    this.isAppPackaged = app.isPackaged;
    this.isMacOs = process.platform === "darwin";

    // Menu items (not in order)
    this.menuSeparator = { type: "separator" };
    this.menuServerStatus = {
      label: "Canutin is not running",
      icon: this.getImagePath(TrayMenu.ICON_STATUS_NEGATIVE),
      id: TrayMenu.MENU_SERVER_STATUS,
      enabled: false,
    };
    this.menuServerToggle = {
      label: "Start Canutin",
      click: () => this.toggleServer(),
      id: TrayMenu.MENU_SERVER_TOGGLE,
      visible: false,
    };
    this.menuOpenInBrowser = {
      label: "Open in browser",
      id: TrayMenu.MENU_OPEN_IN_BROWSER,
      accelerator: this.isMacOs ? "Command+T" : "Ctrl+T",
      visible: false,
      click: () => this.openBrowser(),
    };
    this.menuOpenInBrowser = {
      label: "Open in browser",
      id: TrayMenu.MENU_OPEN_IN_BROWSER,
      accelerator: this.isMacOs ? "Command+T" : "Ctrl+T",
      visible: false,
      click: () => this.openBrowser(),
    };
    this.menuVaultPath = {
      label: this.vault?.path ? this.vault.path : "No vault chosen",
      id: TrayMenu.MENU_VAULT_PATH,
      enabled: false,
    };
    this.menuOpenVault = {
      label: "Open vault...",
      id: TrayMenu.MENU_VAULT_OPEN,
      accelerator: this.isMacOs ? "Command+O" : "Ctrl+O",
      click: () => this.openVault(),
    };
    this.menuPresistentOptions = [
      {
        label: "About",
        click: () => app.showAboutPanel(),
      },
      {
        label: "Quit",
        accelerator: this.isMacOs ? "Command+Q" : "Alt+F4",
        click: () => app.quit(),
      },
    ];
    // Menu items (in order)
    this.menuCurrentTemplate = [
      this.menuServerStatus,
      this.menuSeparator,
      this.menuServerToggle,
      this.menuOpenInBrowser,
      this.menuSeparator,
      this.menuVaultPath,
      this.menuOpenVault,
      this.menuSeparator,
      ...this.menuPresistentOptions,
    ];
    this.tray = this.setTray();
  }

  private setTray = () => {
    this.tray = new Tray(this.getImagePath(TrayMenu.ICON_TRAY_IDLE));
    this.tray.on("click", () => this.tray?.popUpContextMenu()); // Left-click opens the context menu in Windows
    this.tray.setToolTip("Canutin");
    this.tray.setContextMenu(Menu.buildFromTemplate(this.menuCurrentTemplate));

    if (this.vault?.path) {
      this.toggleServer();
      this.isAppPackaged && this.openBrowser(TrayMenu.OPEN_BROWSER_DELAY);
    }

    return this.tray;
  };

  private openVault = () => {
    const vault = this.vault;
    const dialogPaths = dialog.showOpenDialogSync({
      properties: ["openFile"],
      filters: [{ name: "Canutin Vault", extensions: ["vault"] }],
    });

    if (dialogPaths && vault) {
      const vaultPath = dialogPaths[0];
      this.menuVaultPath.label = vaultPath;
      vault.saveToUserSettings(vaultPath);
      this.updateTray();

      // Starting (or restarting) the server
      if (this.isServerRunning) {
        this.toggleServer(); // Stops the server
        this.toggleServer(); // Starts the server
      } else {
        this.toggleServer(); // Starts the server
        this.openBrowser(TrayMenu.OPEN_BROWSER_DELAY);
      }
    }
  };

  private toggleServer = () => {
    const vaultPath = this.vault?.path;

    if (!this.server && vaultPath) this.server = new Server(vaultPath);

    if (this.server && this.isServerRunning) {
      // Stop the server
      this.server.stop();
      this.tray.setImage(this.getImagePath("canutin-tray-idle"));
      this.menuServerToggle.label = "Start Canutin";
      this.menuServerStatus.label = "Canutin is not running";
      this.menuServerStatus.icon = this.getImagePath("status-negative");
      this.menuOpenInBrowser.visible = false;
      this.updateTray();
    } else if (this.server) {
      // Start the server
      this.server.start();
      this.tray.setImage(this.getImagePath("canutin-tray-active"));
      this.menuServerToggle.visible = true;
      this.menuServerToggle.label = "Stop Canutin";
      this.menuServerStatus.label = "Canutin is running";
      this.menuServerStatus.icon = this.getImagePath("status-positive");
      this.menuOpenInBrowser.visible = true;
      this.updateTray();
    }

    // FIXME:
    // It would be better to check if the server is actually running (or not)
    // instead of blindingly reversing the vaule of `isServerRunnig`.
    this.isServerRunning = !this.isServerRunning;
  };

  private updateTray = () => {
    this.tray?.setContextMenu(Menu.buildFromTemplate(this.menuCurrentTemplate));
  };

  private openBrowser(delay: number = 0) {
    const server = this.server;
    // FIXME:
    // To prevent opening the browser before the server is ready we wait.
    // Server boot up time is likely to vary so ideally we would "ping"
    // the server until it's ready and only then open the user's browser.
    server?.url && setTimeout(() => shell.openExternal(server.url), delay);
  }

  private getImagePath(fileName: string) {
    return this.isAppPackaged
      ? path.join(process.resourcesPath, `assets/${fileName}.png`)
      : `./resources/assets/${fileName}.png`;
  }
}

export default TrayMenu;
