import path from "path";
import Electron, { Menu, app, dialog } from "electron";

import TrayMenu from "../tray-menu";
import Vault from "../vault";
import Server from "../server";

describe("TrayMenu", () => {
  // FIXME:
  // tests pass but there is an error when the test runs where
  // the `fakePathToImageAsset` is not found.

  const fakeVault = new Vault();
  const fakePathToVault = "/fake/path/to/Canutin.vault";
  fakeVault.path = fakePathToVault;

  const fakeImageAsset = "fake-image";
  const fakePathToImageAsset = `/path/to/fake/assets/${fakeImageAsset}.png`;

  const spyIsPackaged = jest.spyOn(Electron.app, "isPackaged", "get");
  const spyPathJoin = jest
    .spyOn(path, "join")
    .mockReturnValue(fakePathToImageAsset);

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    trayMenu["openVault"];
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
      expect(imagePath).toBe(`./resources/assets/${fakeImageAsset}.png`);
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
        `assets/${fakeImageAsset}.png`
      );
    });
  });
});
