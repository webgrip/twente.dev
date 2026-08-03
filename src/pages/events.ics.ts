import type { APIRoute } from 'astro';

import { buildEventsIcs } from '../lib/feeds.ts';

export const GET: APIRoute = () => buildEventsIcs();
