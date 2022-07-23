import { _electron as electron } from "playwright";
import { test, expect, ElectronApplication } from "@playwright/test";

test.describe("electron app", () => {
  let electronApp: ElectronApplication;

  test.beforeEach(async () => {
    electronApp = await electron.launch({ args: ["dist/main/main.js"] });
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test("ZZZ", async () => {
    console.log("Test go here");
  });
});
