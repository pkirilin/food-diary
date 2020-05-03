import React from 'react';
import './NotesTableRow.scss';
import { NoteItem } from '../../models';
import { NotesTableRowStateToPropsMapResult, NotesTableRowDispatchToPropsMapResult } from './NotesTableRowConnected';
import Icon from '../Icon';
import { NotesOperationsActionTypes } from '../../action-types';
import { useIdFromRoute, useNoteInputDisabled } from '../../hooks';
import NotesTableRowEditableConnected from './NotesTableRowEditableConnected';

interface NotesTableRowProps extends NotesTableRowStateToPropsMapResult, NotesTableRowDispatchToPropsMapResult {
  note: NoteItem;
}

const NotesTableRow: React.FC<NotesTableRowProps> = ({
  note,
  editableNotesIds,
  mealOperationStatuses,
  isPageOperationInProcess,
  pagesFilter,
  setEditableForNote,
  deleteNote,
  getNotesForMeal,
  getPages,
}: NotesTableRowProps) => {
  const pageId = useIdFromRoute();

  const isNoteEditable = editableNotesIds.some(id => id === note.id);
  const isNoteInputDisabled = useNoteInputDisabled(mealOperationStatuses, note.mealType, isPageOperationInProcess);

  const handleEditIconClick = (): void => {
    setEditableForNote(note.id, true);
  };

  const handleDeleteIconClick = async (): Promise<void> => {
    const isDeleteConfirmed = window.confirm('Do you want to delete note?');

    if (isDeleteConfirmed) {
      const { type: deleteNoteActionType } = await deleteNote({
        id: note.id,
        mealType: note.mealType,
      });

      if (deleteNoteActionType === NotesOperationsActionTypes.DeleteSuccess) {
        await getNotesForMeal({
          pageId,
          mealType: note.mealType,
        });
        await getPages(pagesFilter);
      }
    }
  };

  if (isNoteEditable) {
    return <NotesTableRowEditableConnected note={note}></NotesTableRowEditableConnected>;
  }

  return (
    <tr>
      <td>{note.productName}</td>
      <td>{note.productQuantity}</td>
      <td>{note.calories}</td>
      <td>
        <Icon type="edit" size="small" disabled={isNoteInputDisabled} onClick={handleEditIconClick}></Icon>
      </td>
      <td>
        <Icon type="close" size="small" disabled={isNoteInputDisabled} onClick={handleDeleteIconClick}></Icon>
      </td>
    </tr>
  );
};

export default NotesTableRow;
