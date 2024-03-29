import { BuildOptions } from "esbuild";
import * as path from "path";

const config: BuildOptions = {
  platform: "node",
  entryPoints: [path.resolve("electron/main.ts")],
  bundle: true,
  target: "node16.15.0", // electron version target
};

export default config;
