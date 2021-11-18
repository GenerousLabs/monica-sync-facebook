/** How long should we wait after we first get rate limited? */
export const STARTING_RATE_LIMIT_SECONDS = 7;
/** How much should we increase the rate limit delay each time? */
export const RATE_LIMIT_DELAY_BACKUP_MULTIPLIER = 3;

/** After scraping an about page, always wait this long before the random wait*/
export const ABOUT_PAGE_FIXED_DELAY_MS = 2e3;
/** After we scrape an about page, how long do we wait before moving onto the
 * next page */
export const ABOUT_PAGE_RANDOM_DELAY_MS = 5e3;

/** After we navigate to a profile page, always wait this long before the random
 * delay */
export const PROFILE_PAGE_FIXED_DELAY_MS = 2e3;
/** After we navigate to a profile page, how long do we wait before moving onto
 * the next page */
export const PROFILE_PAGE_RANDOM_DELAY_MS = 6e3;

/** When we start a sccraping run, always wait this long */
export const GETTING_STARTED_FIXED_DELAY_MS = 2e3;
/** When we start a scraping run, how long do we wait before moving onto the
 * next page */
export const GETTING_STARTED_RANDOM_DELAY_MS = 1e3;
