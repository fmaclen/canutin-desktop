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
    SHOULD_CHECK_VAULT: "true",
    APP_VERSION: require("../../package.json").version,
  };

  const spyPathJoin = jest
    .spyOn(path, "join")
    .mockReturnValue(fakePathToSvelteKitIndex);

  const mockOn = jest.fn();
  const mockKill = jest.fn();
  const mockChildProcess = { 
    pid: fakePid,
    on: mockOn,
    kill: mockKill
  } as unknown as child_process.ChildProcess;

  const spyChildProcessFork = jest
    .spyOn(child_process, "fork")
    .mockReturnValue(mockChildProcess);

  const spyIsPackaged = jest.spyOn(Electron.app, "isPackaged", "get");

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("development environment", () => {
    const server = new Server(fakePathToVault);

    test("server url has the correct port", () => {
      expect(server.url).toBe(`http://localhost:${Server.PORT_DEVELOPMENT}`);
    });

    test("the server starts with the correct parameters", async () => {
      expect(server.isRunning).toBe(false);
      expect(server["serverProcess"]).toBe(null);

      const startPromise = server.start();
      
      // Simulate the 'message' event to resolve the start promise
      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')[1];
      messageHandler('sveltekit-server-ready');
      
      await startPromise;

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
      expect(server["serverProcess"]).toBe(mockChildProcess);

      // Check app version in `package.json` matches semantic versioning
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

    test("the server starts with the correct parameters", async () => {
      const startPromise = server.start();
      
      // Simulate the 'message' event to resolve the start promise
      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')[1];
      messageHandler('sveltekit-server-ready');
      
      await startPromise;

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
    server["serverProcess"] = mockChildProcess;
    server.stop();
    expect(mockKill).toHaveBeenCalled();
    expect(server["serverProcess"]).toBe(null);
    expect(server.isRunning).toBe(false);
  });
});
