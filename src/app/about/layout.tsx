import React from 'react';

// Title and description for /about (a client page); sub-pages set their own.
export const metadata = {
  title: 'About | CUBE IIT Madras',
  description:
    'Centre for Urbanization, Buildings & Environment (CUBE) has been raised by IIT Madras and Government of Tamil Nadu as an Applied Research, Technology and Consultancy Centre.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
