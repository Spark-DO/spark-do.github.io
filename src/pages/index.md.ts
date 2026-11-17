import { landingMarkdown } from '../lib/content.js';

export const GET = () => new Response(landingMarkdown(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
