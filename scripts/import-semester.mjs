// Turns a semester plan written in Markdown (the private curriculum repo)
// into the JSON the site renders. Run: npm run import [-- path/to/semester.md]
//
// The source file is expected to have:
//   - a "Course calendar" table
//   - one "## Week N — dates · title" section per week, holding module
//     paragraphs and a day table
//   - a "## Checkpoints" table
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, process.argv[2] ?? '../curriculum/semester-2027-spring.md');
const year = Number(basename(source).match(/\d{4}/)?.[0]);
if (!year) throw new Error(`No year in file name: ${source}`);

const lines = readFileSync(source, 'utf8').split('\n');
const cells = (row) => row.split('|').slice(1, -1).map((c) => c.trim());
const isRow = (l) => l.startsWith('|') && !/^\|\s*-+/.test(l);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isoDate(label) {
  const [weekday, month, day] = label.split(' ');
  const date = new Date(Date.UTC(year, MONTHS.indexOf(month), Number(day)));
  if (WEEKDAYS[date.getUTCDay()] !== weekday) {
    throw new Error(`${label} ${year} is a ${WEEKDAYS[date.getUTCDay()]}, not a ${weekday}`);
  }
  return date.toISOString().slice(0, 10);
}

// Course calendar
const courses = [];
for (const line of lines) {
  const m = line.match(/^\|\s*(\d+)\.\s*\[(.+?)\]\((.+?)\)\s*\|/);
  if (!m) continue;
  const [, hours, days, dates, checkpoint] = cells(line);
  const [firstDay, lastDay] = days.split('–').map(Number);
  courses.push({ n: Number(m[1]), title: m[2], url: m[3], hours: Number(hours), firstDay, lastDay, dates, checkpoint });
}
const courseForDay = (n) => courses.find((c) => n >= c.firstDay && n <= c.lastDay)?.n;

// Weeks
const weeks = [];
let week = null;
let section = null;
const checkpoints = [];

for (const line of lines) {
  const heading = line.match(/^## (.+)$/);
  if (heading) {
    const w = heading[1].match(/^Week (\d+) — (.+?) · (.+)$/);
    section = w ? 'week' : heading[1];
    if (w) {
      week = { n: Number(w[1]), dates: w[2], title: w[3], modules: [], days: [] };
      weeks.push(week);
    }
    continue;
  }

  if (section === 'week') {
    const mod = line.match(/^\*\*\[(.+?)\]\(modules\.md#c(\d+)-m(\d+)\)\*\*\s*(.*)$/);
    if (mod) {
      const label = mod[1].replace(/\.$/, '');
      const parts = label.match(/^(Module \d+(?: \(Course \d+\))?)(?: — (.+?))?(?: \((.+?)\))?$/);
      const note = parts?.[3] ?? null;
      const isHours = note && /\d/.test(note);
      week.modules.push({
        course: Number(mod[2]),
        module: Number(mod[3]),
        title: parts?.[2] ?? null,
        hours: isHours ? note.split(',')[0] : null,
        note: isHours ? (note.split(',')[1]?.trim() ?? null) : note,
        summary: mod[4] || null,
      });
      continue;
    }
    if (isRow(line) && /^\|\s*\d+\s*\|/.test(line)) {
      const [n, date, coursework, practical] = cells(line);
      week.days.push({
        n: Number(n),
        date,
        iso: isoDate(date),
        course: courseForDay(Number(n)),
        coursework,
        practical,
      });
    }
    continue;
  }

  if (section === 'Checkpoints' && isRow(line) && !line.includes('Course done')) {
    const [date, course, presents] = cells(line);
    checkpoints.push({ date, iso: isoDate(date), course: parseInt(course, 10), title: course.replace(/^\d+\.\s*/, ''), presents });
  }
}

// A module that carries over ("Module 7 (finish)") is listed without its title.
const titles = new Map();
for (const m of weeks.flatMap((w) => w.modules)) {
  const key = `${m.course}-${m.module}`;
  if (m.title) titles.set(key, m.title);
  else m.title = titles.get(key) ?? null;
  if (!m.title) throw new Error(`No title for course ${m.course} module ${m.module}`);
}

// Sanity checks: the plan numbers days 1..N with three per week.
const days = weeks.flatMap((w) => w.days);
days.forEach((d, i) => {
  if (d.n !== i + 1) throw new Error(`Day numbering breaks at day ${d.n}`);
  if (!d.course) throw new Error(`Day ${d.n} is outside every course's range`);
});
for (const w of weeks) {
  if (w.days.length !== 3) throw new Error(`Week ${w.n} has ${w.days.length} days`);
  if (!w.modules.length) throw new Error(`Week ${w.n} has no modules`);
}
if (!courses.length || !checkpoints.length) throw new Error('Missing course calendar or checkpoints');

const out = resolve(root, 'src/data', basename(source).replace(/\.md$/, '.json'));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ year, courses, weeks, checkpoints }, null, 2) + '\n');
console.log(`${out}\n${courses.length} courses, ${weeks.length} weeks, ${days.length} days, ${checkpoints.length} checkpoints`);
