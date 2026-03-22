import { Task, GitCommit, ActivityLog } from './types';

const now = new Date();
const min = (n: number) => new Date(now.getTime() - n * 60000);

export const initialTasks: Task[] = [
  {
    id: '1',
    text: 'Add hero section with headline',
    status: 'done',
    summary: 'Created a hero section with a large headline "Build Without Limits", a subtitle, and a CTA button. Used flexbox centering with responsive padding.',
    whatsNext: 'Consider adding a background image or gradient to the hero.',
    timestamp: min(2),
    linesWritten: 18,
  },
  {
    id: '2',
    text: 'Make navbar dark with white text',
    status: 'done',
    summary: 'Updated the navbar background to bg-gray-900, text to white, and hover states to gray-300. Added a subtle bottom border.',
    whatsNext: 'Add mobile hamburger menu for responsive design.',
    timestamp: min(5),
    linesWritten: 12,
  },
  {
    id: '3',
    text: 'Add a navbar with Home About Contact',
    status: 'done',
    summary: 'Created a responsive navbar component with three navigation links: Home, About, and Contact. Includes the site logo on the left.',
    whatsNext: 'Style the navbar and add active link highlighting.',
    timestamp: min(8),
    linesWritten: 17,
  },
];

export const initialCommits: GitCommit[] = [
  { hash: 'a3f7c21', message: 'feat: add hero section with headline and CTA' },
  { hash: 'e1b4d09', message: 'style: dark navbar with white text' },
  { hash: '7c2e5f3', message: 'feat: add navbar with Home About Contact links' },
  { hash: 'b8a1c44', message: 'chore: initial project setup' },
  { hash: 'f0d2e77', message: 'docs: add README with project overview' },
];

export const initialActivityLogs: ActivityLog[] = [
  { id: 'l1', message: 'Committed: feat: add hero section with headline and CTA', type: 'done', timestamp: min(2) },
  { id: 'l2', message: 'Writing 2 files...', type: 'processing', timestamp: min(2.1) },
  { id: 'l3', message: 'Asking Claude to add hero section...', type: 'processing', timestamp: min(2.3) },
  { id: 'l4', message: 'Transcribing voice...', type: 'processing', timestamp: min(2.5) },
  { id: 'l5', message: 'Received task: "Add hero section with headline"', type: 'received', timestamp: min(2.6) },
  { id: 'l6', message: 'Committed: style: dark navbar with white text', type: 'done', timestamp: min(5) },
  { id: 'l7', message: 'Writing 1 file...', type: 'processing', timestamp: min(5.1) },
  { id: 'l8', message: 'Received task: "Make navbar dark with white text"', type: 'received', timestamp: min(5.3) },
  { id: 'l9', message: 'Committed: feat: add navbar with Home About Contact links', type: 'done', timestamp: min(8) },
  { id: 'l10', message: 'Writing 3 files...', type: 'processing', timestamp: min(8.1) },
  { id: 'l11', message: 'Received task: "Add a navbar with Home About Contact"', type: 'received', timestamp: min(8.3) },
];

const simulatedTasks = [
  { text: 'Add a footer with social media links', summary: 'Created a sticky footer with GitHub, Twitter, and LinkedIn icons. Centered layout with muted colors.', whatsNext: 'Add a newsletter signup form to the footer.', commit: 'feat: add footer with social links', lines: 22 },
  { text: 'Create a contact form with email and message fields', summary: 'Built a contact form with email input, textarea for messages, and a submit button. Includes basic validation.', whatsNext: 'Connect the form to an API endpoint.', commit: 'feat: add contact form component', lines: 34 },
  { text: 'Add a features grid with 3 cards', summary: 'Created a responsive 3-column grid with feature cards. Each card has an icon, title, and description.', whatsNext: 'Add hover animations to the feature cards.', commit: 'feat: add features grid section', lines: 28 },
];

let simIndex = 0;
export function getNextSimulatedTask() {
  const t = simulatedTasks[simIndex % simulatedTasks.length];
  simIndex++;
  return t;
}
