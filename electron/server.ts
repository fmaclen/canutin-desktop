import path from "path";
import { fork } from "child_process";
import { app } from "electron";

const serverPort = app.isPackaged ? "42069" : "3000";

export const serverUrl = `http://localhost:${serverPort}`;

let serverPid: number | undefined;
export const startServer = async () => {
  const HOST = "127.0.0.1";
  const databaseUrl = "file:./Canutin.vault"; // FIXME: this should be loaded from an Electron dialog — https://www.electronjs.org/docs/latest/api/dialog

  // Svelte's build with `@adapter-node`
  const serverModulePath = app.isPackaged
    ? path.join(process.resourcesPath, `sveltekit/index.js`)
    : `${path.resolve(__dirname, "../../app/build/index.js")}`;

  const { pid } = fork(serverModulePath, {
    env: { ...process.env, HOST, PORT: serverPort, DATABASE_URL: databaseUrl },
  });

  serverPid = pid; // Set process id so we can kill it later
};

export const stopServer = () => {
  if (!serverPid) return;
  process.kill(serverPid);
  serverPid = undefined;
};
