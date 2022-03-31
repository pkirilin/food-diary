import { rest } from 'msw';

import create from './create';
import server, { api } from './server';

export default create;

export { create, server, api, rest };
