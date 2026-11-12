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

export interface CubeReport {
  title: string;
  category: string;
  year: string;
  authors: string;
  description: string;
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

export const cubeReports: CubeReport[] = [
  {
    title: 'Sustainable Mining Policy and Natural Resources Management Plan',
    category: 'Policy',
    year: '2023',
    authors: 'CUBE for the Department of Geology and Mining, Government of Tamil Nadu',
    description:
      'Final draft presented to the Additional Chief Secretary to Government (FAC), Natural Resources Department, Government of Tamil Nadu on 3rd July 2023.',
  },
  {
    title:
      'Inception Report: Study on Impact of Urban Development on Coastal Aquifer and Measures for Protection (Kottivakkam to Mahabalipuram)',
    category: 'Urban Planning',
    year: '2023',
    authors: 'CUBE for CMDA',
    description:
      'Presented to the Technical Committee presided by the Member Secretary, CMDA, for the villages between the Bay of Bengal and the Buckingham Canal.',
  },
  {
    title: 'Report on Projects under the Namma School Namma Ooru Palli (NSNOP) Initiative',
    category: 'CSR',
    year: '2025',
    authors: 'CUBE',
    description:
      'Classroom construction and furniture provisioning for government schools in Manojpatti and Poovathur under CSR initiatives; presented to the Hon\'ble Minister for School Education, Government of Tamil Nadu.',
  },
];
