import { BrowserWindow, BrowserWindowConstructorOptions, app, nativeTheme, screen } from "electron";
import path from "path";

const MIN_WINDOW_WIDTH = 1200;
const MIN_WINDOW_HEIGHT = 768;
const MAX_WINDOW_WIDTH = 1440;
const MAX_WINDOW_HEIGHT = 1200;

const calculateWindowWidth = (displayWidth: number) => {
  const relativeWindowWidth = Math.floor(displayWidth * 0.7);

  if (relativeWindowWidth < MIN_WINDOW_WIDTH) {
    return MIN_WINDOW_WIDTH;
  } else if (relativeWindowWidth > MAX_WINDOW_WIDTH) {
    return MAX_WINDOW_WIDTH;
  } else {
    return relativeWindowWidth;
  }
};

const calculateWindowHeight = (displayHeight: number) => {
  const relativeWindowHeight = Math.floor(displayHeight * 0.7);

  if (relativeWindowHeight < MIN_WINDOW_HEIGHT) {
    return MIN_WINDOW_HEIGHT;
  } else if (relativeWindowHeight > MAX_WINDOW_HEIGHT) {
    return MAX_WINDOW_HEIGHT;
  } else {
    return relativeWindowHeight;
  }
};

export const browserWindowConfig = (): BrowserWindowConstructorOptions => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  return {
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    width: calculateWindowWidth(width),
    height: calculateWindowHeight(height),
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#1c1c1c" : "#e3e3e3",
  }
}

export const setLoadingView = (window: BrowserWindow) => {
  const LOADING_HTML = "loading.html";

  if (app.isPackaged) {
    window.loadFile(path.join(process.resourcesPath, 'assets', LOADING_HTML));
  } else {
    window.loadFile(`../../resources/assets/${LOADING_HTML}`);
  }
}
