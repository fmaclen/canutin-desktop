import path from "path";
import {
  app,
  Menu,
  MenuItemConstructorOptions,
  Tray,
  nativeTheme,
  BrowserWindow,
} from "electron";

import Vault from "./vault";
import Server from "./server";

class TrayMenu {
  static readonly LOAD_SERVER_URL_DELAY = 500;

  static readonly MENU_SERVER_STATUS = "menu-server-status";
  static readonly MENU_SERVER_TOGGLE = "menu-server-toggle";
  static readonly MENU_OPEN_IN_BROWSER = "menu-open-in-browser";
  static readonly MENU_VAULT_PATH = "menu-vault-path";
  static readonly MENU_VAULT_OPEN = "menu-vault-open";

  static readonly ICON_TRAY_IDLE = "canutin-tray-idle";
  static readonly ICON_TRAY_ACTIVE = "canutin-tray-active";
  static readonly ICON_STATUS_POSITIVE = "status-positive";
  static readonly ICON_STATUS_NEGATIVE = "status-negative";

  private isAppPackaged: boolean;
  private isMacOs: boolean;

  private tray: Tray;
  private trayIcon: string;
  private vault: Vault;
  server: Server | undefined;
  window: BrowserWindow;

  private menuServerStatus: MenuItemConstructorOptions;
  private menuServerToggle: MenuItemConstructorOptions;
  private menuVaultPath: MenuItemConstructorOptions;
  private menuSwitchVault: MenuItemConstructorOptions;
  private menuPresistentOptions: MenuItemConstructorOptions[];
  private menuSeparator: MenuItemConstructorOptions;
  private menuCurrentTemplate: MenuItemConstructorOptions[];

  constructor(vault: Vault, window: BrowserWindow) {
    this.vault = vault;
    this.window = window;
    this.isAppPackaged = app.isPackaged || false;
    this.trayIcon = TrayMenu.ICON_TRAY_IDLE;

    // Set loading window
    this.setLoadingView();

    // There's a snapshot test that checks the menu template and we don't want
    // to use macOS keyboard shortcuts when generating the template.
    this.isMacOs =
      process.platform === "darwin" && process.env.NODE_ENV !== "test";

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
    this.menuVaultPath = {
      label: this.vault?.path ? this.vault.path : "No vault chosen",
      id: TrayMenu.MENU_VAULT_PATH,
      enabled: false,
    };
    this.menuSwitchVault = {
      label: "Switch vault...",
      id: TrayMenu.MENU_VAULT_OPEN,
      accelerator: this.isMacOs ? "Command+S" : "Ctrl+S",
      click: () => this.switchVault(),
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
      this.menuSeparator,
      this.menuVaultPath,
      this.menuSwitchVault,
      this.menuSeparator,
      ...this.menuPresistentOptions,
    ];

    // Set the tray
    this.tray = new Tray(this.getImagePath(TrayMenu.ICON_TRAY_IDLE));
    this.tray.on("click", () => this.tray?.popUpContextMenu()); // Left-click opens the context menu in Windows
    this.tray.setToolTip("Canutin");
    this.tray.setContextMenu(Menu.buildFromTemplate(this.menuCurrentTemplate));

    // Update the tray menu if the OS color theme changes
    nativeTheme.on("updated", () => {
      this.setTrayIcon(this.trayIcon);
    });

    // Start the server
    if (this.vault?.path) {
      this.toggleServer();
    }
  }

  private switchVault() {
    const { vault } = this;
    const isVaultSet = vault.dialog();

    if (isVaultSet && vault.path) {
      this.menuVaultPath.label = vault.path;
      this.updateTray();

      // Starting (or restarting) the server
      if (this.server?.isRunning) this.server.stop();
      this.server?.start(vault.path);
    }
  };

  private async toggleServer() {
    const vaultPath = this.vault?.path;

    if (!this.server && vaultPath) this.server = new Server(vaultPath);

    if (this.server?.isRunning) {
      // Stop the server
      this.server.stop();
      this.menuServerToggle.label = "Start Canutin";
      this.menuServerStatus.label = "Canutin is not running";
      this.menuServerStatus.icon = this.getImagePath(
        TrayMenu.ICON_STATUS_NEGATIVE
      );
      this.setTrayIcon(TrayMenu.ICON_TRAY_IDLE);
      this.updateTray();
      this.setLoadingView();
    } else if (this.server) {
      // Start the server
      try {
        await this.server.start(vaultPath);

        // Now we know the server is up and running
        this.window.loadURL(this.server.url);
        this.menuServerToggle.visible = true;
        this.menuServerToggle.label = "Stop Canutin";
        this.menuServerStatus.label = "Canutin is running";
        this.menuServerStatus.icon = this.getImagePath(TrayMenu.ICON_STATUS_POSITIVE);
        this.setTrayIcon(TrayMenu.ICON_TRAY_ACTIVE);
        this.updateTray();
      } catch (error) {
        console.error("Failed to start server:", error);
        // TODO: Handle the error appropriately (e.g., show an error message to the user)
      }
    }
  };

  private updateTray() {
    this.tray?.setContextMenu(Menu.buildFromTemplate(this.menuCurrentTemplate));
  };

  private getImagePath(fileName: string) {
    const themeAgnosticIcons = [
      TrayMenu.ICON_STATUS_POSITIVE,
      TrayMenu.ICON_STATUS_NEGATIVE,
    ];

    let theme: string;
    if (themeAgnosticIcons.includes(fileName)) {
      theme = "";
    } else {
      theme = nativeTheme.shouldUseDarkColors ? "-dark" : "-light";
    }

    return this.isAppPackaged
      ? path.join(process.resourcesPath, `assets/${fileName}${theme}.png`)
      : `./resources/${process.env.NODE_ENV !== "test" && theme
        ? "assets/dev/dev-"
        : "assets/"
      }${fileName}${theme}.png`;
  }

  private setLoadingView() {
    const LOADING_HTML = "loading.html";

    if (this.isAppPackaged) {
      this.window.loadFile(path.join(process.resourcesPath, 'assets', LOADING_HTML));
    } else {
      this.window.loadFile(`../../resources/assets/${LOADING_HTML}`);
    }
  }

  private setTrayIcon = (icon: string) => {
    this.trayIcon = icon;
    this.tray.setImage(this.getImagePath(icon));
  };
}

export default TrayMenu;
