import { Cirrus } from "@createdreamtech/cirrus";
import { SkyNote, SkyNoteTableName } from "./schema";
import * as datalog from "@createdreamtech/datalog";

export const getAllNotes = async (db: Cirrus) => {
  const SkyNoteTable = await db.getTable(SkyNoteTableName, SkyNote);
  const q = datalog.query<{ id: number; note: string; __origin: string }>(
    ({ id, note, __origin }) => {
      SkyNoteTable({ note, id, __origin });
    }
  );
  return q.view().readAllData();
};
