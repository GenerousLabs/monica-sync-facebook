import { MONICA_FACEBOOK_NOTE_TITLE } from "../shared.constants";
import { FacebookFriend, MonicaFriend } from "../shared.types";
import {
  createMonicaNote,
  getMonicaNotes,
  MonicaParams,
  updateMonicaNote,
} from "./api";

const dataToNote = (data: Required<FacebookFriend>["tableData"]["data"]) => {
  const heading = MONICA_FACEBOOK_NOTE_TITLE + "\n\n";
  const lines = data.map(({ label, value }) => `${label}: ${value}`);
  const note = `${heading}${lines.join("\n")}`;
  return note;
};

export const updateMonicaFacebookNote = async ({
  monicaParams,
  monicaFriend,
  friend,
}: {
  monicaParams?: MonicaParams;
  monicaFriend: MonicaFriend;
  friend: FacebookFriend;
}) => {
  const { tableData } = friend;
  if (typeof tableData === "undefined") {
    return;
  }

  const notes = await getMonicaNotes({ monicaParams, monicaFriend });

  const note = notes.find((note) =>
    note.body.toLowerCase().startsWith(MONICA_FACEBOOK_NOTE_TITLE.toLowerCase())
  );

  const noteBody = dataToNote(tableData.data);

  if (typeof note === "undefined") {
    await createMonicaNote({
      monicaParams,
      monicaFriend,
      noteBody,
    });
    return;
  }

  if (note.body === noteBody) {
    return;
  }

  // TODO Allow the option to always create a new note instead of updating
  await updateMonicaNote({
    monicaParams,
    monicaFriend,
    noteId: note.id.toString(),
    noteBody,
  });
};
