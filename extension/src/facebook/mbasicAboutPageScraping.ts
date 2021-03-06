import { FacebookFriend } from "../shared.types";
import { setFriendTableData } from "./friends";

export const scrapeTableData = (doc: Document) => {
  const tables = doc.getElementsByTagName("table");
  const tablesArray = Array.from(tables);
  const dataTables = tablesArray.filter(
    (table) => table.cellSpacing === "0" && table.cellPadding === "0"
  );
  const dataPairs = dataTables.map((table) => {
    const { innerText } = table;
    const [label, , value] = innerText.split("\n");
    return { label, value };
  });
  return dataPairs;
};

export const captureTableData = async ({
  friend,
  document,
}: {
  friend: FacebookFriend;
  document: Document;
}) => {
  const data = scrapeTableData(document);
  const updatedFriend = await setFriendTableData({ friend, data });
  return updatedFriend;
};
