import { llmsTxt } from '../lib/content.js';

export const GET = () => new Response(llmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
