// Builds src/data/header-facts.json: the small per-page facts shown in the
// card on the right of inner-page headers (PageHeader -> HeaderFacts).
// Numbers are counted from the hosted content (src/content/published-store.json)
// and the static data files, so they stay correct whenever content changes.
// Runs automatically before every build ("prebuild" in package.json).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(path.join(root, p), 'utf8');
const store = JSON.parse(read('src/content/published-store.json')).store;
const live = (k) => (store[k] || []).filter((x) => !x.status || !/draft|archiv|hidden/i.test(x.status));

const projects = live('projects');
const byCat = (c) => projects.filter((p) => p.category === c).length;
const people = live('teamMembers');
const LEADER = new Set(['leadership', 'board', 'advisory']);
const team = people.filter((m) => !LEADER.has(m.category));
const teamDepts = new Set(team.map((m) => m.category)).size;
const board = people.filter((m) => m.category === 'board').length;
const advisory = people.filter((m) => m.category === 'advisory').length;
const clients = (store.clients || []).length;
const news = live('news');
const tenders = store.tenders || [];
// same grouping as the Tenders page: corrigenda are listed under their notice
const isCorr = (t) => /^corrigendum/i.test((t.title || '').trim());
const notices = tenders.filter((t) => !isCorr(t));
const openTenders = notices.filter((t) => !/closed|archiv|cancel/i.test(t.status || '')).length;
const verticals = live('verticals').length;
const celServices = live('celServices').map((s) => s.title).filter(Boolean);

const media = read('src/data/media.ts');
const countIn = (name) => {
  const m = media.match(new RegExp(`${name}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`));
  return m ? (m[1].match(/^\s{2}\{/gm) || []).length : 0;
};
const events = countIn('cubeEvents');
const reports = countIn('cubeReports');

const about = read('src/data/about.ts');
const missionStr = (about.match(/mission:\s*"([^"]*)"/) || [])[1] || '';
const missionPoints = missionStr.split(';').map((s) => s.trim()).filter(Boolean).length;
const objectives = ((about.match(/objectives:\s*\[([\s\S]*?)\]/) || [])[1] || '').split(/",\s*"/).filter((s) => s.trim()).length;
const coreValues = (about.match(/title:\s*"/g) || []).length;

const contact = read('src/data/contact.ts');
const phone = (contact.match(/phone:\s*'([^']+)'/) || [])[1];
const email = (contact.match(/email:\s*'([^']+)'/) || [])[1];

// news dates are stored as dd/mm/yyyy (also accept ISO)
const toTime = (d) => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(d || '');
  return m ? Date.UTC(+m[3], +m[2] - 1, +m[1]) : Date.parse(d);
};
const latestT = Math.max(...news.map((x) => toTime(x.date || x.publishedDate)).filter((t) => !Number.isNaN(t)));
const latestNews = Number.isFinite(latestT) ? new Date(latestT).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';

const n = (x) => String(x);
const facts = {
  '/about': { label: 'CUBE at a glance', rows: [['Established', 'May 2017'], ['Verticals', n(verticals)], ['Projects', n(projects.length)], ['Team', n(team.length)]] },
  '/about/vision-mission': { label: 'Guiding statements', rows: [['Mission goals', n(missionPoints)], ['Objectives', n(objectives)], ['Core values', n(coreValues)]] },
  '/about/objectives': { label: 'Objectives', rows: [['Objectives', n(objectives)], ['Verticals', n(verticals)], ['Established', 'May 2017']] },
  '/about/core-values': { label: 'Core values', rows: [['Values', n(coreValues)], ['Mission goals', n(missionPoints)], ['Objectives', n(objectives)]] },
  '/about/chairman-message': { label: 'Chairman', rows: [['Name', 'Prof. V Kamakoti'], ['Role', 'Director, IIT Madras'], ['Governing Body', `${board} members`]] },
  '/about/ceo-message': { label: 'Chief Executive Officer', rows: [['Name', 'L. Padmanaban'], ['Service', 'Major General (Retd.)'], ['Team', `${team.length} members`]] },
  '/about/advisory-panel': { label: 'IIT Madras advisory panel', rows: [['Faculty', n(advisory)], ['Departments', 'Civil, Mechanical, Aerospace, Chemical']] },
  '/about/team': { label: 'Our team', rows: [['Members', n(team.length)], ['Departments', n(teamDepts)], ['Building & Construction', n(team.filter((m) => m.category === 'Building & Construction').length)]] },
  '/about/clients': { label: 'Clients', rows: [['Clients', n(clients)], ['Projects', n(projects.length)], ['Verticals', n(verticals)]] },
  '/contact': { label: 'Reach CUBE', rows: [['Phone', phone], ['Email', email], ['Office', 'IIT Madras Research Park, Chennai']] },
  '/life-at-cube': { label: 'Life at CUBE', rows: [['Team', `${team.length} members`], ['Workplace', 'IIT Madras Research Park'], ['On site', 'CUBE Environmental Laboratory']] },
  '/media': { label: 'Media centre', rows: [['News stories', n(news.length)], ['Events', n(events)], ['Reports', n(reports)]] },
  '/media/news': { label: 'News', rows: [['Stories', n(news.length)], ...(latestNews ? [['Latest', latestNews]] : [])] },
  '/media/events': { label: 'Events', rows: [['Events', n(events)], ['News stories', n(news.length)]] },
  '/media/gallery': { label: 'Gallery', rows: [['Albums', 'Projects, Laboratory, Workplace'], ['Projects', n(projects.length)]] },
  '/media/publications': { label: 'Reports', rows: [['Reports', n(reports)], ['News stories', n(news.length)]] },
  '/projects': { label: 'Portfolio', rows: [['Projects', n(projects.length)], ['Building & Construction', n(byCat('Building & Construction'))], ['Environment & Sustainability', n(byCat('Environment & Sustainability'))], ['Urban Planning & Transportation', n(byCat('Urban Planning & Transportation'))]] },
  '/verticals': { label: 'Verticals', rows: [['Verticals', n(verticals)], ['Projects', n(projects.length)], ['Clients', n(clients)]] },
  '/tenders': { label: 'Tenders', rows: [['Tender notices', n(notices.length)], ['Corrigenda', n(tenders.length - notices.length)], ['Open now', n(openTenders)], ['Queries', email]] },
  '/cel': { label: 'CUBE Environmental Laboratory', rows: [['Testing', celServices.join(', ') || 'Water, Wastewater, Solid Waste'], ['Located at', 'CUBE office, IIT Madras Research Park']] },
};
facts['/media/news/[slug]'] = facts['/media/news'];

writeFileSync(path.join(root, 'src/data/header-facts.json'), JSON.stringify(facts, null, 2) + '\n');
console.log(`header-facts: ${Object.keys(facts).length} pages`);
