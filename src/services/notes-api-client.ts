import { NoteCreateEdit, NotesSearchRequest } from '../models';
import { API_URL } from '../config';
import { NoteEditRequest } from '../models';

const notesApiUrl = `${API_URL}/v1/notes`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getNotesAsync = async (request: NotesSearchRequest): Promise<Response> => {
  return await fetch('/notes-list-data.json');
};

export const createNoteAsync = async (note: NoteCreateEdit): Promise<Response> => {
  return await fetch(notesApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
};

export const editNoteAsync = async ({ id, ...note }: NoteEditRequest): Promise<Response> => {
  return await fetch(`${notesApiUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
};

export const deleteNoteAsync = async (noteId: number): Promise<Response> => {
  return await fetch(`${notesApiUrl}/${noteId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
