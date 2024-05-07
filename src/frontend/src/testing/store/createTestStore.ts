import { configureAppStore } from '@/app/store';

export default function createTestStore(): ReturnType<typeof configureAppStore> {
  return configureAppStore();
}
