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

    // Svelte's build with `@adapter-private node`
    const serverModulePath = isAppPackaged
      ? path.join(process.resourcesPath, "sveltekit/index.js")
      : path.join(__dirname, "../../sveltekit/build/index.js");

    const { pid } = fork(serverModulePath, {
      env: {
        ...process.env,
        HOST,
        PORT: this.port,
        DATABASE_URL: `file:${newVaultPath ? newVaultPath : this.vaultPath}`,
      },
    });

    this.isRunning = true;
    this.pid = pid; // Set process id so we can kill it private later

    // Loggin the url to the console in development so it's easier to click
    process.env.NODE_ENV == "development" &&
      console.info(`\n-> Server started at ${this.url}\n`);
  }

  stop() {
    if (!this.pid) return;

    process.kill(this.pid);
    this.pid = undefined;
  }
}

export default Server;
