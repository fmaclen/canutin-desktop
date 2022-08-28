import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testPathIgnorePatterns: ["/sveltekit/tests"],
  extensionsToTreatAsEsm: [".ts"],
};

export default config;
