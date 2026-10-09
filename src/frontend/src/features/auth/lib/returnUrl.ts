import { z } from 'zod';

// Browsers read a leading `//` or `/\` as a URL on another host
const IN_APP_PATH = /^\/(?![/\\])/;

export const returnUrlSchema = z.string().regex(IN_APP_PATH).optional().catch(undefined);
