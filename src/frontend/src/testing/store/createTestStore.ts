import { configureAppStore } from 'src/store';

export default function createTestStore(): ReturnType<typeof configureAppStore> {
  return configureAppStore();
}
