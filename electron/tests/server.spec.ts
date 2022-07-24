import path from "path";
import child_process from "child_process";

import Server from "../server";
import { ServerPort } from "../constants";

describe("Server", () => {
  const fakePathToVault = "/fake/path/to/Canutin.vault";
  const fakePid = 123456;

  test("url is different in development and production environments", () => {
    let isAppPackaged = false;
    let server = new Server(isAppPackaged, fakePathToVault);
    expect(server.url).toBe(`http://localhost:${ServerPort.DEVELOPMENT}`);

    isAppPackaged = true;
    server = new Server(isAppPackaged, fakePathToVault);
    expect(server.url).toBe(`http://localhost:${ServerPort.PRODUCTION}`);
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
    let isAppPackaged = false;
    let server = new Server(isAppPackaged, fakePathToVault);
    expect(server["pid"]).toBe(undefined);

    server.start();
    expect(spyPathJoin).toHaveBeenCalled();
    expect(spyChildProcessFork).toHaveBeenCalledWith(fakePathToSvelteKitIndex, {
      env: {
        ...process.env,
        HOST: "127.0.0.1",
        PORT: ServerPort.DEVELOPMENT,
        DATABASE_URL: `file:${fakePathToVault}`,
      },
    });
    expect(server["pid"]).toBe(fakePid);

    // Start the server in production mode
    isAppPackaged = true;
    server = new Server(isAppPackaged, fakePathToVault);
    server.start();
    expect(spyChildProcessFork).toHaveBeenCalledWith(fakePathToSvelteKitIndex, {
      env: {
        ...process.env,
        HOST: "127.0.0.1",
        PORT: ServerPort.PRODUCTION,
        DATABASE_URL: `file:${fakePathToVault}`,
      },
    });
  });

  test("the server stops", () => {
    jest.mock("process");

    let isAppPackaged = true;
    let server = new Server(isAppPackaged, fakePathToVault);
    server["pid"] = fakePid;
    const spyProcessKill = jest.spyOn(process, "kill").mockReturnValue(true);

    server.stop();
    expect(spyProcessKill).toHaveBeenCalledWith(fakePid);
    expect(server["pid"]).toBe(undefined);
  });
});
