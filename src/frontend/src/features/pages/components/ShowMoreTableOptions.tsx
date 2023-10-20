import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ShowMoreIcon from '@mui/icons-material/MoreVert';
import { Divider, IconButton, Menu } from '@mui/material';
import React from 'react';
import { DEMO_MODE_ENABLED } from 'src/config';
import ExportPagesMenuItem from './ExportPagesMenuItem';
import ImportPagesMenuItem from './ImportPagesMenuItem';

const ShowMoreTableOptions: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const isOpened = Boolean(anchorEl);

  function handleMenuOpen(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  return (
    <React.Fragment>
      <IconButton
        size="large"
        id="show-more-button"
        aria-label="Show more options"
        aria-controls={isOpened ? 'show-more-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={isOpened ? 'true' : undefined}
        onClick={handleMenuOpen}
      >
        <ShowMoreIcon />
      </IconButton>
      <Menu
        keepMounted
        id="show-more-menu"
        aria-labelledby="show-more-button"
        anchorEl={anchorEl}
        open={isOpened}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: '240px',
            maxWidth: '100%',
          },
        }}
      >
        <ImportPagesMenuItem isDisabled={DEMO_MODE_ENABLED} onMenuClose={handleMenuClose}>
          Import from JSON
        </ImportPagesMenuItem>
        <Divider />
        <ExportPagesMenuItem
          isDisabled={DEMO_MODE_ENABLED}
          format="json"
          icon={<DataObjectIcon />}
          onMenuClose={handleMenuClose}
        >
          Export to JSON
        </ExportPagesMenuItem>
        <ExportPagesMenuItem
          isDisabled={DEMO_MODE_ENABLED}
          format="google docs"
          icon={<AddToDriveIcon />}
          onMenuClose={handleMenuClose}
        >
          Export to Google Docs
        </ExportPagesMenuItem>
      </Menu>
    </React.Fragment>
  );
};

export default ShowMoreTableOptions;
