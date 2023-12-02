import { db } from '../db';
import data from './notes.data.json';

export { handlers as notesHandlers } from './notes.handlers';

export const fillNotes = (): void => {
  data.forEach(note => {
    db.note.create(note);
  });
};
