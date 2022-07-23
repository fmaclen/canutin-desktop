import path from "path";
import { fork } from "child_process";
import { app } from "electron";

const { isPackaged } = app;
const serverPort = isPackaged ? "42069" : "3000";

export const serverUrl = `http://localhost:${serverPort}`;

let serverPid: number | undefined;
export const startServer = async (vaultPath: string) => {
  const HOST = "127.0.0.1";

  // Svelte's build with `@adapter-node`
  const serverModulePath = isPackaged
    ? path.join(process.resourcesPath, `sveltekit/index.js`)
    : path.resolve(__dirname, "../../sveltekit/build/index.js");

  const { pid } = fork(serverModulePath, {
    env: {
      ...process.env,
      HOST,
      PORT: serverPort,
      DATABASE_URL: `file:${vaultPath}`,
    },
  });

  serverPid = pid; // Set process id so we can kill it later

  !isPackaged && console.log(`\n-> Server started at ${serverUrl}\n`);
};

export const stopServer = () => {
  if (!serverPid) return;
  process.kill(serverPid);
  serverPid = undefined;
};
