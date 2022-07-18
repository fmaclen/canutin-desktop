import { shell } from "electron";
import { exec, spawn } from "child_process";
import isDev from "electron-is-dev";

export const SERVER_PORT = isDev ? "3000" : "42069";
const SERVER_HOSTNAME = "127.0.0.1";
const SERVER_START_COMMAND = "node app/build/index.js"; // Svelte's build with `@adapter-node`
const START_SERVER_PROCESS = `PORT=${SERVER_PORT} HOST=${SERVER_HOSTNAME} ${SERVER_START_COMMAND}`;

let serverPid: number;
export const startServer = async () => {
  isDev && console.log("Starting server...");

  const { pid } = exec(START_SERVER_PROCESS);
  if (pid) {
    const url = `http://localhost:${SERVER_PORT}`;

    serverPid = pid; // Set process id so we can kill it later
    isDev && console.log(`🚀 Server ready at: ${url}`);

    // Open the user's browser to the server's URL
    //
    // FIXME:
    // To prevent opening the browser before the server is ready we wait 500ms.
    // Server boot up time is likely to vary so ideally we would "ping"
    // the server until it's ready and only then open the user's browser.
    setTimeout(() => shell.openExternal(url), 500);
  }
};

export const stopServer = () => {
  isDev && console.log("Stopping server...");
  process.kill(serverPid);
};
