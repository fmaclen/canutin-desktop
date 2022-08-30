const app = {
  dock: {
    hide: jest.fn(),
  },
  getVersion: jest.fn(() => require("../../package.json").version),
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

module.exports = {
  app,
  shell,
  dialog,
  nativeTheme,
  Menu,
  Tray,
};
