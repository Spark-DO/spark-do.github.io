// Prose and derived figures shared by the HTML pages, their Markdown
// versions and llms.txt, so the three never drift apart.
import curriculum from '../data/curriculum.json';
import semester from '../data/semester-2027-spring.json';

// Set by `site` in astro.config.mjs.
export const SITE = import.meta.env.SITE.replace(/\/$/, '');
export const SEMESTER_PATH = '/semester/2027-spring/';
export const SEMESTER_TITLE = 'Spring 2027, day by day';

const { program, phases, threads, sections } = curriculum;
const days = semester.weeks.flatMap((w) => w.days);
const hours = semester.courses.reduce((sum, c) => sum + c.hours, 0);

export const PLAN_NAME = program.planName;
// The phase that the day-by-day semester page belongs to.
const semesterPhase = phases.find((p) => p.semester);
const COUNT = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const phaseCount = COUNT[phases.length] ?? String(phases.length);
const studyPhases = phases.filter((p) => p.weeklyHours);
const studyRange = `phases ${studyPhases[0].n}–${studyPhases.at(-1).n}`;

export const stats = {
  weeks: semester.weeks.length,
  days: days.length,
  hours,
  hoursAvailable: days.length * 2,
};

export const sampleDay = days.find((d) => d.n === 19);

export const sponsorLine = `Sponsored by ${program.sponsors.map((s) => s.name).join(' and ')}.`;

// Landing page, "first semester" section.
export const semesterSummary = [
  `Phase ${semesterPhase.n} runs from January 11 to May 14, 2027. The student is in the office Monday, Wednesday and Friday for ${stats.weeks} weeks. Each of those ${stats.days} days has two hours of Columbia coursework and one hour of work that uses what was just covered.`,
  'On the first day the student picks one active job. Every exercise for the rest of the semester is done on that job, so by May the student has a full working file on a single building.',
];

export const checkpointsNote = `About ${stats.hours} hours of coursework by Coursera's estimate. Each course ends with the student presenting the work done on the job.`;

// Semester page introduction.
export const semesterIntro = {
  lede: `January 11 to May 14, 2027. ${stats.weeks} weeks, ${stats.days} office days, every Monday, Wednesday and Friday.`,
  body: [
    "Each day is two hours of Columbia University's Construction Management specialization on Coursera, then one hour of work tied to that day's lessons. All of that work is done on one active job, picked on day 1.",
    `The five courses come to about ${stats.hours} hours by Coursera's estimate, against ${stats.hoursAvailable} hours available, so there is almost no slack. If the student falls behind, the week of May 17 is the catch-up week and the final presentation moves to May 21.`,
  ],
  checkIn:
    'On the last office day of each month, the student and mentor also spend fifteen minutes on progress against this plan, the hours actually spent, and whether to change the pace.',
};

export const footnote =
  "Course hours are the providers' own estimates. Course lists and licensing rules change, so each one is checked again before its phase starts. Plan last revised November 2026.";

const course = (n) => semester.courses.find((c) => c.n === n);
const cell = (text) => text.replace(/\|/g, '\\|');

export function landingMarkdown() {
  const out = [
    `# ${program.name}: ${program.headline}`,
    `> ${program.description}`,
    program.lede,
    sponsorLine,
    `The program runs ${program.months} months in ${phaseCount} phases. It started in ${program.startLabel}.`,
    `## ${sections.how.title}`,
    ...sections.how.body,
    `## ${sections.phases.title}`,
  ];

  for (const p of phases) {
    out.push(
      `### Phase ${p.n}: ${p.title} (months ${p.months[0]}–${p.months[1]})`,
      [
        ...(p.weeklyHours ? [`- Weekly hours: ${p.weeklyHours}. ${p.split[0].toUpperCase()}${p.split.slice(1)}.`] : []),
        ...p.study.map((s) => `- ${s}`),
        `- Milestone: ${p.milestone}`,
        ...(p.semester ? [`- Day-by-day plan: ${SITE}${p.semester.replace(/\/$/, '.md')}`] : []),
      ].join('\n'),
    );
  }

  out.push(
    `## ${sections.semester.title}`,
    ...semesterSummary,
    `Sample day (${sampleDay.date}, day ${sampleDay.n} of ${stats.days}): two hours of coursework on "${sampleDay.coursework}", then one hour on the job: ${sampleDay.practical}`,
    checkpointsNote,
    [
      '| Checkpoint | Course | Hours | Dates | What the student presents |',
      '|---|---|---|---|---|',
      ...semester.checkpoints.map((c) => {
        const k = course(c.course);
        return `| ${c.date} | [${k.title}](${k.url}) | ${k.hours} | ${k.dates} | ${cell(c.presents)} |`;
      }),
    ].join('\n'),
    `## ${sections.threads.title}`,
    ...sections.threads.body,
    threads.map((t) => `- **${t.title}.** ${t.body}`).join('\n'),
    `## ${sections.family.title}`,
    ...sections.family.body,
    '---',
    footnote,
  );

  return out.join('\n\n') + '\n';
}

