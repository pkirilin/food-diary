import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { type FC, type ReactElement } from 'react';
import { AppLinearProgress } from 'src/components';
import { type Product } from '../../types';
import ProductsTableRow from '../ProductsTableRow';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  checkedIds: number[];
  onCheckedChange: (products: Product[], newCheckedIds: number[]) => void;
}

const ProductsTable: FC<ProductsTableProps> = ({
  products,
  isLoading,
  checkedIds,
  onCheckedChange,
}) => {
  const allProductsChecked = products.length > 0 && products.length === checkedIds.length;

  const handleCheckedIdsChange = (): void => {
    onCheckedChange(products, checkedIds);
  };

  const renderRows = (): ReactElement => {
    if (products.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} align="center">
            <Typography color="textSecondary">No products found</Typography>
          </TableCell>
        </TableRow>
      );
    }

    return (
      <>
        {products.map(product => (
          <ProductsTableRow key={product.id} product={product} />
        ))}
      </>
    );
  };

  return (
    <TableContainer sx={{ position: 'relative' }}>
      {isLoading && <AppLinearProgress />}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={checkedIds.length > 0 && checkedIds.length < products.length}
                checked={allProductsChecked}
                onChange={handleCheckedIdsChange}
                disabled={products.length === 0}
                inputProps={{
                  'aria-label': 'Select all',
                }}
              />
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell align="right">Calories cost</TableCell>
            <TableCell>Category</TableCell>
            <TableCell padding="checkbox" />
          </TableRow>
        </TableHead>
        <TableBody>{renderRows()}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;
