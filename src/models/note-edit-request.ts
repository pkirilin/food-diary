import { NoteCreateEdit } from './note-create-edit';

export interface NoteEditRequest extends NoteCreateEdit {
  id: number;
}
