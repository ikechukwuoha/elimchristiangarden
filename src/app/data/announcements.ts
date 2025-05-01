import { Announcement } from '../../types';

// data/sermons.ts
import { Sermon } from '../../types';

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



export const sermons: Sermon[] = [
  {
    id: 1,
    title: 'Finding Peace in Troubled Times',
    description: 'In this powerful message, Pastor James shares biblical principles for finding God\'s peace even in the midst of life\'s storms.',
    date: 'April 20, 2025',
    audioUrl: '/sermons/finding-peace.mp3',
    thumbnail: '/images/sermon1.jpg',
    preacher: {
      id: 1,
      name: 'Pastor James Wilson',
      image: '/images/pastor1.jpg',
      title: 'Senior Pastor'
    },
    series: 'Peace of God',
    popular: true
  },
  {
    id: 2,
    title: 'The Power of Faith',
    description: 'Discover how faith can move mountains in your life and bring breakthrough in seemingly impossible situations.',
    date: 'April 13, 2025',
    audioUrl: '/sermons/power-of-faith.mp3',
    thumbnail: '/images/sermon2.jpg',
    preacher: {
      id: 1,
      name: 'Pastor James Wilson',
      image: '/images/pastor1.jpg',
      title: 'Senior Pastor'
    },
    series: 'Faith Journey',
    popular: true
  },
  {
    id: 3,
    title: 'Living a Life of Purpose',
    description: 'Pastor Sarah explores how to discover and fulfill God\'s unique purpose for your life in this inspiring message.',
    date: 'April 6, 2025',
    audioUrl: '/sermons/purpose-life.mp3',
    thumbnail: '/images/sermon3.jpg',
    preacher: {
      id: 2,
      name: 'Pastor Sarah Johnson',
      image: '/images/pastor2.jpg',
      title: 'Associate Pastor'
    },
    series: 'Purposeful Living'
  },
  {
    id: 4,
    title: 'The Heart of Worship',
    description: 'Learn what true worship means and how it can transform your relationship with God.',
    date: 'March 30, 2025',
    audioUrl: '/sermons/heart-worship.mp3',
    thumbnail: '/images/sermon4.jpg',
    preacher: {
      id: 2,
      name: 'Pastor Sarah Johnson',
      image: '/images/pastor2.jpg',
      title: 'Associate Pastor'
    },
    series: 'Worship Series'
  },
  {
    id: 5,
    title: 'Building Strong Families',
    description: 'Biblical principles for creating healthy, strong family relationships that honor God.',
    date: 'March 23, 2025',
    audioUrl: '/sermons/strong-families.mp3',
    thumbnail: '/images/sermon5.jpg',
    preacher: {
      id: 1,
      name: 'Pastor James Wilson',
      image: '/images/pastor1.jpg',
      title: 'Senior Pastor'
    },
    series: 'Family Matters'
  },
  {
    id: 6,
    title: 'Overcoming Anxiety',
    description: 'Practical biblical strategies for overcoming anxiety and experiencing God\'s peace.',
    date: 'March 16, 2025',
    audioUrl: '/sermons/overcoming-anxiety.mp3',
    thumbnail: '/images/sermon6.jpg',
    preacher: {
      id: 3,
      name: 'Pastor Michael Thompson',
      image: '/images/pastor3.jpg',
      title: 'Youth Pastor'
    },
    series: 'Peace of God',
    popular: true
  },
  {
    id: 7,
    title: 'The Power of Prayer',
    description: 'Discover how prayer can transform your life and deepen your relationship with God.',
    date: 'March 9, 2025',
    audioUrl: '/sermons/power-prayer.mp3',
    thumbnail: '/images/sermon7.jpg',
    preacher: {
      id: 1,
      name: 'Pastor James Wilson',
      image: '/images/pastor1.jpg',
      title: 'Senior Pastor'
    },
    series: 'Prayer Warriors'
  },
  {
    id: 8,
    title: 'Walking in God\'s Grace',
    description: 'Understanding the amazing grace of God and how it impacts every area of our lives.',
    date: 'March 2, 2025',
    audioUrl: '/sermons/gods-grace.mp3',
    thumbnail: '/images/sermon8.jpg',
    preacher: {
      id: 2,
      name: 'Pastor Sarah Johnson',
      image: '/images/pastor2.jpg',
      title: 'Associate Pastor'
    },
    series: 'Grace Journey'
  }
];