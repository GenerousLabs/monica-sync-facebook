import { RuntimeMessage } from "../shared.types";

const handleConnected = (port: browser.runtime.Port) => {
  port.onMessage.addListener((message) => {
    const { type } = message as RuntimeMessage;

    if (type === "pushToMonica") {
      // Do something
      console.log("Push to monica triggered #b2Znp1");
    }
  });
};

browser.runtime.onConnect.addListener(handleConnected);

globalThis.setTimeout(() => {
  console.log("Background script is running #LT4FkG");
}, 2e3);
