import * as datalog from "@createdreamtech/datalog";
export const SkyNoteTableName = "SkyNote";
export const SkyNote = {
  id: datalog.NumberType,
  note: datalog.StringType,
};
