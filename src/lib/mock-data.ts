import { Project, GitCommit, ActivityLog } from './types';

const now = new Date();
const min = (n: number) => new Date(now.getTime() - n * 60000);

export const initialProjects: Project[] = [
  {
    id: 'p1',
    title: 'Portfolio Website',
    createdAt: min(10),
    tasks: [
      {
        id: '1',
        text: 'Add hero section with headline',
        status: 'done',
        summary: 'Created a hero section with a large headline "Build Without Limits", a subtitle, and a CTA button.',
        whatsNext: 'Consider adding a background image or gradient to the hero.',
        timestamp: min(2),
        linesWritten: 18,
        commitHash: 'a3f7c21',
        commitMessage: 'feat: add hero section with headline and CTA',
        logs: [
          { id: '1-d', message: 'Committed: feat: add hero section', type: 'done', timestamp: min(2) },
          { id: '1-w', message: 'Writing 2 files...', type: 'processing', timestamp: min(2.1) },
          { id: '1-r', message: 'Received task', type: 'received', timestamp: min(2.6) },
        ],
      },
      {
        id: '2',
        text: 'Make navbar dark with white text',
        status: 'done',
        summary: 'Updated navbar background to dark, text to white, and hover states to gray-300.',
        whatsNext: 'Add mobile hamburger menu.',
        timestamp: min(5),
        linesWritten: 12,
        commitHash: 'e1b4d09',
        commitMessage: 'style: dark navbar with white text',
        logs: [
          { id: '2-d', message: 'Committed: style: dark navbar', type: 'done', timestamp: min(5) },
          { id: '2-r', message: 'Received task', type: 'received', timestamp: min(5.3) },
        ],
      },
    ],
  },
  {
    id: 'p2',
    title: 'E-Commerce Dashboard',
    createdAt: min(30),
    tasks: [
      {
        id: '3',
        text: 'Add a navbar with Home About Contact',
        status: 'done',
        summary: 'Created a responsive navbar with three navigation links.',
        whatsNext: 'Style the navbar and add active link highlighting.',
        timestamp: min(8),
        linesWritten: 17,
        commitHash: '7c2e5f3',
        commitMessage: 'feat: add navbar with links',
        logs: [
          { id: '3-d', message: 'Committed: feat: add navbar', type: 'done', timestamp: min(8) },
          { id: '3-r', message: 'Received task', type: 'received', timestamp: min(8.3) },
        ],
      },
    ],
  },
];

export const initialCommits: GitCommit[] = [
  { hash: 'a3f7c21', message: 'feat: add hero section with headline and CTA' },
  { hash: 'e1b4d09', message: 'style: dark navbar with white text' },
  { hash: '7c2e5f3', message: 'feat: add navbar with Home About Contact links' },
  { hash: 'b8a1c44', message: 'chore: initial project setup' },
  { hash: 'f0d2e77', message: 'docs: add README with project overview' },
];

export const initialActivityLogs: ActivityLog[] = [];

const simulatedTasks = [
  { text: 'Add a footer with social media links', summary: 'Created a sticky footer with GitHub, Twitter, and LinkedIn icons.', whatsNext: 'Add a newsletter signup form.', commit: 'feat: add footer with social links', lines: 22 },
  { text: 'Create a contact form', summary: 'Built a contact form with email input, textarea, and submit button.', whatsNext: 'Connect the form to an API endpoint.', commit: 'feat: add contact form', lines: 34 },
  { text: 'Add a features grid with 3 cards', summary: 'Created a responsive 3-column grid with feature cards.', whatsNext: 'Add hover animations to the cards.', commit: 'feat: add features grid', lines: 28 },
];

let simIndex = 0;
export function getNextSimulatedTask() {
  const t = simulatedTasks[simIndex % simulatedTasks.length];
  simIndex++;
  return t;
}
