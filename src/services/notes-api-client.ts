/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { sleep } from './sleep';
import { NoteCreateEdit, NotesForMealRequest } from '../models';

export const getNotesForPageAsync = async (pageId: number): Promise<Response> => {
  return await fetch('/notes-for-page-data.json');
};

export const getNotesForMealAsync = async (request: NotesForMealRequest): Promise<Response> => {
  return await fetch('/notes-for-meal-data.json');
};

export const createNoteAsync = async (note: NoteCreateEdit): Promise<Response> => {
  return await fetch('');
};
