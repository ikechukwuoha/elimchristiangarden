import { Announcement } from '../../types';

export const announcements: Announcement[] = [
  {
    id: 1,
    title: 'Annual Church Picnic',
    description: 'Join us for our annual church picnic at Memorial Park. Food, games, and fellowship for the whole family!',
    date: 'May 15, 2025',
    image: '/images/picnic.jpg',
    link: '#'
  },
  {
    id: 2,
    title: 'Youth Camp Registration',
    description: 'Registration is now open for our summer youth camp. Don\'t miss this life-changing experience!',
    date: 'June 1-7, 2025',
    image: '/images/youth-camp.jpg',
    link: '#'
  },
  {
    id: 3,
    title: 'Weekly Bible Study',
    description: 'Join us every Wednesday at 7:00 PM for our in-depth Bible study on the book of Romans.',
    date: 'Every Wednesday',
    image: '/images/bible-study.jpg',
    link: '#'
  }
];
