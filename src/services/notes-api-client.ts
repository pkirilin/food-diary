import { NoteCreateEdit, NotesForMealRequest } from '../models';
import { API_URL } from '../config';
import { NoteEditRequest } from '../models';

const notesApiUrl = `${API_URL}/v1/notes`;

export const getNotesForPageAsync = async (pageId: number): Promise<Response> => {
  return await fetch(`${notesApiUrl}?pageId=${pageId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getNotesForMealAsync = async ({ pageId, mealType }: NotesForMealRequest): Promise<Response> => {
  return await fetch(`${notesApiUrl}/meal?pageId=${pageId}&mealType=${mealType}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
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
