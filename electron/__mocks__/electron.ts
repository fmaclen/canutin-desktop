const app = {
  dock: {
    hide: jest.fn(),
  },
  getVersion: jest.fn(() => "0.0.0-development"),
  getName: jest.fn(() => "test"),
  getPath: jest.fn(() => "."),
  requestSingleInstanceLock: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
  quit: jest.fn(),
  get isPackaged() {
    return false;
  },
};

const shell = {
  openExternal: jest.fn(),
};

const dialog = {
  showMessageBoxSync: jest.fn(),
  showSaveDialogSync: jest.fn(() => "/fake/path/to/Canutin.vault"),
  showOpenDialogSync: jest.fn(() => ({
    filePaths: ["/fake/path/to/Canutin.vault"],
  })),
};

const nativeTheme = {
  on: jest.fn(),
  get shouldUseDarkColors() {
    return false;
  },
};

const Tray = jest.fn(() => ({
  on: jest.fn(),
  setContextMenu: jest.fn(),
  setToolTip: jest.fn(),
  setImage: jest.fn(),
  popUpContextMenu: jest.fn(),
}));

const Menu = {
  buildFromTemplate: jest.fn(),
};

const BrowserWindow = jest.fn(() => ({
  loadFile: jest.fn(),
  loadURL: jest.fn(),
}));

const MessageChannelMain = jest.fn();

const utilityProcess = {
  fork: jest.fn(),
};

module.exports = {
  app,
  shell,
  dialog,
  nativeTheme,
  utilityProcess,
  Menu,
  Tray,
  BrowserWindow,
  MessageChannelMain,
};
