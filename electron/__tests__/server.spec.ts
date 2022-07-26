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
jest.mock("path");
jest.mock("child_process");

describe("Server", () => {
  const fakePathToVault = "/fake/path/to/Canutin.vault";
  const fakePid = 123456;
  const fakePathToSvelteKitIndex = "/fake/path/to/sveltekit/index.js";

  const spyPathJoin = jest
    .spyOn(path, "join")
    .mockImplementation(() => fakePathToSvelteKitIndex);
  const spyChildProcessFork = jest
    .spyOn(child_process, "fork")
    .mockReturnValue({ pid: fakePid } as child_process.ChildProcess);
  const spyIsPackaged = jest.spyOn(Electron.app, "isPackaged", "get");

  describe("develoment environment", () => {
    spyIsPackaged.mockReturnValue(false);
    const server = new Server(fakePathToVault);

    test("server url has the correct port", () => {
      expect(server.url).toBe(`http://localhost:${Server.PORT_DEVELOPMENT}`);
    });

    test("the server starts with the correct parameters", () => {
      expect(server.isRunning).toBe(false);
      expect(server["pid"]).toBe(undefined);

      server.start();

      expect(spyPathJoin).toHaveBeenCalledWith(
        expect.stringContaining("/electron"),
        "../../sveltekit/build/index.js"
      );
      expect(spyChildProcessFork).toHaveBeenCalledWith(
        fakePathToSvelteKitIndex,
        {
          env: {
            ...process.env,
            HOST: "127.0.0.1",
            PORT: Server.PORT_DEVELOPMENT,
            DATABASE_URL: `file:${fakePathToVault}`,
          },
        }
      );
      expect(server.isRunning).toBe(true);
      expect(server["pid"]).toBe(fakePid);
    });
  });

  describe("production environment", () => {
    spyIsPackaged.mockReturnValue(true);
    const server = new Server(fakePathToVault);

    test("server url has the correct port", () => {
      expect(server.url).toBe(`http://localhost:${Server.PORT_PRODUCTION}`);
    });

    test("the server starts with the correct parameters", () => {
      server.start();
      expect(spyPathJoin).toHaveBeenCalledWith(
        process.resourcesPath,
        "sveltekit/index.js"
      );
      expect(spyChildProcessFork).toHaveBeenCalledWith(
        fakePathToSvelteKitIndex,
        {
          env: {
            ...process.env,
            HOST: "127.0.0.1",
            PORT: Server.PORT_PRODUCTION,
            DATABASE_URL: `file:${fakePathToVault}`,
          },
        }
      );
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
