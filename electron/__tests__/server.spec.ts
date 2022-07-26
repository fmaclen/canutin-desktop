import path from "path";
import child_process from "child_process";
import Electron from "electron";

import Server from "../server";

jest.mock("electron", () => {
  return {
    app: {
      get isPackaged(): boolean {
        return false;
      },
    },
  };
});

describe("Server", () => {
  const fakePathToVault = "/fake/path/to/Canutin.vault";
  const fakePid = 123456;
  const isPackagedSpy = jest.spyOn(Electron.app, "isPackaged", "get");

  test("url is different in development and production environments", () => {
    let server = new Server(fakePathToVault);
    expect(server.url).toBe(`http://localhost:${Server.PORT_DEVELOPMENT}`);

    // app.isPackaged = true;
    isPackagedSpy.mockReturnValueOnce(true);
    server = new Server(fakePathToVault);
    expect(server.url).toBe(`http://localhost:${Server.PORT_PRODUCTION}`);
  });

  test("the server starts with the correct parameters", () => {
    jest.mock("path");
    jest.mock("child_process");

    const fakePathToSvelteKitIndex = "/fake/path/to/sveltekit/index.js";
    const spyPathJoin = jest
      .spyOn(path, "join")
      .mockImplementation(() => fakePathToSvelteKitIndex);
    const spyChildProcessFork = jest
      .spyOn(child_process, "fork")
      .mockReturnValue({ pid: fakePid } as child_process.ChildProcess);

    // Start the server in development mode
    let server = new Server(fakePathToVault);
    expect(server.isRunning).toBe(false);
    expect(server["pid"]).toBe(undefined);

    server.start();
    expect(spyPathJoin).toHaveBeenCalledWith(
      expect.stringContaining("/electron"),
      "../../sveltekit/build/index.js"
    );
    expect(spyChildProcessFork).toHaveBeenCalledWith(fakePathToSvelteKitIndex, {
      env: {
        ...process.env,
        HOST: "127.0.0.1",
        PORT: Server.PORT_DEVELOPMENT,
        DATABASE_URL: `file:${fakePathToVault}`,
      },
    });
    expect(server.isRunning).toBe(true);
    expect(server["pid"]).toBe(fakePid);

    // Start the server in production mode
    isPackagedSpy.mockReturnValueOnce(true);
    server = new Server(fakePathToVault);

    server.start();
    expect(spyPathJoin).toHaveBeenCalledWith(
      process.resourcesPath,
      "sveltekit/index.js"
    );
    expect(spyChildProcessFork).toHaveBeenCalledWith(fakePathToSvelteKitIndex, {
      env: {
        ...process.env,
        HOST: "127.0.0.1",
        PORT: Server.PORT_PRODUCTION,
        DATABASE_URL: `file:${fakePathToVault}`,
      },
    });
  });

  test("the server stops", () => {
    jest.mock("process");

    const server = new Server(fakePathToVault);
    const spyProcessKill = jest.spyOn(process, "kill").mockReturnValue(true);
    server["pid"] = fakePid;
    server.stop();
    expect(spyProcessKill).toHaveBeenCalledWith(fakePid);
    expect(server["pid"]).toBe(undefined);
  });
});
