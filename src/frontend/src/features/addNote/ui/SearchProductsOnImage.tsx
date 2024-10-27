import AddIcon from '@mui/icons-material/Add';
import {
  CircularProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Stack } from '@mui/system';
import { useEffect, type FC, useCallback, type MouseEventHandler } from 'react';
import { useAppDispatch } from '@/app/store';
import { noteApi } from '@/entities/note';
import { parseClientError } from '@/shared/api';
import { Button } from '@/shared/ui';
import { actions, type Image } from '../model';

interface Props {
  image: Image;
}

export const SearchProductsOnImage: FC<Props> = ({ image }) => {
  const [recognize, recognizeResult] = noteApi.useRecognizeMutation();
  const dispatch = useAppDispatch();

  const sendRecognizeRequest = useCallback(async (): Promise<void> => {
    const formData = new FormData();
    formData.append('files', new File([image.base64], image.name));
    await recognize(formData);
  }, [image.base64, image.name, recognize]);

  useEffect(() => {
    // TODO: prevent duplicate request after product discarded
    sendRecognizeRequest();
  }, [sendRecognizeRequest]);

  if (recognizeResult.isLoading) {
    return (
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (recognizeResult.isError) {
    const error = parseClientError(recognizeResult.error);

    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={sendRecognizeRequest}>
            Retry
          </Button>
        }
      >
        <AlertTitle>{error.title}</AlertTitle>
        {error.message}
      </Alert>
    );
  }

  const note = recognizeResult.data?.notes?.at(0);

  if (!note?.product) {
    return <Alert severity="warning">No food found on your image</Alert>;
  }

  const productName = note.product.name.trim();

  const handleAddProduct: MouseEventHandler = () =>
    dispatch(
      actions.productDraftSaved({
        name: productName,
        defaultQuantity: note.quantity,
        caloriesCost: note.product.caloriesCost,
        category: null,
      }),
    );

  return (
    <List>
      <ListItem disableGutters disablePadding>
        <ListItemButton onClick={handleAddProduct}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText>{`Add "${productName}"`}</ListItemText>
        </ListItemButton>
      </ListItem>
    </List>
  );
};
