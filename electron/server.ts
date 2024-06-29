import path from "path";
import { app, BrowserWindow, MessageChannelMain, utilityProcess, UtilityProcess } from "electron";

import { ELECTRON_MESSAGE_SERVER_READY } from "../sveltekit/src/lib/helpers/electron";
import { setLoadingView } from "./window";

function serverDelayInMilliseconds(): number {
  switch (process.env.NODE_ENV) {
    case "development":
      return 500;
    case "test":
      return 0;
    default:
      return 1500;
  }
}

class Server {
  static readonly PORT_DEVELOPMENT = "3000";
  static readonly PORT_PRODUCTION = "42069";

  private isAppPackaged: boolean;
  private vaultPath: string;
  private port: string;
  private serverProcess: UtilityProcess | null = null;
  readonly url: string;
  window: BrowserWindow;
  isRunning: boolean;

  constructor(vaultPath: string, window: BrowserWindow) {
    this.window = window;
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
      const isDev = process.env.NODE_ENV && ["development", "test"].includes(process.env.NODE_ENV);

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
        if (message !== ELECTRON_MESSAGE_SERVER_READY) return;

        try {
          // HACK:
          // We wait a bit to ensure the server is fully initialized, otherwise
          // the first fetch request might fail with a connection error.
          // The delay is more noticeable in production builds.
          setTimeout(async () => {
            // Send an initial fetch request to migrate the vault if necessary
            const response = await fetch(this.url);
            if (!response.ok) throw new Error(`-> Server responded with status ${response.status}`);

            this.isRunning = true;
            this.window.loadURL(this.url);
            resolve();
          }, serverDelayInMilliseconds());

        } catch (error) {
          reject(error);
        }
      });

      this.serverProcess.on('exit', (code) => {
        this.isRunning = false;
        if (code !== 0) reject(new Error(`-> Server process exited with code ${code}`));
      });
    });
  }

  stop() {
    if (!this.serverProcess) return;
    setLoadingView(this.window);
    this.serverProcess.kill();
    this.serverProcess = null;
  }
}

export default Server;
