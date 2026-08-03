import type { APIRoute } from 'astro';

import { buildRssFeed } from '../../lib/feeds.ts';

export const GET: APIRoute = () => buildRssFeed('nl');
