import path from "path";
import { app, MessageChannelMain, utilityProcess, UtilityProcess } from "electron";

import { ELECTRON_MESSAGE_SERVER_READY } from "../sveltekit/src/lib/helpers/electron";

class Server {
  static readonly PORT_DEVELOPMENT = "3000";
  static readonly PORT_PRODUCTION = "42069";

  private isAppPackaged: boolean;
  private vaultPath: string;
  private port: string;
  private serverProcess: UtilityProcess | null = null;
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

      const { port1 } = new MessageChannelMain();
      this.serverProcess = utilityProcess.fork(svelteKitModulePath, [], {
        env: {
          ...process.env,
          HOST,
          PORT: this.port,
          SVELTEKIT_PATH: svelteKitPath,
          DATABASE_URL: `file:${newVaultPath ? newVaultPath : this.vaultPath}`,
          SHOULD_CHECK_VAULT: "true",
          IS_ELECTRON: "true",
          APP_VERSION: isDev
            ? require("../package.json").version
            : app.getVersion(),
        },
      });

      this.serverProcess.once('spawn', () => {
        this.serverProcess!.postMessage({ message: 'port' }, [port1]);
      });

      this.serverProcess.on('message', async (message) => {
        if (message === ELECTRON_MESSAGE_SERVER_READY) {

          // Send an initial fetch request to initialize the server
          try {
            await fetch(this.url);
          } catch (error) {
            console.error('-> Error initializing server:', error);
            reject(error);
            return;
          }

          this.isRunning = true;
          resolve();
        }
      });

      this.serverProcess.on('exit', (code) => {
        if (code !== 0) reject(new Error(`-> Server process exited with code ${code}`));
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
