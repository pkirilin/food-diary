import { Box } from '@mui/material';
import { type FC } from 'react';
import { LogFoodSearchResults, MealDraftTray } from '@/features/logFood';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { PageContainer } from '@/shared/ui';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateProduct: (name: string) => void;
  onOpenProduct: (productId: number) => void;
  onLogged: (date: string) => void;
}

export const LogFoodSearchPage: FC<Props> = ({
  query,
  onQueryChange,
  onCreateProduct,
  onOpenProduct,
  onLogged,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: {
        xs: `calc(100dvh - ${APP_BAR_HEIGHT_XS}px)`,
        sm: `calc(100dvh - ${APP_BAR_HEIGHT_SM}px)`,
      },
    }}
  >
    <PageContainer sx={{ flexGrow: 1 }}>
      <LogFoodSearchResults
        query={query}
        onQueryChange={onQueryChange}
        onCreateProduct={onCreateProduct}
        onOpenProduct={onOpenProduct}
      />
    </PageContainer>
    <MealDraftTray onOpenProduct={onOpenProduct} onLogged={onLogged} />
  </Box>
);
