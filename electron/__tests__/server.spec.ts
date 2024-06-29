import path from 'path';
import { BrowserWindow, MessageChannelMain, UtilityProcess, utilityProcess } from 'electron';
import { ELECTRON_MESSAGE_SERVER_READY } from '../../sveltekit/src/lib/helpers/electron';
import Server from '../server';

describe('Server', () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true });

  let server: Server;
  let mockWindow: BrowserWindow;
  let mockServerProcess: UtilityProcess;
  const vaultPath = '/path/to/vault';

  beforeEach(() => {
    mockWindow = new BrowserWindow();
    server = new Server(vaultPath, mockWindow);

    let onExitCallback: ((code: number) => void) | undefined;
    mockServerProcess = {
      once: jest.fn().mockImplementation((event, callback) => {
        if (event === 'spawn') {
          callback();
        }
      }),
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'message') {
          callback(ELECTRON_MESSAGE_SERVER_READY);
        } else if (event === 'exit') {
          onExitCallback = callback;
        }
      }),
      postMessage: jest.fn(),
      kill: jest.fn(() => {
        onExitCallback?.(0);
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize server with correct properties', () => {
    expect(server.window).toBe(mockWindow);
    expect(server['vaultPath']).toBe(vaultPath);
    expect(server['isAppPackaged']).toBe(false);
    expect(server['port']).toBe(Server.PORT_DEVELOPMENT);
    expect(server.isRunning).toBe(false);
    expect(server.url).toBe(`http://localhost:${Server.PORT_DEVELOPMENT}`);
  });

  test('should start server with correct parameters in development', async () => {
    const newVaultPath = '/new/vault/path';
    const spyPathJoin = jest.spyOn(path, 'join');
    const mockServerProcess = {
      once: jest.fn().mockImplementation((event, callback) => {
        if (event === 'spawn') {
          callback();
        }
      }),
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'message') {
          callback(ELECTRON_MESSAGE_SERVER_READY);
        }
      }),
      postMessage: jest.fn(),
      kill: jest.fn(),
    } as any;
    jest.spyOn(utilityProcess, 'fork').mockReturnValue(mockServerProcess);
  
    await server.start(newVaultPath);
  
    // HACK: `__dirname` is returning an additional `/__tests__` in the path
    expect(spyPathJoin).toHaveBeenCalledWith(__dirname.split("/__tests__")[0], '../../sveltekit');
    expect(spyPathJoin).toHaveBeenCalledWith(expect.any(String), 'build', 'index.js');
    expect(require('electron').MessageChannelMain).toHaveBeenCalled();
  
    expect(mockServerProcess.once).toHaveBeenCalledWith('spawn', expect.any(Function));
    expect(mockServerProcess.on).toHaveBeenCalledWith('message', expect.any(Function));
  
    expect(global.fetch).toHaveBeenCalledWith(server.url);
    expect(server.isRunning).toBe(true);
    expect(server.window.loadURL).toHaveBeenCalledWith(server.url);
  });

  test('should stop server and reset properties', async () => {
    jest.spyOn(utilityProcess, 'fork').mockReturnValue(mockServerProcess);

    // Start the server
    await server.start();
    server.stop();
    expect(mockServerProcess.kill).toHaveBeenCalled();
    expect(server['serverProcess']).toBeNull();
    expect(server.isRunning).toBe(false);
  });
});
