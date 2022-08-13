import { app, dialog } from "electron";
import path from "path";
import Fs from "fs";
import { exec } from "child_process";
import Store from "electron-store";

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

  create = () => {
    const vaultPath = dialog.showSaveDialogSync({
      title: "Canutin",
      defaultPath: "~/Canutin.vault",
      filters: [{ name: "Canutin Vault", extensions: ["vault"] }],
    });

    if (!vaultPath) return false;

    // const currentPath = app.isPackaged
    //   ? path.join(process.resourcesPath, `vault/Canutin.vault`)
    //   : `./resources/vault/Canutin.vault`;
    // Fs.copyFileSync(currentPath, vaultPath);

    // const databaseUrl = `DATABASE_URL="file:${vaultPath}"`;
    // const deploy = exec(`${databaseUrl} prisma migrate deploy`);
    // exec(`${databaseUrl} prisma db seed`);

    this.saveToUserSettings(vaultPath);
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
    const vaultPath = this.userSettings.get("vaultPath") as string | null;
    return vaultPath && Fs.existsSync(vaultPath) ? vaultPath : null;
  };
}

export default Vault;
