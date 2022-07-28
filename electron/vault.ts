import Store from "electron-store";

class Vault {
  private userSettings: Store;
  path: string | null;

  constructor() {
    this.userSettings = new Store();

    // FIXME:
    // check if the vault still exists at that path
    this.path = this.userSettings.get("vaultPath") as string | null;
  }

  saveToUserSettings(vaultPath: string | null) {
    this.userSettings.set({ vaultPath: vaultPath || null });
    this.path = vaultPath || null;
  }
}

export default Vault;
