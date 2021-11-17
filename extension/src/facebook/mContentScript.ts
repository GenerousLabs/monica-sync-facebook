import { FacebookFriend } from "../shared.types";
import { getState } from "../state";
import { getByIdOrThrow } from "../utils";
import { setFriends } from "./friends";

const POPOVER_DIV_ID = "monicaSyncFacebookPopover";

const scrollToTheBottom = async () => {
  let pageHeight = 0;
  let noChangeCount = 0;
  await new Promise<void>((resolve) => {
    const intervalId = globalThis.setInterval(() => {
      // First, let's scroll the page down
      globalThis.window.scrollBy(0, 600);

      // Detect the bottom of the infinite scroll
      const newHeight = globalThis.document.body.scrollHeight;

      if (newHeight === pageHeight) {
        if (noChangeCount < 5) {
          console.log("Increment count #WDpdMJ");
          noChangeCount += 1;
        } else {
          console.log("Reset count #iOslB6");
          noChangeCount = 0;
          // Stop now and capture the data
          globalThis.clearInterval(intervalId);
          resolve();
          return;
        }
      }
    }, 400);
  });
};

const captureFriends = (doc: Document) => {
  // Facebook uses a mixture of h3 and h1 tags, the h3 are loaded first and the
  // h1 are loaded via infinite scroll.
  const h3s = doc.getElementsByTagName("h3");
  const h1s = doc.getElementsByTagName("h1");

  const headingArray = Array.from(h3s).concat(Array.from(h1s));

  const friends = headingArray.map((heading) => {
    if (heading.firstChild === null) {
      return;
    }
    const profileUrl = (heading.firstChild as HTMLLinkElement).href;
    const name = heading.innerText;
    return { profileUrl, name };
  });

  const filteredFriends = friends.filter((friend) => {
    if (typeof friend === "undefined") {
      return false;
    }
    const { profileUrl } = friend;
    if (typeof profileUrl !== "string" || profileUrl.length === 0) {
      return false;
    }
    return true;
  }) as FacebookFriend[];

  return filteredFriends;
};

const captureAndSaveFriends = async () => {
  const friends = captureFriends(globalThis.document);

  await setFriends(friends);

  globalThis.alert(`Your ${friends.length} friends have been saved. #PCw0RC`);
};

const createContainer = (doc: Document) => {
  const { body } = doc;

  const container = doc.createElement("div");
  container.id = POPOVER_DIV_ID;
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "50%";
  container.style.width = "300px";
  container.style.marginLeft = "-150px";
  container.style.padding = "30px";
  container.style.zIndex = "1000";
  container.style.backgroundColor = "red";

  const existingContainer = doc.getElementById(POPOVER_DIV_ID);

  if (existingContainer) {
    return existingContainer;
  }

  body.insertBefore(container, body.firstChild);
  return container;
};

const insertPopOver = (doc: Document) => {
  const container = createContainer(doc);
  container.innerHTML = `<p>Monica Sync Facebook</p>
<p>1: Scroll until all your friends are visible. To do this automatically, click 
  the start scrolling button. It will stop automatically when it reaches the end 
  of the list.</p>
<p><button id="startScrolling">Start scrolling</button></p>
<p>2: Once you have all your friends visible on the page, click to capture them.</p>
<p><button id="captureFriends">Capture Friends</button></p>
`;

  getByIdOrThrow(doc, "startScrolling").onclick = scrollToTheBottom;
  getByIdOrThrow(doc, "captureFriends").onclick = captureAndSaveFriends;
};

const removePopOver = (doc: Document) => {
  const container = doc.getElementById(POPOVER_DIV_ID);
  if (container !== null) {
    container.remove();
  }
};

const runLoop = async (doc: Document) => {
  const { facebookFriendsUrl } = await getState();

  if (typeof facebookFriendsUrl === "undefined") {
    return;
  }

  // TODO: Improve this check
  if (!document.location.href.startsWith(facebookFriendsUrl)) {
    removePopOver(doc);
    return;
  }
};

const start = async (doc: Document) => {
  globalThis.setInterval(() => {
    runLoop(doc);
  }, 1500);
};

globalThis.setTimeout(() => {
  start(globalThis.document);
}, 300);
