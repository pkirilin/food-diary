import { type FC } from 'react';
import { ok, withAuthStatusCheck } from '../lib';
import { PrivateLayout } from '@/widgets/layout';

export const loader = withAuthStatusCheck(() => ok());

export const Component: FC = () => <PrivateLayout>PageDetailPage</PrivateLayout>;
