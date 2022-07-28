import Store from "electron-store";

import Vault from "../vault";

describe("Vault", () => {
  let vault: Vault;

  beforeEach(() => {
    jest.clearAllMocks();
    vault = new Vault();
    vault.saveToUserSettings(null);
  });

  test("vault path can't be read from user settings", () => {
    expect(vault["userSettings"]).toBeInstanceOf(Store);
    expect(vault.path).toBe(null);
  });

  test("vault path can be saved and read from user settings", () => {
    vault.saveToUserSettings("/fake/path/to/Canutin.vault");
    expect(vault.path).toBe("/fake/path/to/Canutin.vault");
  });
});
