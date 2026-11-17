import { landingMarkdown, semesterMarkdown } from '../lib/content.js';

export const GET = () =>
  new Response(`${landingMarkdown()}\n---\n\n${semesterMarkdown()}`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
