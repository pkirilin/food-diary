import { Card, CardHeader, CardActions, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Category } from '../types';

type CategoryListItemNewProps = {
  category: Category;
};

function getCountProductsText(countProducts: number) {
  if (countProducts === 0) {
    return 'no products';
  }

  const suffix = countProducts > 1 ? 'products' : 'product';

  return `${countProducts} ${suffix}`;
}

export default function CategoryListItemNew({ category }: CategoryListItemNewProps) {
  const countProductsText = getCountProductsText(category.countProducts);

  return (
    <Card>
      <CardHeader
        sx={{ paddingBottom: 0 }}
        title={category.name}
        subheader={countProductsText}
        subheaderTypographyProps={{
          'aria-label': `There are ${countProductsText} in ${category.name}`,
        }}
      />
      <CardActions sx={{ margin: '0 0.5rem' }}>
        <Button startIcon={<EditIcon />}>Edit</Button>
        <Button color="error" startIcon={<DeleteIcon />}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}
