import React from 'react';
import './NotesTableRow.scss';
import { NoteItem } from '../../models';
import { NotesTableRowStateToPropsMapResult, NotesTableRowDispatchToPropsMapResult } from './NotesTableRowConnected';
import { Icon } from '../__ui__';
import { NotesOperationsActionTypes } from '../../action-types';
import { useIdFromRoute, useNoteInputDisabled, useHover } from '../../hooks';
import NoteInputConnected from '../NoteInput';

interface NotesTableRowProps extends NotesTableRowStateToPropsMapResult, NotesTableRowDispatchToPropsMapResult {
  note: NoteItem;
}

const NotesTableRow: React.FC<NotesTableRowProps> = ({
  note,
  mealOperationStatuses,
  isPageOperationInProcess,
  pagesFilter,
  deleteNote,
  getNotesForMeal,
  getPages,
  openModal,
  openConfirmationModal,
}: NotesTableRowProps) => {
  const pageId = useIdFromRoute();
  const isNoteInputDisabled = useNoteInputDisabled(mealOperationStatuses, note.mealType, isPageOperationInProcess);
  const [areRowIconsVisible, handleRowMouseEnter, handleRowMouseLeave] = useHover();

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
    openModal(
      'Edit note',
      <NoteInputConnected note={note} mealType={note.mealType} pageId={pageId}></NoteInputConnected>,
      {
        width: '35%',
      },
    );
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

  return (
    <tr onMouseEnter={handleRowMouseEnter} onMouseLeave={handleRowMouseLeave}>
      <td>{note.productName}</td>
      <td>{note.productQuantity}</td>
      <td>{note.calories}</td>
      {areRowIconsVisible ? (
        <React.Fragment>
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
        </React.Fragment>
      ) : (
        <React.Fragment>
          <td></td>
          <td></td>
        </React.Fragment>
      )}
    </tr>
  );
};

export default NotesTableRow;
