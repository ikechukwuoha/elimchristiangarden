// app/data/sermons.js
export const sermons = [
    {
      id: '1',
      title: 'Walking in Faith: A Journey of Trust',
      description: 'In this powerful message, Pastor John explores how we can develop unwavering faith in times of uncertainty and challenges. Learn practical steps to trust Gods promises when life seems most unpredictable.',
      preacher: { 
        name: 'Rev. Emmanuel Olowononi', 
        image: '/images/pastors/seniorpastor.jpg',
        role: 'Senior Pastor'
      },
      date: '2025-04-20',
      audioUrl: '/sermons/walking-in-faith.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example1',
      imageUrl: '/images/sermons/sermon-placeholder.jpg',
      series: 'Faith Journey',
      duration: '42:18',
      scripture: 'Hebrews 11:1-6',
      tags: ['faith', 'trust', 'challenges', 'spiritual growth'],
      popular: true,
      downloadable: true
    },
    {
      id: '2',
      title: 'The Power of Prayer in Daily Life',
      description: 'Understanding how consistent prayer transforms our relationship with God and impacts every aspect of our daily lives. Pastor Sarah shares personal testimonies and biblical principles for developing a vibrant prayer life.',
      preacher: { 
        name: 'Pastor Sarah Johnson', 
        image: '/images/pastors/sarah-johnson.jpg',
        role: 'Prayer Ministry Leader'
      },
      date: '2025-04-13',
      audioUrl: '/sermons/power-of-prayer.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example2',
      imageUrl: '/images/sermons/sermon-placeholder.jpg',
      series: 'Prayer Warriors',
      duration: '38:45',
      scripture: 'Philippians 4:6-7, James 5:13-16',
      tags: ['prayer', 'spiritual disciplines', 'relationship with God'],
      popular: true,
      downloadable: true
    },
    {
      id: '3',
      title: 'Finding Peace in Chaos',
      description: 'Discovering God\'s perfect peace that surpasses all understanding even in life\'s most chaotic moments. This message offers biblical strategies for maintaining inner calm during external storms.',
      preacher: { 
        name: 'Rev. Emmanuel Olowononi', 
        image: '/images/pastors/seniorpastor.jpg',
        role: 'Senior Pastor'
      },
      date: '2025-04-06',
      audioUrl: '/sermons/peace-in-chaos.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example3',
      imageUrl: '/images/sermons/peace.jpg',
      series: 'Faith Journey',
      duration: '45:23',
      scripture: 'John 14:27, Philippians 4:7',
      tags: ['peace', 'anxiety', 'trust', 'mental health'],
      popular: true,
      downloadable: true
    },
    {
      id: '4',
      title: 'Kingdom Principles for Financial Stewardship',
      description: 'Biblical wisdom for managing finances God\'s way. Learn practical principles for budgeting, saving, giving, and investing that align with Scripture and honor God with your resources.',
      preacher: { 
        name: 'Pastor Michael Thompson', 
        image: '/images/pastors/michael-thompson.jpg',
        role: 'Teaching Pastor'
      },
      date: '2025-03-30',
      audioUrl: '/sermons/financial-stewardship.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example4',
      imageUrl: '/images/sermons/finances.jpg',
      series: 'Kingdom Living',
      duration: '51:07',
      scripture: 'Matthew 6:19-24, Proverbs 3:9-10',
      tags: ['finances', 'stewardship', 'giving', 'wisdom'],
      popular: false,
      downloadable: true
    },
    {
      id: '5',
      title: 'The Heart of Worship',
      description: 'Exploring what it means to worship God in spirit and truth. This message delves into the essence of authentic worship beyond music and Sunday services, emphasizing a lifestyle of reverence and surrender.',
      preacher: { 
        name: 'Pastor Grace Williams', 
        image: '/images/pastors/grace-williams.jpg',
        role: 'Worship Pastor'
      },
      date: '2025-03-23',
      audioUrl: '/sermons/heart-of-worship.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example5',
      imageUrl: '/images/sermons/worship.jpg',
      series: 'Spirit & Truth',
      duration: '39:52',
      scripture: 'John 4:23-24, Romans 12:1-2',
      tags: ['worship', 'spirituality', 'lifestyle', 'devotion'],
      popular: false,
      downloadable: true
    },
    {
      id: '6',
      title: 'Healing for the Broken-Hearted',
      description: 'God\'s promise of healing and restoration for those experiencing grief, loss, and heartbreak. Pastor Sarah shares powerful testimonies and biblical encouragement for the healing journey.',
      preacher: { 
        name: 'Pastor Sarah Johnson', 
        image: '/images/pastors/sarah-johnson.jpg',
        role: 'Prayer Ministry Leader'
      },
      date: '2025-03-16',
      audioUrl: '/sermons/healing-broken-hearts.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example6',
      imageUrl: '/images/sermons/sermon-placeholder.jpg',
      series: 'Restoration',
      duration: '47:19',
      scripture: 'Psalm 34:18, Isaiah 61:1-3',
      tags: ['healing', 'grief', 'emotional health', 'restoration'],
      popular: true,
      downloadable: true
    },
    {
      id: '7',
      title: 'Discipleship in the Digital Age',
      description: 'Navigating the challenges and opportunities of following Christ in an increasingly digital world. Learn to maintain spiritual disciplines and witness effectively in online spaces.',
      preacher: { 
        name: 'Pastor David Chen', 
        image: '/images/pastors/david-chen.jpg',
        role: 'Youth Pastor'
      },
      date: '2025-03-09',
      audioUrl: '/sermons/digital-discipleship.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example7',
      imageUrl: '/images/sermons/digital.jpg',
      series: 'Modern Faith',
      duration: '44:05',
      scripture: 'Matthew 28:19-20, 1 Corinthians 9:22-23',
      tags: ['discipleship', 'technology', 'evangelism', 'youth'],
      popular: false,
      downloadable: true
    },
    {
      id: '8',
      title: 'Unity in the Body of Christ',
      description: 'Exploring God\'s heart for unity among believers and practical ways to foster harmony in the church despite differences. This message emphasizes the power of Christian unity as a witness to the world.',
      preacher: { 
        name: 'Rev. Emmanuel Olowononi', 
        image: '/images/pastors/seniorpastor.jpg',
        role: 'Senior Pastor'
      },
      date: '2025-03-02',
      audioUrl: '/sermons/unity-body-christ.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example8',
      imageUrl: '/images/sermons/unity.jpg',
      series: 'Kingdom Living',
      duration: '40:37',
      scripture: 'Ephesians 4:1-6, John 17:20-23',
      tags: ['unity', 'community', 'church life', 'relationships'],
      popular: false,
      downloadable: true
    },
    {
      id: '9',
      title: 'The Character of Christ: Developing Humility',
      description: 'Examining the humility of Jesus and how we can cultivate this essential trait in our own lives. Learn how true humility leads to spiritual growth and healthy relationships.',
      preacher: { 
        name: 'Pastor Michael Thompson', 
        image: '/images/pastors/michael-thompson.jpg',
        role: 'Teaching Pastor'
      },
      date: '2025-02-23',
      audioUrl: '/sermons/character-humility.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example9',
      imageUrl: '/images/sermons/humility.jpg',
      series: 'Character of Christ',
      duration: '43:28',
      scripture: 'Philippians 2:1-11, 1 Peter 5:5-6',
      tags: ['character', 'humility', 'spiritual formation', 'Christ-likeness'],
      popular: false,
      downloadable: true
    },
    {
      id: '10',
      title: 'Spiritual Warfare: Standing Firm in Faith',
      description: 'Understanding the reality of spiritual battles and equipping believers with biblical strategies to stand firm against the enemy\'s schemes. This message provides practical tools for victory in Christ.',
      preacher: { 
        name: 'Pastor Samuel Okonkwo', 
        image: '/images/pastors/samuel-okonkwo.jpg',
        role: 'Associate Pastor'
      },
      date: '2025-02-16',
      audioUrl: '/sermons/spiritual-warfare.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example10',
      imageUrl: '/images/sermons/warfare.jpg',
      series: 'Battle Ready',
      duration: '49:56',
      scripture: 'Ephesians 6:10-18, 2 Corinthians 10:3-5',
      tags: ['spiritual warfare', 'faith', 'victory', 'prayer'],
      popular: true,
      downloadable: true
    },
    {
      id: '11',
      title: 'Marriage by Design: God\'s Blueprint for Relationships',
      description: 'Exploring God\'s original design for marriage and practical wisdom for building strong, Christ-centered relationships. This message offers biblical insights for singles, engaged couples, and married partners.',
      preacher: { 
        name: 'Rev. Emmanuel Olowononi', 
        image: '/images/pastors/seniorpastor.jpg',
        role: 'Senior Pastor'
      },
      date: '2025-02-09',
      audioUrl: '/sermons/marriage-blueprint.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example11',
      imageUrl: '/images/sermons/marriage.jpg',
      series: 'Family Matters',
      duration: '52:11',
      scripture: 'Ephesians 5:21-33, Genesis 2:18-25',
      tags: ['marriage', 'relationships', 'family', 'love'],
      popular: false,
      downloadable: true
    },
    {
      id: '12',
      title: 'Living with Eternal Perspective',
      description: 'How keeping eternity in view transforms our daily decisions, priorities, and attitude toward challenges. This message encourages believers to live with purpose and heaven-mindedness.',
      preacher: { 
        name: 'Pastor Grace Williams', 
        image: '/images/pastors/grace-williams.jpg',
        role: 'Worship Pastor'
      },
      date: '2025-02-02',
      audioUrl: '/sermons/eternal-perspective.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example12',
      imageUrl: '/images/sermons/eternity.jpg',
      series: 'Kingdom Living',
      duration: '41:45',
      scripture: 'Colossians 3:1-4, 2 Corinthians 4:16-18',
      tags: ['eternity', 'purpose', 'heaven', 'priorities'],
      popular: false,
      downloadable: true
    },
    {
      id: '13',
      title: 'The Gift of the Holy Spirit',
      description: 'Understanding the person and work of the Holy Spirit in the life of believers. Learn how to recognize and cooperate with the Spirit\'s guidance, empowerment, and fruit in your daily walk.',
      preacher: { 
        name: 'Pastor Sarah Johnson', 
        image: '/images/pastors/sarah-johnson.jpg',
        role: 'Prayer Ministry Leader'
      },
      date: '2025-01-26',
      audioUrl: '/sermons/holy-spirit.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example13',
      imageUrl: '/images/sermons/holy-spirit.jpg',
      series: 'Spirit & Truth',
      duration: '48:32',
      scripture: 'John 14:15-26, Acts 1:8, Galatians 5:22-25',
      tags: ['Holy Spirit', 'spiritual gifts', 'empowerment', 'fruit of the Spirit'],
      popular: true,
      downloadable: true
    },
    {
      id: '14',
      title: 'Navigating Seasons of Waiting',
      description: 'Biblical encouragement for times when God calls us to wait. This message explores how seasons of waiting develop character, deepen faith, and prepare us for God\'s purposes.',
      preacher: { 
        name: 'Pastor Michael Thompson', 
        image: '/images/pastors/michael-thompson.jpg',
        role: 'Teaching Pastor'
      },
      date: '2025-01-19',
      audioUrl: '/sermons/seasons-waiting.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example14',
      imageUrl: '/images/sermons/waiting.jpg',
      series: 'Seasons of Life',
      duration: '44:09',
      scripture: 'Isaiah 40:28-31, Psalm 27:13-14',
      tags: ['waiting', 'patience', 'trust', 'seasons'],
      popular: false,
      downloadable: true
    },
    {
      id: '15',
      title: 'Evangelism for Everyone: Sharing Your Faith',
      description: 'Practical guidance for sharing your faith naturally and effectively in everyday life. This message helps overcome common obstacles to evangelism and equips believers to share the gospel with confidence.',
      preacher: { 
        name: 'Pastor David Chen', 
        image: '/images/pastors/david-chen.jpg',
        role: 'Youth Pastor'
      },
      date: '2025-01-12',
      audioUrl: '/sermons/evangelism-everyone.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example15',
      imageUrl: '/images/sermons/evangelism.jpg',
      series: 'Great Commission',
      duration: '46:22',
      scripture: 'Matthew 28:18-20, Acts 1:8, 1 Peter 3:15',
      tags: ['evangelism', 'witness', 'gospel', 'outreach'],
      popular: false,
      downloadable: true
    },
    {
      id: '16',
      title: 'Parenting with Grace and Truth',
      description: 'Biblical wisdom for raising children in a challenging culture. This message offers practical guidance for nurturing faith and character while navigating modern parenting challenges.',
      preacher: { 
        name: 'Rev. Emmanuel Olowononi', 
        image: '/images/pastors/seniorpastor.jpg',
        role: 'Senior Pastor'
      },
      date: '2025-01-05',
      audioUrl: '/sermons/parenting-grace-truth.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example16',
      imageUrl: '/images/sermons/parenting.jpg',
      series: 'Family Matters',
      duration: '50:17',
      scripture: 'Deuteronomy 6:4-9, Ephesians 6:1-4',
      tags: ['parenting', 'family', 'children', 'discipleship'],
      popular: true,
      downloadable: true
    },
    {
      id: '17',
      title: 'The Beatitudes: Keys to Kingdom Living',
      description: 'Exploring Jesus\' revolutionary teaching in the Sermon on the Mount. This message unpacks the blessings promised to those who embody the counter-cultural values of God\'s kingdom.',
      preacher: { 
        name: 'Pastor Samuel Okonkwo', 
        image: '/images/pastors/samuel-okonkwo.jpg',
        role: 'Associate Pastor'
      },
      date: '2024-12-29',
      audioUrl: '/sermons/beatitudes.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example17',
      imageUrl: '/images/sermons/beatitudes.jpg',
      series: 'Kingdom Living',
      duration: '47:38',
      scripture: 'Matthew 5:1-12',
      tags: ['beatitudes', 'sermon on the mount', 'kingdom values', 'discipleship'],
      popular: false,
      downloadable: true
    },
    {
      id: '18',
      title: 'Finding Your Purpose in God\'s Plan',
      description: 'Discovering how your unique gifts, passions, and experiences fit into God\'s greater purpose. This message helps believers identify and pursue their divine calling with confidence.',
      preacher: { 
        name: 'Pastor Grace Williams', 
        image: '/images/pastors/grace-williams.jpg',
        role: 'Worship Pastor'
      },
      date: '2024-12-22',
      audioUrl: '/sermons/finding-purpose.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example18',
      imageUrl: '/images/sermons/purpose.jpg',
      series: 'Designed for Purpose',
      duration: '45:29',
      scripture: 'Jeremiah 29:11-13, Ephesians 2:10',
      tags: ['purpose', 'calling', 'gifts', 'vision'],
      popular: true,
      downloadable: true
    },
    {
      id: '19',
      title: 'The Power of Forgiveness',
      description: 'Examining the transformative power of giving and receiving forgiveness. This message addresses the healing that comes through forgiveness and practical steps to overcome unforgiveness.',
      preacher: { 
        name: 'Pastor Sarah Johnson', 
        image: '/images/pastors/sarah-johnson.jpg',
        role: 'Prayer Ministry Leader'
      },
      date: '2024-12-15',
      audioUrl: '/sermons/power-forgiveness.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example19',
      imageUrl: '/images/sermons/forgiveness.jpg',
      series: 'Restoration',
      duration: '49:41',
      scripture: 'Matthew 6:14-15, Colossians 3:13',
      tags: ['forgiveness', 'healing', 'relationships', 'freedom'],
      popular: false,
      downloadable: true
    },
    {
      id: '20',
      title: 'Faith that Works: Living Out What You Believe',
      description: 'Exploring the inseparable connection between genuine faith and practical action. This message challenges believers to demonstrate their faith through tangible expressions of love and service.',
      preacher: { 
        name: 'Pastor Michael Thompson', 
        image: '/images/pastors/michael-thompson.jpg',
        role: 'Teaching Pastor'
      },
      date: '2024-12-08',
      audioUrl: '/sermons/faith-that-works.mp3',
      videoUrl: 'https://www.youtube.com/watch?v=example20',
      imageUrl: '/images/sermons/faith-works.jpg',
      series: 'Faith Journey',
      duration: '43:52',
      scripture: 'James 2:14-26, Matthew 25:31-46',
      tags: ['faith', 'works', 'service', 'action'],
      popular: false,
      downloadable: true
    }
  ];
