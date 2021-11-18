import { FacebookFriend } from "../shared.types";
import { trimTrailingAndLeadingSlash, trimTrailingSlash } from "../utils";

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

export const isProfilePage = ({
  friend,
  location,
}: {
  friend: FacebookFriend;
  location: Location;
}) => {
  const { search } = location;
  const { profileUrl } = friend;

  const pathname = trimTrailingAndLeadingSlash(location.pathname);

  // NOTE: This will match for username URLs like `/chmac` but not for profiles
  // without a username like `/profile.php?id=0000`
  if (pathname === profileUrl) {
    return true;
  }

  // URLs like `profile.php?id=00000`
  if (pathname === "profile.php") {
    // NOTE: A URL of this type will be `profile.php?id=000` without `v=info`
    if (searchContainsProfileId(search) && !searchMatchesAboutPage(search)) {
      return true;
    }
  }

  return false;
};

export const isAboutPage = ({
  friend,
  location,
}: {
  friend: FacebookFriend;
  location: Location;
}) => {
  const { profileUrl } = friend;
  const { search } = location;

  const pathname = trimTrailingAndLeadingSlash(location.pathname);

  // URLs like `profile.php?id=00000`
  // NOTE: A URL of this type will be `profile.php?id=000` WITH `v=info`
  if (
    pathname === "profile.php" &&
    searchContainsProfileId(search) &&
    searchMatchesAboutPage(search)
  ) {
    return true;
  }

  // URLs that end in `/about`, note that this does not guarantee that the URL
  // represents an individual, pages also have a `/about` subpage.
  if (pathname.startsWith(profileUrl) && pathname.match(/about$/)) {
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
