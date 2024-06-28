import path from "path";
import { app } from "electron";
import { fork, ChildProcess } from "child_process";

class Server {
  static readonly PORT_DEVELOPMENT = "3000";
  static readonly PORT_PRODUCTION = "42069";

  private isAppPackaged: boolean;
  private vaultPath: string;
  private port: string;
  private serverProcess: ChildProcess | null = null;
  readonly url: string;
  isRunning: boolean;

  constructor(vaultPath: string) {
    this.vaultPath = vaultPath;
    this.isAppPackaged = app.isPackaged;
    this.port = this.isAppPackaged
      ? Server.PORT_PRODUCTION
      : Server.PORT_DEVELOPMENT;
    this.isRunning = false;
    this.url = `http://localhost:${this.port}`;
  }

  start(newVaultPath?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const HOST = "127.0.0.1";
      const isAppPackaged = this.isAppPackaged;
      const isDev = process.env.NODE_ENV == "development";

      const svelteKitPath = isAppPackaged
        ? path.join(process.resourcesPath, "sveltekit")
        : path.join(__dirname, "../../sveltekit");

      const svelteKitModulePath = isAppPackaged
        ? path.join(svelteKitPath, "index.js")
        : path.join(svelteKitPath, "build", "index.js");

      this.serverProcess = fork(svelteKitModulePath, {
        env: {
          ...process.env,
          HOST,
          PORT: this.port,
          SVELTEKIT_PATH: svelteKitPath,
          DATABASE_URL: `file:${newVaultPath ? newVaultPath : this.vaultPath}`,
          SHOULD_CHECK_VAULT: "true",
          APP_VERSION: isDev
            ? require("../package.json").version
            : app.getVersion(),
        },
      });

      this.serverProcess.on('message', (message: any) => {
        if (message === 'sveltekit-server-ready') {
          this.isRunning = true;
          isDev && console.info(`\n-> Server started at ${this.url}\n`);
          resolve();
        }
      });

      this.serverProcess.on('error', (err) => {
        reject(err);
      });
    });
  }

  stop() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    this.isRunning = false;
  }
}

export default Server;
