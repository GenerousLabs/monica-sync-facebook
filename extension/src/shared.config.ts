/** How long should we wait after we first get rate limited? */
const STARTING_RATE_LIMIT_SECONDS = 7;
/** How much should we increase the rate limit delay each time? */
const RATE_LIMIT_DELAY_BACKUP_MULTIPLIER = 3;

/** After we scrape an about page, how long do we wait before moving onto the
 * next page */
const ABOUT_PAGE_RANDOM_DELAY_MS = 5e3;
/** After scraping an about page, always wait this long */
const ABOUT_PAGE_FIXED_DELAY_MS = 2e3;

/** After we scrape an about page, how long do we wait before moving onto the
 * next page */
const PROFILE_PAGE_RANDOM_DELAY_MS = 6e3;
/** After scraping an about page, always wait this long */
const PROFILE_PAGE_FIXED_DELAY_MS = 2e3;

/** After we scrape an about page, how long do we wait before moving onto the
 * next page */
const GETTING_STARTED_RANDOM_DELAY_MS = 1e3;
/** After scraping an about page, always wait this long */
const GETTING_STARTED_FIXED_DELAY_MS = 2e3;
