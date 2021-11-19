import { emptyLogs, getLog } from "../shared.log";
import { getByIdOrThrow } from "../utils";

const startLog = async (doc: Document) => {
  const log = await getLog();
  getByIdOrThrow(doc, "log").innerText = log;
  getByIdOrThrow(doc, "deleteAllLogs").onclick = () => {
    if (
      !globalThis.confirm(
        "Are you sure you want to PERMANENTLY delete all the logs? #Vk10na"
      )
    ) {
      return;
    }
    emptyLogs();
    getByIdOrThrow(doc, "log").innerText = "";
  };
};

globalThis.setTimeout(() => {
  startLog(globalThis.document);
}, 300);
