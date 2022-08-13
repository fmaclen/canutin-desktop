import Store from "electron-store";
import Fs from "fs";

class Vault {
  private userSettings: Store;
  path: string | null;

  constructor() {
    this.userSettings = new Store();
    this.path = this.getVaultPath();
  }

  saveToUserSettings(vaultPath: string | null) {
    this.userSettings.set({ vaultPath: vaultPath || null });
    this.path = vaultPath || null;
  }

  private getVaultPath = () => {
    const vaultPath = this.userSettings.get("vaultPath") as string | null;
    return vaultPath && Fs.existsSync(vaultPath) ? vaultPath : null;
  };
}

export default Vault;
