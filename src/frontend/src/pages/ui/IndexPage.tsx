import { Alert, Box, Slide, Stack, useScrollTrigger } from '@mui/material';
import { type FC } from 'react';
import { type LoaderFunction, useLoaderData } from 'react-router';
import { store } from '@/app/store';
import { noteApi, noteLib, noteModel } from '@/entities/note';
import { productModel } from '@/entities/product';
import { SelectDate } from '@/features/note/selectDate';
import { MSW_ENABLED } from '@/shared/config';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { dateLib } from '@/shared/lib';
import { PageContainer } from '@/shared/ui';
import { MealsList, toOptionalNutritionValues } from '@/widgets/MealsList';
import { type NavigationLoaderData } from '@/widgets/Navigation';
import {
  NutritionSummaryWidget,
  NutritionSummaryWidgetBar,
} from '@/widgets/NutritionSummaryWidget';

interface LoaderData extends NavigationLoaderData {
  date: string;
}

const getFallbackDate = (): string =>
  MSW_ENABLED ? '2023-10-19' : dateLib.formatToISOStringWithoutTime(new Date());

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? getFallbackDate();
  const notesQueryPromise = store.dispatch(noteApi.endpoints.notes.initiate({ date }));

  try {
    await notesQueryPromise;

    return {
      date,
      navigation: {
        title: <SelectDate currentDate={new Date(date)} />,
      },
    } satisfies LoaderData;
  } finally {
    notesQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => {
  const { date } = useLoaderData();
  const { data: notes } = noteLib.useNotes(date);
  const nutritionValues = noteModel.calculateNutritionValues(notes);

  const hasMissingNutritionValues = notes
    .map(note => toOptionalNutritionValues(note.product))
    .some(productModel.hasMissingNutritionValues);

  const scrolled = useScrollTrigger({
    threshold: 180,
    disableHysteresis: true,
  });

  return (
    <Box>
      <Slide in={scrolled} direction="down">
        <Box
          position="fixed"
          top={{ xs: APP_BAR_HEIGHT_XS, sm: APP_BAR_HEIGHT_SM }}
          bgcolor={theme => theme.palette.background.paper}
          boxShadow={theme => theme.shadows[2]}
          zIndex={theme => theme.zIndex.appBar - 1}
          overflow={['auto', 'hidden']}
          width="100%"
        >
          <NutritionSummaryWidgetBar nutritionValues={nutritionValues} />
        </Box>
      </Slide>
      <PageContainer>
        <Stack spacing={3} pb={4}>
          <Stack spacing={{ xs: 2, sm: 3 }}>
            {hasMissingNutritionValues && (
              <Alert severity="warning">Some nutrition values are missing</Alert>
            )}
            <NutritionSummaryWidget nutritionValues={nutritionValues} />
          </Stack>
          <MealsList date={date} />
        </Stack>
      </PageContainer>
    </Box>
  );
};
