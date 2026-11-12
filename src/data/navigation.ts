import { NavigationItem } from '@/types';

/**
 * Site menu — same order, grouping and labels as the original cubeiitm.org:
 * Home · About · Projects · Verticals · CEL · Media · Tenders · Careers · Contact Us.
 * Each About item points to its own page, as on the original.
 */
export const navigationItems: NavigationItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'About',
    href: '/about',
    children: [
      { title: 'About CUBE', href: '/about' },
      { title: 'Vision & Mission', href: '/about/vision-mission' },
      { title: 'Objectives', href: '/about/objectives' },
      { title: 'Core Values', href: '/about/core-values' },
      { title: 'Chairman Message', href: '/about/chairman-message' },
      { title: 'CEO Message', href: '/about/ceo-message' },
      { title: 'Board Members', href: '/about/board-members' },
      { title: 'IIT Advisory Panel', href: '/about/advisory-panel' },
      { title: 'Our Team', href: '/about/team' },
      { title: 'Our Clients', href: '/about/clients' },
    ],
  },
  {
    title: 'Projects',
    href: '/projects',
  },
  {
    title: 'Verticals',
    href: '/verticals',
    children: [
      { title: 'Building & Construction', href: '/verticals/building-construction' },
      { title: 'Environment & Sustainability', href: '/verticals/environment-sustainability' },
      { title: 'Smart City', href: '/verticals/smart-cities' },
      { title: 'Urban Planning & Transportation', href: '/verticals/urban-planning-transportation' },
    ],
  },
  {
    title: 'CEL',
    href: '/cel',
  },
  {
    title: 'Media',
    href: '/media',
    children: [
      { title: 'News', href: '/media/news' },
      { title: 'Gallery', href: '/media/gallery' },
      { title: 'Events', href: '/media/events' },
      { title: 'Publications', href: '/media/publications' },
      { title: 'Life at CUBE', href: '/life-at-cube' },
    ],
  },
  {
    title: 'Tenders',
    href: '/tenders',
  },
  {
    title: 'Careers',
    href: '/careers',
    badge: 'Hiring',
  },
];
