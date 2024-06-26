import path from "path";
import { BrowserWindow } from "electron";
import Electron, { Menu } from "electron";

import TrayMenu from "../tray-menu";
import Vault from "../vault";
import Server from "../server";

type TrayMenuWithPrivateMethods = TrayMenu & {
  getImagePath: (fileName: string) => string;
  toggleServer: () => void;
  setLoadingView: () => void;
};

describe("TrayMenu", () => {
  const IMAGE_ASSET = "dev-canutin-tray-active-light";
  const pathToImageAsset = `./resources/assets/dev/${IMAGE_ASSET}.png`;
  const pathToVault = "/fake/path/to/Canutin.vault";
  const resourcesPath = process.resourcesPath; // this is `undefined` in tests
  const mockBrowserWindow = new BrowserWindow();
  const vault = new Vault();
  vault.path = pathToVault;

  const spyIsPackaged = jest.spyOn(Electron.app, "isPackaged", "get");

  // FIXME:
  // Tests are passing but there is an error related to `spyPathJoin`:
  //
  // resources/assets/dev/dev-canutin-tray-active-light.png:1
  // �PNG
  // SyntaxError: Invalid or unexpected token
  //
  // The path to the file is correct. But I think that's failing because we
  // are mocking an Electron module which expects a PNG but the mocked
  // version is maybe expecting something else (?)
  const spyPathJoin = jest.spyOn(path, "join").mockReturnValue(pathToImageAsset);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("tray is set with the correct parameters", () => {
    // `TrayMenu.prototype` doesn't include private methods
    // so we need to cast it to `TrayMenuWithPrivateMethods`
    const spyGetImagePath = jest.spyOn(
      TrayMenu.prototype as TrayMenuWithPrivateMethods,
      "getImagePath"
    );
    const spyToggleServer = jest.spyOn(
      TrayMenu.prototype as TrayMenuWithPrivateMethods,
      "toggleServer"
    );
    const spySetLoadingView = jest.spyOn(
      TrayMenu.prototype as TrayMenuWithPrivateMethods,
      "setLoadingView"
    );
    const trayMenu = new TrayMenu(vault, mockBrowserWindow);
    const tray = trayMenu["tray"];
    expect(spySetLoadingView).toHaveBeenCalled();
    expect(spyToggleServer).toHaveBeenCalled();
    expect(spyGetImagePath).toHaveBeenCalledWith(TrayMenu.ICON_TRAY_IDLE);
    expect(trayMenu["menuCurrentTemplate"]).toMatchSnapshot();
    expect(tray.on).toHaveBeenCalledWith("click", expect.any(Function));
    expect(tray.setToolTip).toHaveBeenCalledWith("Canutin");
    expect(tray.setContextMenu).toHaveBeenCalledWith(
      Menu.buildFromTemplate(trayMenu["menuCurrentTemplate"])
    );
    expect(trayMenu["vault"]["path"]).toBe(pathToVault);
  });

  describe("develoment environment", () => {
    let trayMenu: TrayMenu;
    
    beforeEach(() => {
      spyIsPackaged.mockReturnValue(false);
      trayMenu = new TrayMenu(vault, mockBrowserWindow);
    });

    test("browser opens to the server url", () => {
      const trayMenu = new TrayMenu(vault, mockBrowserWindow);
      expect(trayMenu["server"]?.url).toBe(
        `http://localhost:${Server.PORT_DEVELOPMENT}`
      );
    });

    test("loading view is set correctly", () => {
      trayMenu["setLoadingView"]();
      expect(mockBrowserWindow.loadFile).toHaveBeenCalledWith("../../resources/loading.html");
      expect(mockBrowserWindow.loadFile).toHaveBeenCalledTimes(2);
    });

    test("path to image assets", () => {
      spyPathJoin.mockClear();
      const imagePath = trayMenu["getImagePath"](IMAGE_ASSET);
      expect(imagePath).toBe(`./resources/assets/${IMAGE_ASSET}-light.png`);
      expect(spyPathJoin).not.toBeCalled();
    });
  });

  describe("production environment", () => {
    spyIsPackaged.mockReturnValue(true);
    const trayMenu = new TrayMenu(vault, mockBrowserWindow);

    test("browser opens to the server url", () => {
      expect(trayMenu["server"]?.url).toBe(
        `http://localhost:${Server.PORT_PRODUCTION}`
      );
    });

    test("path to image assets", () => {
      const iconTrayIdle = TrayMenu.ICON_TRAY_ACTIVE;
      const imagePath = trayMenu["getImagePath"](iconTrayIdle);
  
      expect(trayMenu["trayIcon"]).toBe(iconTrayIdle);
      expect(imagePath).toBe(`./resources/assets/dev/dev-${iconTrayIdle}-light.png`);
      expect(spyPathJoin).toHaveBeenCalled();
    });
  });

  test("tray icon is loaded with the correct theme color", () => {
    spyIsPackaged.mockReturnValue(true);

    const iconTrayIdle = TrayMenu.ICON_TRAY_IDLE;
    const iconTrayActive = TrayMenu.ICON_TRAY_ACTIVE;
    const iconStatusPositive = TrayMenu.ICON_STATUS_POSITIVE;
    const iconStatusNegative = TrayMenu.ICON_STATUS_NEGATIVE;
    const spyShouldUseDarkColors = jest.spyOn(
      Electron.nativeTheme,
      "shouldUseDarkColors",
      "get"
    );

    const trayMenu = new TrayMenu(vault, mockBrowserWindow);
    expect(trayMenu["trayIcon"]).toBe(iconTrayActive);
    expect(spyPathJoin).toHaveBeenCalledWith(
      resourcesPath,
      `assets/${iconTrayIdle}-light.png`
    );
    expect(spyPathJoin).toHaveBeenLastCalledWith(
      resourcesPath,
      `assets/${iconTrayActive}-light.png`
    );

    spyShouldUseDarkColors.mockReturnValue(true);
    trayMenu["setTrayIcon"](iconTrayActive);
    expect(spyPathJoin).toHaveBeenLastCalledWith(
      resourcesPath,
      `assets/${iconTrayActive}-dark.png`
    );

    // Positive and negative icons are theme agnostic
    expect(spyPathJoin).toHaveBeenCalledWith(
      resourcesPath,
      `assets/${iconStatusPositive}.png`
    );
    expect(spyPathJoin).not.toHaveBeenCalledWith(
      resourcesPath,
      `assets/${iconStatusPositive}-light.png`
    );
    expect(spyPathJoin).not.toHaveBeenCalledWith(
      resourcesPath,
      `assets/${iconStatusPositive}-dark.png`
    );
    expect(spyPathJoin).toHaveBeenCalledWith(
      resourcesPath,
      `assets/${iconStatusNegative}.png`
    );
    expect(spyPathJoin).not.toHaveBeenCalledWith(
      resourcesPath,
      `assets/${iconStatusNegative}-light.png`
    );
    expect(spyPathJoin).not.toHaveBeenCalledWith(
      resourcesPath,
      `assets/${iconStatusNegative}-dark.png`
    );

    // TODO: add test for when the OS changes theme color `nativeTheme.on("updated"...`
  });

  // Disabled tests
  // REF https://github.com/Canutin/desktop-2/issues/6
  test.skip("server can be toggled on/off", () => {
    // TODO
  });

  test.skip("vault can be opened", () => {
    // FIXME:
    // half of the assertions in this test don't work.
    const spyElectronDialogSync = jest.spyOn(
      Electron.dialog,
      "showOpenDialogSync"
    );
    const spyUpdateTray = jest.spyOn(TrayMenu.prototype as TrayMenuWithPrivateMethods, "updateTray");
    const trayMenu = new TrayMenu(vault, mockBrowserWindow);
    trayMenu["switchVault"];
    expect(trayMenu["menuVaultPath"].label).not.toBe(pathToVault);
    expect(spyElectronDialogSync).toHaveBeenCalledWith({
      properties: ["openFile"],
      filters: [{ name: "Canutin Vault", extensions: ["vault"] }],
    });
    expect(spyElectronDialogSync).toHaveReturnedWith({
      canceled: false,
      filePaths: [pathToVault],
    });
    expect(trayMenu["menuVaultPath"].label).toBe(pathToVault);
    expect(trayMenu["vault"].saveToUserSettings).toHaveBeenCalledWith(
      pathToVault
    );
    expect(spyUpdateTray).toHaveBeenCalled();
  });
});
