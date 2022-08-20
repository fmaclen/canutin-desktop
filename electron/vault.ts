import { app, dialog } from "electron";
import path from "path";
import Fs from "fs";
import { exec } from "child_process";
import Store from "electron-store";

class Vault {
  private userSettings: Store;
  path: string | undefined;

  constructor() {
    this.userSettings = new Store();
    this.path = this.getVaultPath();
  }

  saveToUserSettings(vaultPath: string | undefined) {
    this.userSettings.set({ vaultPath: vaultPath || null });
    this.path = vaultPath || undefined;
  }

  dialog = () => {
    const dialogOption = dialog.showMessageBoxSync({
      type: "info",
      title: "Canutin",
      message: "Canutin Vault",
      buttons: ["Create new vault", "Open existing vault", "Do it later"],
      detail:
        "A vault is a file that stores all the data required to run the app",
      cancelId: 2,
    });

    let isVaultSet = false;
    switch (dialogOption) {
      case 0:
        isVaultSet = this.create();
        break;
      case 1:
        isVaultSet = this.load();
        break;
      case 2:
        return false;
    }

    if (isVaultSet) {
      return true;
    } else {
      this.dialog();
    }
  };

  create = () => {
    const newVaultPath = dialog.showSaveDialogSync({
      title: "Canutin",
      defaultPath: "~/Canutin.vault",
      filters: [{ name: "Canutin Vault", extensions: ["vault"] }],
    });

    if (!newVaultPath) return false;

    this.saveToUserSettings(newVaultPath);
    return true;
  };

  load = () => {
    const filePaths = dialog.showOpenDialogSync({
      properties: ["openFile"],
      filters: [{ name: "Canutin Vault", extensions: ["vault"] }],
    });

    if (!filePaths) return false;

    const vaultPath = filePaths[0];
    this.saveToUserSettings(vaultPath);
    return true;
  };

  private getVaultPath = () => {
    const vaultPath = this.userSettings.get("vaultPath") as string | undefined;
    return vaultPath && Fs.existsSync(vaultPath) ? vaultPath : undefined;
  };
}

export default Vault;
