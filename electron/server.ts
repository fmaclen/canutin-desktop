import path from "path";
import { fork } from "child_process";
import isDev from "electron-is-dev";
import { app } from "electron";

const serverPort = app.isPackaged ? "42069" : "3000";
export const serverUrl = `http://localhost:${serverPort}`;

let serverPid: number | undefined;
export const startServer = async () => {
  isDev && console.log("Starting server...");

  const HOST = "127.0.0.1";
  const databaseUrl = "file:./Canutin.vault"; // FIXME: this should be loaded from an Electron dialog — https://www.electronjs.org/docs/latest/api/dialog

  // Svelte's build with `@adapter-node`
  const serverModulePath = app.isPackaged
    ? `${path.resolve(__dirname, "server/index.js")}`
    : `${path.resolve(__dirname, "../../app/build/index.js")}`;

  const { pid } = fork(serverModulePath, {
    env: { ...process.env, HOST, PORT: serverPort, DATABASE_URL: databaseUrl },
  });

  serverPid = pid; // Set process id so we can kill it later
  isDev && serverPid && console.log(`🚀 Server ready at: ${serverUrl}`);
};

export const stopServer = () => {
  if (!serverPid) return;

  isDev && console.log("Stopping server...");
  process.kill(serverPid);
  serverPid = undefined;
};
