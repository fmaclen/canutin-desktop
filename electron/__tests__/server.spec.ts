import path from "path";
import child_process from "child_process";
import Electron from "electron";

import Server from "../server";

describe("Server", () => {
  const fakePathToVault = "/fake/path/to/Canutin.vault";
  const fakePid = 123456;
  const fakePathToSvelteKitIndex = "/fake/path/to/sveltekit";
  const svelteKitStartupEnv = {
    ...process.env,
    HOST: "127.0.0.1",
    SVELTEKIT_PATH: fakePathToSvelteKitIndex,
    DATABASE_URL: `file:${fakePathToVault}`,
    ELECTRON_SWITCHED_VAULT: "true",
    APP_VERSION: require("../../package.json").version,
  };

  const spyPathJoin = jest
    .spyOn(path, "join")
    .mockReturnValue(fakePathToSvelteKitIndex);
  const spyChildProcessFork = jest
    .spyOn(child_process, "fork")
    .mockReturnValue({ pid: fakePid } as child_process.ChildProcess);
  const spyIsPackaged = jest.spyOn(Electron.app, "isPackaged", "get");

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("develoment environment", () => {
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
        "../../sveltekit"
      );
      expect(spyPathJoin).toHaveBeenCalledWith(
        expect.stringContaining("/sveltekit"),
        "build",
        "index.js"
      );
      expect(spyChildProcessFork).toHaveBeenCalledWith(
        fakePathToSvelteKitIndex,
        {
          env: {
            ...svelteKitStartupEnv,
            PORT: Server.PORT_DEVELOPMENT,
          },
        }
      );
      expect(server.isRunning).toBe(true);
      expect(server["pid"]).toBe(fakePid);

      // Check version matches semver
      // REGEX source: https://gist.github.com/jhorsman/62eeea161a13b80e39f5249281e17c39?permalink_comment_id=3034996#gistcomment-3034996
      expect(svelteKitStartupEnv.APP_VERSION).toMatch(
        /^([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/gm
      );
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
        "sveltekit"
      );
      expect(spyPathJoin).toHaveBeenCalledWith(
        expect.stringContaining("/sveltekit"),
        "index.js"
      );
      expect(spyChildProcessFork).toHaveBeenCalledWith(
        fakePathToSvelteKitIndex,
        {
          env: {
            ...svelteKitStartupEnv,
            PORT: Server.PORT_PRODUCTION,
          },
        }
      );
    });
  });

  test("the server stops", () => {
    const server = new Server(fakePathToVault);
    const spyProcessKill = jest.spyOn(process, "kill").mockReturnValue(true);
    server["pid"] = fakePid;
    server.stop();
    expect(spyProcessKill).toHaveBeenCalledWith(fakePid);
    expect(server["pid"]).toBe(undefined);
  });
});
