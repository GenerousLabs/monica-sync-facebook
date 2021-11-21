import { getFriends, selectForceSyncFriends } from "../facebook/friends";
import { getPhoto } from "../facebook/photos";
import { createFriendOnMonica } from "../monica/api";
import {
  pushToMonica,
  syncFriendDataToMonica,
  syncProfilePictureToMonica,
} from "../monica/monica";
import { addLogLine } from "../shared.log";
import { RuntimeMessage } from "../shared.types";
import { delay } from "../utils";

const syncToMonicaLoop = async () => {
  const friends = await getFriends();
  const toSync = selectForceSyncFriends(friends);

  for (const friend of toSync) {
    try {
      addLogLine(`Starting forced sync. #EhCYQg Friend ${friend.profileUrl}`);
      const monicaFriend = await createFriendOnMonica({ friend });
      await syncFriendDataToMonica({ monicaFriend, friend });

      const photoAsBlob = await getPhoto({ friend });
      if (typeof photoAsBlob !== "undefined") {
        await syncProfilePictureToMonica({
          monicaFriend,
          photoAsBlob,
        });
      }
      addLogLine(`Finished forced sync. #7FaD2B Friend ${friend.profileUrl}`);
    } catch (error) {
      addLogLine(
        `ERROR: Failed to force sync to monica. #txj9uR Friend ${
          friend.profileUrl
        }. Error: ${(error as Error)?.message}`
      );
    }
    // Always wait 2s between loops
    await delay(2e3);
  }
};

const startLoop = async () => {
  while (true) {
    await syncToMonicaLoop();
    await delay(1e3);
  }
};

const handleConnected = (port: browser.runtime.Port) => {
  port.onMessage.addListener((message) => {
    const { type } = message as RuntimeMessage;

    if (type === "pushToMonica") {
      pushToMonica();
    }
  });
};

browser.runtime.onConnect.addListener(handleConnected);

globalThis.setTimeout(() => {
  console.log("Background script is running #LT4FkG");
  startLoop();
}, 2e3);
