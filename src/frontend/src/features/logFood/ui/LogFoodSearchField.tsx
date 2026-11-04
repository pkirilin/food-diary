import SearchIcon from '@mui/icons-material/Search';
import { Box, InputBase, alpha } from '@mui/material';
import { type FC, useState } from 'react';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
}

export const LogFoodSearchField: FC<Props> = ({ query, onQueryChange }) => {
  // The query arrives asynchronously, so the field shows what was typed until the query catches up
  const [typedQuery, setTypedQuery] = useState(query);
  const [receivedQuery, setReceivedQuery] = useState(query);

  if (query !== receivedQuery) {
    setReceivedQuery(query);
    setTypedQuery(query);
  }

  return (
    <Box
      role="search"
      sx={theme => ({
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        borderRadius: 1,
        bgcolor: alpha(theme.palette.common.white, 0.15),
        '&:hover, &:focus-within': {
          bgcolor: alpha(theme.palette.common.white, 0.25),
        },
      })}
    >
      <SearchIcon />
      <InputBase
        autoFocus
        fullWidth
        type="search"
        placeholder="Search products"
        value={typedQuery}
        onChange={event => {
          setTypedQuery(event.target.value);
          onQueryChange(event.target.value);
        }}
        slotProps={{ input: { 'aria-label': 'Search products' } }}
        sx={{ color: 'inherit', py: 0.5 }}
      />
    </Box>
  );
};
