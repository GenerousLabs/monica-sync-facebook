const LOG_KEY = "__log";

export const getLog = async () => {
  const result = await browser.storage.local.get(LOG_KEY);
  if (typeof result[LOG_KEY] === "string") {
    return result[LOG_KEY] as string;
  }
  return "";
};

const setLog = async (log: string) => {
  const set = { [LOG_KEY]: log };
  await browser.storage.local.set(set);
};

export const addLogLine = async (line: string) => {
  try {
    const log = await getLog();
    const date = new Date();
    const dateString = date.toISOString();
    const newLog = `${log}\n${dateString} - ${line}`;
    await setLog(newLog);
  } catch (error) {
    console.error("Error in addLogLine. #XKkLFD", error);
  }
};

export const emptyLogs = async () => {
  await setLog("");
};
