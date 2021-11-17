export const getByIdOrThrow = (doc: Document, id: string) => {
  const element = doc.getElementById(id);
  if (element === null) {
    throw new Error(`FATAL: Failed to get element with id ${id} #JRfO9v`);
  }
  return element;
};
