import { initializeDb } from './db';

export function initMocks() {
  if (process.env.REACT_APP_MSW_ENABLED === 'true') {
    initializeDb();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { worker } = require('./browser');
    worker.start();
  }
}
