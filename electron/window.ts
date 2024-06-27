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

export const browserWindowConfig = (width: number, height: number) => {
  return {
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    width: calculateWindowWidth(width),
    height: calculateWindowHeight(height),
  }
}
