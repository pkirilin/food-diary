import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/pages/ui/SettingsPage';

export const Route = createFileRoute('/_app/settings')({
  staticData: {
    appBar: { variant: 'menu', title: 'Settings' },
  },
  component: SettingsPage,
});