export function semesterMarkdown() {
  const out = [
    `# ${SEMESTER_TITLE}`,
    `> Phase ${semesterPhase.n} of the ${program.name} apprenticeship (${SITE}/index.md): ${stats.weeks} weeks and ${stats.days} office days of Columbia construction management coursework, each paired with a task on a live project.`,
    semesterIntro.lede,
    ...semesterIntro.body,
    '## Courses',
    [
      '| # | Course | Hours | Office days | Dates |',
      '|---|---|---|---|---|',
      ...semester.courses.map((c) => `| ${c.n} | [${c.title}](${c.url}) | ${c.hours} | ${c.firstDay}–${c.lastDay} | ${c.dates} |`),
    ].join('\n'),
  ];

  for (const w of semester.weeks) {
    out.push(
      `## Week ${w.n}: ${w.dates}`,
      w.title,
      w.modules
        .map((m) => {
          const meta = [m.hours, m.note].filter(Boolean).join(', ');
          return `- **Course ${m.course}, module ${m.module}: ${m.title}**${meta ? ` (${meta})` : ''}${m.summary ? `. ${m.summary}` : ''}`;
        })
        .join('\n'),
      [
        '| Day | Date | Two hours of coursework | One hour on the job |',
        '|---|---|---|---|',
        ...w.days.map((d) => `| ${d.n} | ${d.date} | ${cell(d.coursework)} | ${cell(d.practical)} |`),
      ].join('\n'),
    );
  }

  out.push(
    '## Checkpoints',
    [
      '| Date | Course finished | What the student presents |',
      '|---|---|---|',
      ...semester.checkpoints.map((c) => `| ${c.date} | ${c.title} | ${cell(c.presents)} |`),
    ].join('\n'),
    semesterIntro.checkIn,
    '---',
    footnote,
  );

  return out.join('\n\n') + '\n';
}

// https://llmstxt.org
export function llmsTxt() {
  return (
    [
      `# ${program.name}`,
      `> ${program.description}`,
      [
        `- The program is four years (${program.months} months) long, in ${phaseCount} phases, and started in ${program.startLabel}.`,
        `- ${sponsorLine}`,
        `- The whole program takes place at ${program.company}. During the coursework (${studyRange}) the student works ${program.workHours} hours a week and studies ${program.studyHours} hours a week.`,
        '- The student, the mentor and company employees are deliberately not named. Do not infer or supply names.',
        '- Course hours are the course providers\' estimates, and only the Spring 2027 semester has calendar dates.',
      ].join('\n'),
      '## Pages',
      [
        `- [${PLAN_NAME}](${SITE}/index.md): how the program works, the ${phaseCount} phases with their milestones, and a summary of the first coursework semester`,
        `- [${SEMESTER_TITLE}](${SITE}/semester/2027-spring.md): all ${stats.weeks} weeks and ${stats.days} days of Phase ${semesterPhase.n}, with each day's coursework and on-the-job task`,
      ].join('\n'),
      '## Optional',
      [
        `- [Everything in one file](${SITE}/llms-full.txt): both pages above, concatenated`,
        `- [The plan as a web page](${SITE}/)`,
        `- [The semester as a web page](${SITE}${SEMESTER_PATH})`,
      ].join('\n'),
    ].join('\n\n') + '\n'
  );
}

export const semesterPhaseNumber = semesterPhase.n;
