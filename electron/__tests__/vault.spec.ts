import Electron from "electron";
import Store from "electron-store";
import Fs from "fs";

import Vault from "../vault";

describe("Vault", () => {
  let vault: Vault;
  const fakePathToVault = "/fake/path/to/Canutin.vault";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Dialog", () => {
    let spyShowMessageBoxSync: jest.SpyInstance;
    let spyShowSaveDialogSync: jest.SpyInstance;
    let spyShowOpenDialogSync: jest.SpyInstance;
    let spyFsCopyFileSync: jest.SpyInstance;
    let spyVaultCreate: jest.SpyInstance;
    let spyVaultLoad: jest.SpyInstance;

    beforeAll(() => {
      vault = new Vault();
      spyShowMessageBoxSync = jest.spyOn(Electron.dialog, "showMessageBoxSync");
      spyShowSaveDialogSync = jest.spyOn(Electron.dialog, "showSaveDialogSync");
      spyShowOpenDialogSync = jest.spyOn(Electron.dialog, "showOpenDialogSync");
      spyFsCopyFileSync = jest.spyOn(Fs, "copyFileSync");
      spyVaultCreate = jest.spyOn(vault, "create");
      spyVaultLoad = jest.spyOn(vault, "load");
    });

    test("Create new vault", () => {
      spyShowMessageBoxSync.mockReturnValue(0);
      spyFsCopyFileSync.mockReturnValue(() => {});
      vault.dialog();
      expect(spyVaultCreate).toHaveBeenCalled();
      expect(spyShowSaveDialogSync).toHaveBeenCalled();
      expect(spyFsCopyFileSync).toHaveBeenCalledWith(
        "./resources/vault/Canutin.base.vault",
        fakePathToVault
      );
    });

    test("Open existing vault", () => {
      spyShowMessageBoxSync.mockReturnValue(1);
      vault.dialog();
      expect(spyShowOpenDialogSync).toHaveBeenCalled();
      expect(spyVaultLoad).toHaveBeenCalled();
    });

    test("Cancel", () => {
      spyShowMessageBoxSync.mockReturnValue(2);
      vault.dialog();
      expect(spyShowMessageBoxSync).toHaveBeenCalledWith({
        type: "info",
        title: "Canutin",
        message: "Canutin Vault",
        buttons: ["Create new vault", "Open existing vault", "Do it later"],
        detail:
          "A vault is a file that stores all the data required to run the app",
        cancelId: 2,
      });
      expect(spyVaultCreate).not.toHaveBeenCalled();
      expect(spyVaultLoad).not.toHaveBeenCalled();
    });
  });

  describe("With no existing path", () => {
    beforeEach(() => {
      vault = new Vault();
      vault.saveToUserSettings(undefined);
    });

    test("vault path can't be read from user settings", () => {
      expect(vault["userSettings"]).toBeInstanceOf(Store);
      expect(vault.path).toBe(undefined);
    });

    test("vault path can be saved and read from user settings", () => {
      vault.saveToUserSettings(fakePathToVault);
      expect(vault.path).toBe(fakePathToVault);
    });
  });

  describe("With existing path", () => {
    test("checks if the vault file exists at the path", () => {
      const spyFsExistsSync = jest.spyOn(Fs, "existsSync");
      spyFsExistsSync.mockReturnValue(true);
      vault = new Vault();
      vault.path = fakePathToVault;
      expect(spyFsExistsSync).toHaveBeenCalledWith(fakePathToVault);
    });
  });
});
