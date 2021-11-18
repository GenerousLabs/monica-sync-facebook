import { MONICA_COUNTRIES } from "./shared.constants";

export const getByIdOrThrow = (doc: Document, id: string) => {
  const element = doc.getElementById(id);
  if (element === null) {
    throw new Error(`FATAL: Failed to get element with id ${id} #JRfO9v`);
  }
  return element;
};

export const randomDelay = (maxMs: number) => {
  const delay = Math.floor(Math.random() * maxMs);
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, delay);
  });
};

export const trimTrailingSlash = (input: string) => {
  if (input.substr(-1) === "/") {
    return input.substr(0, input.length - 1);
  }
  return input;
};

export const trimLeadingSlash = (input: string) => {
  if (input.substr(0, 1) === "/") {
    return input.substr(1);
  }
  return input;
};

export const trimTrailingAndLeadingSlash = (input: string) => {
  return trimLeadingSlash(trimTrailingSlash(input));
};

export const getMonicaCountryCode = (countryName: string) => {
  const countries = Object.entries(MONICA_COUNTRIES);
  const country = countries.find(
    ([, { name }]) => name.toLowerCase() === countryName.toLowerCase()
  );
  if (typeof country === "undefined") {
    return;
  }
  const [, data] = country;
  const { id } = data;
  return id;
};
