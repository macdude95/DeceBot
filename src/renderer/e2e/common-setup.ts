import { Application } from "spectron";
import electronPath = require("electron"); // Require Electron from the binaries included in node_modules.
import path = require("path");

export default function setup(): void {
  beforeEach(async function () {
    this.app = new Application({
      // Your electron path can be any binary
      // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
      // But for the sake of the example we fetch it from our node_modules.
      path: (electronPath as unknown) as string,

      // The following line tells spectron to look and use the main.js file
      // and the package.json located 1 level above.
      args: [path.join(__dirname, "../../..")],
      webdriverOptions: {},
    });
    await this.app.start();
    const browser = this.app.client;
    await browser.waitUntilWindowLoaded();

    browser.timeouts("script", 15000);
  });

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });
}
