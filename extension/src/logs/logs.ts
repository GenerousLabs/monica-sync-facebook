import { getLog } from "../shared.log";
import { getByIdOrThrow } from "../utils";

const startLog = async (doc: Document) => {
  const log = await getLog();
  getByIdOrThrow(doc, "log").innerText = log;
};

globalThis.setTimeout(() => {
  startLog(globalThis.document);
}, 300);
