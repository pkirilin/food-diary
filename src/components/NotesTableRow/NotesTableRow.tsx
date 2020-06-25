import React from 'react';
import './NotesTableRow.scss';
import { NoteItem } from '../../models';
import { NotesTableRowStateToPropsMapResult, NotesTableRowDispatchToPropsMapResult } from './NotesTableRowConnected';
import { Icon } from '../__ui__';
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
  openConfirmationModal,
}: NotesTableRowProps) => {
  const pageId = useIdFromRoute();

  const isNoteEditable = editableNotesIds.some(id => id === note.id);
  const isNoteInputDisabled = useNoteInputDisabled(mealOperationStatuses, note.mealType, isPageOperationInProcess);

  const runDeleteNoteAsync = async (): Promise<void> => {
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
  };

  const handleEditIconClick = (): void => {
    setEditableForNote(note.id, true);
  };

  const handleDeleteIconClick = (): void => {
    openConfirmationModal(
      'Delete note',
      `Do you want to delete note ("${note.productName}", ${note.productQuantity} g, ${note.calories} cal)?`,
      () => {
        runDeleteNoteAsync();
      },
    );
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
        <Icon
          type="edit"
          size="small"
          title="Edit note"
          disabled={isNoteInputDisabled}
          onClick={handleEditIconClick}
        ></Icon>
      </td>
      <td>
        <Icon
          type="close"
          size="small"
          title="Delete note"
          disabled={isNoteInputDisabled}
          onClick={handleDeleteIconClick}
        ></Icon>
      </td>
    </tr>
  );
};

export default NotesTableRow;
