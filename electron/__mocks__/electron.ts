const app = {
  dock: {
    hide: jest.fn(),
  },
  getVersion: jest.fn(() => ""),
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
  // showErrorBox: jest.fn(() => Promise.resolve()),
  // showMessageBox: jest.fn(() => Promise.resolve()),
  showOpenDialogSync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      filePaths: ["/fake/path/to/Canutin.vault"],
    })
  ),
  // showSaveDialog: jest.fn(() =>
  //   Promise.resolve({ canceled: false, filePath: undefined })
  // ),
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
  Menu,
  Tray,
  // dialog,
};
