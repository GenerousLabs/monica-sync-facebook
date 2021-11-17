const FACEBOOK_FRIENDS_SITE = `https://m.facebook.com/`;

/**
 * Given a full URL, strip out only the parts we want, removing any tracking
 * parameters or other junk that Facebook adds to the URL.
 *
 * @param url The full URL from the current tab
 */
export const getSanitisedFriendsListUrl = (url: string) => {
  // Ensure we start with `https://mbasic.facebook.com/`
  if (!url.startsWith(FACEBOOK_FRIENDS_SITE)) {
    throw new Error("FATAL: Invalid friends URL #PUJg1z");
  }
  const withoutDomain = url.substr(FACEBOOK_FRIENDS_SITE.length);

  // If the url is `profile.php?` then we want the `id=000` and `v=friends`
  // parameters
  if (withoutDomain.substr(0, 12) === "profile.php?") {
    const id = withoutDomain.match(/id=[0-9]+/);
    if (id === null) {
      throw new Error("FATAL: Missing id=XXX in friends URL #GSQpyn");
    }

    if (withoutDomain.match(/v=friends/)) {
      throw new Error("FATAL: Missing v=friends in friends URL #3hnnJP");
    }

    // Put all the pieces back together again
    const url = `${FACEBOOK_FRIENDS_SITE}/profile.php?${id}&v=info`;

    return url;

    // The URL should be like `/user.name/friends/`
  } else {
    // NOTE: We have no leading slash here
    const address = withoutDomain.match(/[a-zA-Z0-9\.]+\/friends/);

    if (address === null) {
      throw new Error("FATAL: Invalid friends URL #lMjyRI");
    }

    // Put all the pieces back together again
    const url = `${FACEBOOK_FRIENDS_SITE}${address}`;

    return url;
  }
};
