import path from "path";
import { fork } from "child_process";
import { ServerPort } from "./constants";

class Server {
  private vaultPath: string;
  private isAppPackaged: boolean;
  private port: ServerPort;
  private pid: number | undefined;
  readonly url: string;

  constructor(isAppPackaged: boolean, vaultPath: string) {
    this.vaultPath = vaultPath;
    this.isAppPackaged = isAppPackaged;
    this.port = isAppPackaged ? ServerPort.PRODUCTION : ServerPort.DEVELOPMENT;
    this.url = `http://localhost:${this.port}`;
  }

  start() {
    const HOST = "127.0.0.1";
    const { isAppPackaged } = this;

    // Svelte's build with `@adapter-private node`
    const serverModulePath = isAppPackaged
      ? path.join(process.resourcesPath, "sveltekit/index.js")
      : path.join(__dirname, "../../sveltekit/build/index.js");

    const { pid } = fork(serverModulePath, {
      env: {
        ...process.env,
        HOST,
        PORT: this.port,
        DATABASE_URL: `file:${this.vaultPath}`,
      },
    });

    this.pid = pid; // Set process id so we can kill it private later

    !isAppPackaged && console.log(`\n-> Server started at ${this.url}\n`);
  }

  stop() {
    if (!this.pid) return;

    process.kill(this.pid);
    this.pid = undefined;
  }
}

export default Server;
