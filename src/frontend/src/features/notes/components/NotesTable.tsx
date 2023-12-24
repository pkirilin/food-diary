import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { type FC, useEffect, useState } from 'react';
import { productsApi } from 'src/features/products';
import { useAppDispatch, useAppSelector, useRouterId } from 'src/hooks';
import { type MealType, type NoteCreateEdit } from '../models';
import { createNote, getNotes } from '../thunks';
import NoteInputDialog from './NoteInputDialog';
import NotesTableRow from './NotesTableRow';

interface NotesTableProps {
  mealType: MealType;
}

const NotesTable: FC<NotesTableProps> = ({ mealType }: NotesTableProps) => {
  const pageId = useRouterId('id');

  const noteItems = useAppSelector(state =>
    state.notes.noteItems.filter(n => n.mealType === mealType),
  );

  const maxDisplayOrderForNotesGroup = useAppSelector(state =>
    state.notes.noteItems
      .filter(note => note.mealType === mealType)
      .reduce(
        (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
        -1,
      ),
  );

  const status = useAppSelector(state => state.notes.operationStatusesByMealType[mealType]);
  const [getProducts, getProductsRequest] = productsApi.useLazyGetProductSelectOptionsQuery();

  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === 'succeeded') {
      setIsDialogOpened(false);

      void dispatch(
        getNotes({
          pageId,
          mealType,
        }),
      );
    }
  }, [dispatch, mealType, pageId, status]);

  const handleDialogOpen = (): void => {
    setIsDialogOpened(true);
  };

  const handleDialogClose = (): void => {
    setIsDialogOpened(false);
  };

  const handleAddNote = (note: NoteCreateEdit): void => {
    void dispatch(
      createNote({
        mealType,
        note,
      }),
    );
  };

  const handleLoadProducts = async (): Promise<void> => {
    await getProducts();
  };

  return (
    <TableContainer>
      <NoteInputDialog
        title="New note"
        submitText="Create"
        isOpened={isDialogOpened}
        mealType={mealType}
        product={null}
        products={getProductsRequest.data ?? []}
        productsLoaded={!getProductsRequest.isUninitialized}
        productsLoading={getProductsRequest.isLoading}
        onLoadProducts={handleLoadProducts}
        quantity={100}
        pageId={pageId}
        displayOrder={maxDisplayOrderForNotesGroup + 1}
        onClose={handleDialogClose}
        onSubmit={handleAddNote}
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Calories</TableCell>
            <TableCell padding="checkbox" />
          </TableRow>
        </TableHead>
        <TableBody>
          {noteItems.map(note => (
            <NotesTableRow
              key={note.id}
              note={note}
              products={getProductsRequest.data ?? []}
              productsLoaded={!getProductsRequest.isUninitialized}
              productsLoading={getProductsRequest.isLoading}
              onLoadProducts={handleLoadProducts}
            />
          ))}
        </TableBody>
      </Table>
      <Box mt={1}>
        <Button
          variant="text"
          size="medium"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleDialogOpen}
        >
          Add note
        </Button>
      </Box>
    </TableContainer>
  );
};

export default NotesTable;
