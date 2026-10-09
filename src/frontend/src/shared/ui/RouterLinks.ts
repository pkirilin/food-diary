import { IconButton, Link, ListItemButton } from '@mui/material';
import { createLink } from '@tanstack/react-router';

export const RouterLink = createLink(Link);

export const RouterListItemButton = createLink(ListItemButton);

export const RouterIconButton = createLink(IconButton);
