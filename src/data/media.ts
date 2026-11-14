// Events and reports for the Media section, taken from the original CUBE
// website (https://cubeiitm.org/news.html). Nothing here is invented: dates,
// places and descriptions come from the original posts; fields the original
// does not state (location, attendance) are left out rather than guessed.

const NEWS_IMG = '/images/media/news/original/';

export interface CubeEvent {
  title: string;
  date: string;
  location?: string;
  category: string;
  image: string;
  description: string;
  highlights?: string[];
}

export const cubeEvents: CubeEvent[] = [
  {
    title: '7th Annual General Meeting',
    date: '', // not stated on the original site
    location: 'CUBE',
    category: 'Annual General Meeting',
    image: NEWS_IMG + 'newsnew4.jpg',
    description:
      'The 7th Annual General Meeting at CUBE marked a significant milestone, with board members recognizing the team’s exceptional dedication and impact.',
  },
  {
    title: 'Bhoomi Pooja for New Residential Complex',
    date: '09/02/2025',
    location: 'Jigani Village, Bangalore',
    category: 'Project Milestone',
    image: NEWS_IMG + 'newsnew3.jpg',
    description:
      'Bhoomi Pooja for a new residential complex in Jigani Village, Bangalore in association with UDPL, marking the commencement of the project. CUBE’s team will carry out design and engineering, oversee construction and provide supervision.',
  },
  {
    title: 'MoU Signing with Uppuluri Developers Private Limited (UDPL)',
    date: '04/02/2025',
    category: 'MoU Signing',
    image: NEWS_IMG + 'newsnew2.jpg',
    description:
      'The MoU for the development of a residential complex in Bangalore was formally signed by Major General Padmanaban Lakshmanan, CEO of CUBE, and Mr. Manilal Chalasani, Director of UDPL.',
  },
  {
    title: 'Regional Conclave of Namma School Namma Ooru Palli (NSNOP)',
    date: '21/01/2025',
    location: 'Regional Conclave of NSNOP',
    category: 'Conclave',
    image: NEWS_IMG + 'newsnew.jpg',
    description:
      'CUBE presented its report on projects completed under the NSNOP initiative of the Government of Tamil Nadu to Thiru Anbil Mahesh Poyyamozhi, Hon\'ble Minister for School Education.',
  },
];

