import path from "path";
import Electron, { Menu } from "electron";

import TrayMenu from "../tray-menu";
import Vault from "../vault";
import Server from "../server";

describe("TrayMenu", () => {
  const fakeVault = new Vault();
  const fakePathToVault = "/fake/path/to/Canutin.vault";
  fakeVault.path = fakePathToVault;

  // FIXME:
  // tests pass but there is an error when the test runs where
  // `fakePathToImageAsset` returns "MODULE_NOT_FOUND".
  // REF https://github.com/Canutin/desktop-2/issues/6
  const fakeImageAsset = "fake-image";
  const fakePathToImageAsset = `/path/to/fake/assets/${fakeImageAsset}.png`;

  const spyPathJoin = jest
    .spyOn(path, "join")
    .mockReturnValue(fakePathToImageAsset);
  const spyIsPackaged = jest.spyOn(Electron.app, "isPackaged", "get");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("tray is set with the correct parameters", () => {
    // FIXME:
    // can't seem to spy on the `toggleServer()` method below:
    // const spyToggleServer = jest.spyOn(
    //   TrayMenu.prototype as any,
    //   "toggleServer"
    // );
    const spyGetImagePath = jest.spyOn(
      TrayMenu.prototype as any,
      "getImagePath"
    );
    const trayMenu = new TrayMenu(fakeVault);
    const tray = trayMenu["tray"];
    expect(trayMenu["menuCurrentTemplate"]).toMatchSnapshot();
    expect(spyGetImagePath).toHaveBeenCalledWith(TrayMenu.ICON_TRAY_IDLE);
    expect(tray.on).toHaveBeenCalledWith("click", expect.any(Function));
    expect(tray.setToolTip).toHaveBeenCalledWith("Canutin");
    expect(tray.setContextMenu).toHaveBeenCalledWith(
      Menu.buildFromTemplate(trayMenu["menuCurrentTemplate"])
    );
    expect(trayMenu["vault"]["path"]).toBe(fakePathToVault);
    // expect(spyToggleServer).toHaveBeenCalled();
  });

  test("the browser opens with the specified parameters", () => {
    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");

    const trayMenu = new TrayMenu(fakeVault);
    const spyShell = jest.spyOn(Electron.shell, "openExternal");
    trayMenu["openBrowser"]();
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0);

    trayMenu["openBrowser"](TrayMenu.OPEN_BROWSER_DELAY);
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      TrayMenu.OPEN_BROWSER_DELAY
    );

    jest.runAllTimers();
    expect(spyShell).toBeCalledWith(trayMenu["server"]?.url);
  });

  describe("develoment environment", () => {
    spyIsPackaged.mockReturnValue(false);
    const trayMenu = new TrayMenu(fakeVault);

    test("browser opens to the server url", () => {
      expect(trayMenu["server"]?.url).toBe(
        `http://localhost:${Server.PORT_DEVELOPMENT}`
      );
    });

    test("path to image assets", () => {
      spyPathJoin.mockClear();
      const imagePath = trayMenu["getImagePath"](fakeImageAsset);
      expect(imagePath).toBe(`./resources/assets/${fakeImageAsset}-light.png`);
      expect(spyPathJoin).not.toBeCalled();
    });
  });

  describe("production environment", () => {
    spyIsPackaged.mockReturnValue(true);
    const trayMenu = new TrayMenu(fakeVault);

    test("browser opens to the server url", () => {
      expect(trayMenu["server"]?.url).toBe(
        `http://localhost:${Server.PORT_PRODUCTION}`
      );
    });

    test("path to image assets", () => {
      const imagePath = trayMenu["getImagePath"](fakeImageAsset);
      expect(imagePath).toBe(fakePathToImageAsset);
      expect(spyPathJoin).toHaveBeenLastCalledWith(
        process.resourcesPath, // this is `undefined` in tests
        `assets/${fakeImageAsset}-light.png`
      );
    });
  });

  test("tray icon changes to the right theme color", () => {
    const ICON_TRAY_ACTIVE = "canutin-tray-active";
    const spyNativeTheme = jest.spyOn(
      Electron.nativeTheme,
      "shouldUseDarkColors",
      "get"
    );
    const trayMenu = new TrayMenu(fakeVault);

    expect(trayMenu["trayIcon"]).toBe(ICON_TRAY_ACTIVE);
    expect(spyPathJoin).toHaveBeenLastCalledWith(
      process.resourcesPath, // this is `undefined` in tests
      `assets/${ICON_TRAY_ACTIVE}-light.png`
    );

    spyNativeTheme.mockReturnValue(true);
    trayMenu["setTrayIcon"](ICON_TRAY_ACTIVE);
    expect(spyPathJoin).toHaveBeenLastCalledWith(
      process.resourcesPath, // this is `undefined` in tests
      `assets/${ICON_TRAY_ACTIVE}-dark.png`
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
    const spyUpdateTray = jest.spyOn(TrayMenu.prototype as any, "updateTray");
    const trayMenu = new TrayMenu(fakeVault);
    trayMenu["switchVault"];
    expect(trayMenu["menuVaultPath"].label).not.toBe(fakePathToVault);
    expect(spyElectronDialogSync).toHaveBeenCalledWith({
      properties: ["openFile"],
      filters: [{ name: "Canutin Vault", extensions: ["vault"] }],
    });
    expect(spyElectronDialogSync).toHaveReturnedWith({
      canceled: false,
      filePaths: [fakePathToVault],
    });
    expect(trayMenu["menuVaultPath"].label).toBe(fakePathToVault);
    expect(trayMenu["vault"].saveToUserSettings).toHaveBeenCalledWith(
      fakePathToVault
    );
    expect(spyUpdateTray).toHaveBeenCalled();
  });
});
