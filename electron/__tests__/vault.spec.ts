import Store from "electron-store";
import Fs from "fs";

import Vault from "../vault";

describe("Vault", () => {
  let vault: Vault;
  const fakePathToVault = "/fake/path/to/Canutin.vault";

  beforeEach(() => {
    jest.clearAllMocks();
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
