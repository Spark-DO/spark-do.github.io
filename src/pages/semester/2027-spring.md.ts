import { semesterMarkdown } from '../../lib/content.js';

export const GET = () => new Response(semesterMarkdown(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
