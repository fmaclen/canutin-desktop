import path from "path";
import { app } from "electron";
import { fork } from "child_process";

class Server {
  static readonly PORT_DEVELOPMENT = "3000";
  static readonly PORT_PRODUCTION = "42069";

  private vaultPath: string;
  private isAppPackaged: boolean;
  private port: string;
  private pid: number | undefined;
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

  start(newVaultPath?: string) {
    const HOST = "127.0.0.1";
    const isAppPackaged = this.isAppPackaged;
    const isDev = process.env.NODE_ENV == "development";

    const svelteKitPath = isAppPackaged
      ? path.join(process.resourcesPath, "sveltekit")
      : path.join(__dirname, "../../sveltekit");

    const svelteKitModulePath = isAppPackaged
      ? path.join(svelteKitPath, "index.js")
      : path.join(svelteKitPath, "build", "index.js");

    const svelteKitProcess = fork(svelteKitModulePath, {
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

    this.pid = svelteKitProcess.pid; // Set process id so we can kill it private later
    this.isRunning = this.pid ? true : false;

    // Loggin the url to the console in development so it's easier to click
    isDev && console.info(`\n-> Server started at ${this.url}\n`);
  }

  stop() {
    if (!this.pid) return;

    process.kill(this.pid);
    this.pid = undefined;
    this.isRunning = false;
  }
}

export default Server;
