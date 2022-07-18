import { exec } from "child_process";
import isDev from "electron-is-dev";

const SERVER_PORT = isDev ? "3000" : "42069";
const SERVER_HOSTNAME = "127.0.0.1";
const SERVER_START_COMMAND = "node app/build/index.js"; // Svelte's build with `@adapter-node`
const START_SERVER_PROCESS = `PORT=${SERVER_PORT} HOST=${SERVER_HOSTNAME} ${SERVER_START_COMMAND}`;
export const SERVER_URL = `http://localhost:${SERVER_PORT}`;

let serverPid: number | undefined;
export const startServer = async () => {
  isDev && console.log("Starting server...");

  const { pid } = exec(START_SERVER_PROCESS);
  serverPid = pid; // Set process id so we can kill it later
  isDev && serverPid && console.log(`🚀 Server ready at: ${SERVER_URL}`);
};

export const stopServer = () => {
  if (!serverPid) return;

  isDev && console.log("Stopping server...");
  process.kill(serverPid);
  serverPid = undefined;
};
