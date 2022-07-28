export function initMocks() {
  if (process.env.REACT_APP_MSW_ENABLED === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { worker } = require('./browser');
    worker.start();
  }
}
