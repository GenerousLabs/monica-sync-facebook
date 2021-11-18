const trimTrailingSlash = (input: string) => {
  if (input.substr(-1) === "/") {
    return input.substr(0, input.length - 1);
  }
  return input;
};

const searchContainsProfileId = (search: string) => {
  if (search.match(/id=[0-9]+/)) {
    return true;
  }
  return false;
};

const searchMatchesAboutPage = (search: string) => {
  if (search.match(/v=info/)) {
    return true;
  }
  return false;
};

export const isProfilePage = (location: Location) => {
  const { search } = location;

  const pathname = trimTrailingSlash(location.pathname);

  // URLs like `/profile.php?id=00000`
  if (pathname === "/profile.php") {
    // NOTE: A URL of this type will be `profile.php?id=000` without `v=info`
    if (searchContainsProfileId(search) && !searchMatchesAboutPage(search)) {
      return true;
    }
    // URLs like `/user.id` without any trailing parts (like `/user.id/about`)
  } else if (pathname.match(/^\/[0-9a-zA-Z\.]+$/)) {
    return true;
  }
  return false;
};

export const isAboutPage = (location: Location) => {
  const { search } = location;

  const pathname = trimTrailingSlash(location.pathname);

  // URLs like `/profile.php?id=00000`
  if (pathname === "/profile.php") {
    // NOTE: A URL of this type will be `profile.php?id=000` WITH `v=info`
    if (searchContainsProfileId(search) && searchMatchesAboutPage(search)) {
      return true;
    }
    // URLs that end in `/about`, note that this does not guarantee that the URL
    // represents an individual, pages also have a `/about` subpage.
  } else if (pathname.match(/about$/)) {
    return true;
  }

  return false;
};

const findAboutLink = (doc: Document) => {
  const aTags = doc.getElementsByTagName("a");
  const aTagsArray = Array.from(aTags);
  for (const aTag of aTagsArray) {
    if (aTag.innerText === "About") {
      return aTag;
    }
  }
  return;
};

export const clickAboutLink = (doc: Document) => {
  const link = findAboutLink(doc);
  if (typeof link === "undefined") {
    throw new Error("Could not find about link #0P7HXm");
  }
  link.click();
};
