import { getState, setMonicaUrlAndToken } from "../state";
import { getByIdOrThrow } from "../utils";

const saveOptions = async (doc: Document) => {
  const monicaApiUrl = (getByIdOrThrow(doc, "monicaApiUrl") as HTMLInputElement)
    .value;
  const monicaApiToken = (
    getByIdOrThrow(doc, "monicaApiToken") as HTMLInputElement
  ).value;
  await setMonicaUrlAndToken({ monicaApiUrl, monicaApiToken });
  globalThis.alert("Saved. #wwVtQo");
};

const loadOptions = async () => {
  const { monicaApiUrl, monicaApiToken } = await getState();

  if (
    typeof monicaApiUrl === "undefined" ||
    typeof monicaApiToken === "undefined"
  ) {
    return;
  }

  (
    getByIdOrThrow(globalThis.document, "monicaApiUrl") as HTMLInputElement
  ).value = monicaApiUrl;
  (
    getByIdOrThrow(globalThis.document, "monicaApiToken") as HTMLInputElement
  ).value = monicaApiToken;
};

document.addEventListener("DOMContentLoaded", loadOptions);

const optionsStart = async () => {
  const form = getByIdOrThrow(globalThis.document, "monicaForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveOptions(document);
  });
};

globalThis.setTimeout(() => {
  optionsStart();
}, 300);
