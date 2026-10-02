import { church } from './church'

export const churchFoundedYear = 2015

export const churchVision =
  'To reach everyone with the gospel of Christ, raise Nehemiah (leaders) and professionals who will combine the practice of their professions with the Bible.'

export const churchMission =
  'We are called to make disciples for Christ, raise Christian leaders, empower Christians in all professions and water men to dream, discover, desire, develop and deploy their God-given potentials in fulfilling the ultimate destiny their lives have been fashioned for; raising the next generation of Nehemiah for Nigeria, Africa and globally under the guidance of the Holy Spirit.'

export const churchScriptureFoundations = [
  'Genesis 2:12',
  'Exodus 15:27',
  'Revelation 21:18–21',
  'Zechariah 8:19–23',
  'Psalms 1:2–4',
] as const

export const churchValues = [
  {
    id: 'faithfulness',
    name: 'Faithfulness',
    label: 'STEADFAST IN FAITH',
    description:
      'Remaining faithful to God, His Word, and the people entrusted to our care. We seek to live with integrity, keep our commitments, and follow Christ in the everyday moments of life.',
    invitation: 'A steady faith. A dependable love.',
  },
  {
    id: 'fruitfulness',
    name: 'Fruitfulness',
    label: 'A LIFE THAT BEARS FRUIT',
    description:
      'Growing in Christ and allowing that growth to bless others. We desire lives that bear good fruit through love, service, spiritual maturity, and the faithful use of our gifts.',
    invitation: 'Nourished in Christ. Growing with purpose.',
  },
  {
    id: 'fatherhood',
    name: 'Fatherhood',
    label: 'BELONGING & SPIRITUAL CARE',
    description:
      'Knowing God as our Father and reflecting His care in our church family. We value spiritual guidance, loving relationships, and helping the next generation grow in faith and confidence.',
    invitation: 'A family to belong to. A generation to nurture.',
  },
  {
    id: 'freshness',
    name: 'Freshness',
    label: 'CONTINUALLY RENEWED',
    description:
      'Making room for renewal in God’s presence. Through worship, prayer, and the Word, we seek fresh strength, a teachable heart, and hope for each new season of life.',
    invitation: 'Fresh strength for the journey ahead.',
  },
  {
    id: 'fullness',
    name: 'Fullness',
    label: 'GROWING INTO WHOLENESS',
    description:
      'Pursuing the fullness of life in Christ. We encourage one another to grow in spiritual maturity, discover God-given purpose, and bring faith into every part of our lives.',
    invitation: 'A whole life, rooted in Christ.',
  },
] as const

export type ChurchStoryChapter = {
  id: string
  title: string
  subtitle: string
  image: string
  imageAlt: string
  caption: string
  quote: string
  paragraphs: string[]
  scriptures?: readonly string[]
  notes?: { title: string; text: string }[]
  action?: { label: string; href: string }
}

export const churchStoryChapters: ChurchStoryChapter[] = [
  {
    id: 'beginnings',
    title: 'Where our story begins.',
    subtitle: 'A vision for lives that flourish.',
    image: '/images/church-history.jpg',
    imageAlt: 'Rev. Dr. Emmanuel and Dr. Pastor Mrs Damilola Olowononi together',
    caption: 'A shared journey of faith and fellowship.',
    quote: 'Our roots are in Christ. Our hearts are open to you.',
    paragraphs: [
      `Founded in ${churchFoundedYear}, Elim Christian Garden International is a ministry with a calling to bring the kingdom of God to men. We believe this ministry is ordained by God, and our shared journey is rooted in His Word and the guidance of the Holy Spirit.`,
      'Rev. Dr. Emmanuel Olowononi, our founder and senior pastor, leads that vision with a commitment to biblical teaching and the practical life of faith. Alongside him, Dr. Pastor Mrs Damilola Olowononi brings care and encouragement to the church family. Their ministry is part of the story of the people who call Elim home.',
      'Our church is rooted in Bwari, Abuja. From this community, our vision looks towards Nigeria, Africa, and the world: reaching people with the gospel of Christ, raising Christian leaders, and helping people discover and use their God-given potential.',
      'Watering lives for fruitfulness expresses the heart of this calling. We desire to help people dream, discover, desire, develop, and deploy their gifts in fulfilling the destiny their lives have been fashioned for. Faith, leadership, and professional life all have a place in that journey.',
    ],
  },
  {
    id: 'our-name',
    title: 'The heart behind our name.',
    subtitle: 'Elim. A place to be refreshed.',
    image: '/images/worship.jpg',
    imageAlt: 'The Elim church family worshipping together',
    caption: 'Finding renewal in worship and the Word.',
    quote: '“And they came to Elim, where were twelve wells of water, and threescore and ten palm trees.” — Exodus 15:27',
    paragraphs: [
      'The name of our ministry — Elim Christian Garden — is rooted deeply in the revelation of the Holy Spirit. It is anchored in Genesis 2:12, Exodus 15:27, Revelation 21:18–21, Zechariah 8:19–23, and Psalms 1:2–4. These Scripture foundations belong at the heart of our identity.',
      'Exodus 15:27 describes the biblical place called Elim. On the journey of the people of Israel, Elim was a place with twelve wells of water and seventy palm trees. Its image of rest and refreshment speaks to the heart of our church.',
      'Life brings seasons of joy, uncertainty, responsibility, and weariness. We desire our church to be a place where people can turn to God, be encouraged by Scripture, and receive strength for the next part of their journey. Refreshment is woven into our worship, our prayer, and our care for one another.',
      'The garden in our name also speaks of growth. A garden needs nourishment and care; a life of faith does too. Through teaching, fellowship, and opportunities to serve, we encourage people to deepen their roots in Christ and allow that growth to bear fruit in their lives.',
      'These two pictures belong together: refreshing and fruitfulness. We gather to be renewed in God’s presence, and we carry our faith into our homes, our work, and our community. The name Elim reminds us of the kind of church family we seek to be.',
    ],
    scriptures: churchScriptureFoundations,
    notes: [
      { title: '12 wells of water', text: 'The springs described at Elim in Exodus 15:27.' },
      { title: '70 palm trees', text: 'The palms at that place of rest on the journey.' },
    ],
  },
  {
    id: 'vision-and-mission',
    title: 'The calling we carry.',
    subtitle: 'Reaching people. Raising a generation of Nehemiah.',
    image: '/images/services.jpg',
    imageAlt: 'A gathering of the Elim church family',
    caption: 'The gospel at the heart of our calling.',
    quote: 'Dream. Discover. Desire. Develop. Deploy.',
    paragraphs: [
      'The vision of Elim Christian Garden International begins with the gospel of Christ. We are called to reach people and raise leaders and professionals whose practice is shaped by the Bible.',
      'The next generation of Nehemiah is central to that vision: Christian leaders who bring their faith into their professions and help fulfil God’s purpose in Nigeria, Africa, and globally. We seek to pursue this calling under the guidance of the Holy Spirit.',
      'Our mission gives direction to the way we teach, disciple, encourage, and equip people. It is a call to spiritual growth and to the discovery and development of the potential God has placed in each life.',
    ],
    notes: [
      { title: 'Our vision', text: churchVision },
      { title: 'Our mission', text: churchMission },
    ],
  },
  {
    id: 'five-fs',
    title: 'Faith that shapes our life.',
    subtitle: 'The five F’s at the heart of Elim.',
    image: '/images/album-cover.jpg',
    imageAlt: 'Hands joined in prayer over an open Bible',
    caption: 'Values lived out in our shared journey.',
    quote: 'Faithfulness. Fruitfulness. Fatherhood. Freshness. Fullness.',
    paragraphs: [
      'Our values give words to the life we seek to share as a church. The five F’s — Faithfulness, Fruitfulness, Fatherhood, Freshness, and Fullness — describe how we desire to grow in Christ and care for one another.',
      'They connect our worship with our daily choices, our personal growth with our relationships, and the encouragement we receive with the care we offer others. Together, they express a faith that reaches into every part of life.',
    ],
    notes: churchValues.map((value) => ({ title: value.name, text: value.description })),
    action: { label: 'Explore our five values', href: '#our-values' },
  },
  {
    id: 'our-leadership',
    title: 'People with a heart to serve.',
    subtitle: 'Leading with faith. Serving with love.',
    image: '/images/leader2.jpg',
    imageAlt: 'Rev. Dr. Emmanuel Olowononi, founder and senior pastor',
    caption: 'Rev. Dr. Emmanuel Olowononi, Founder & Senior Pastor.',
    quote: 'Guiding and encouraging our church family as we follow Jesus together.',
    paragraphs: [
      'The story of a church includes the people who guide, teach, encourage, and care for its family. At Elim, our leadership serves with a heart for biblical teaching, spiritual growth, and community.',
      'Rev. Dr. Emmanuel Olowononi is our founder and senior pastor. His ministry connects the wisdom of Scripture with the practical challenges of everyday life. Alongside his pastoral calling, he brings an academic background in sports law and experience in public speaking, encouraging people to pursue purpose in their faith and professional lives.',
      'Pastor Emmanuel Olorunmola serves as assistant pastor, supporting the life and ministry of Elim Christian Garden International. He works alongside the senior pastor and the leadership team to guide and support the church family in its journey of faith.',
      'Dr. Pastor Mrs Damilola Olowononi, our Mother in Israel, is a medical doctor with a heart for helping people discover their purpose and grow in faith. She serves alongside her husband, bringing care and encouragement to the Elim family. Together, our leaders help make room for people to learn, belong, and grow.',
    ],
    action: { label: 'Meet our leadership', href: '#our-leadership' },
  },
  {
    id: 'life-together',
    title: 'A family across generations.',
    subtitle: 'Room to belong. Room to grow.',
    image: '/images/community.jpg',
    imageAlt: 'Members of the Elim church family gathered together',
    caption: 'Different lives. A shared faith.',
    quote: 'We grow in faith as we share life with one another.',
    paragraphs: [
      'Church life is built through relationships as well as gatherings. At Elim, we make room for children, young people, adults, and families to learn, share, and grow together. Every generation has something to receive and something to give.',
      'Fellowship offers space for friendship and encouragement. It is a way to walk alongside people through the experiences of everyday life, to share questions, and to strengthen one another in faith. We value a church family where people can be known and supported.',
      'Serving is another part of our shared story. Worship, creative gifts, practical care, and welcoming others all contribute to the life of the church. Each person’s gifts can help the family flourish and bring encouragement to the people around us.',
      'Our community page introduces the fellowships and serving teams that make up this shared life. Whether you are looking for connection, a place for your children to grow, or a way to use your gifts, there is an invitation to take a next step with us.',
    ],
    action: { label: 'Find your community', href: '/community' },
  },
  {
    id: 'your-next-chapter',
    title: 'Your place in the story.',
    subtitle: 'The next chapter includes you.',
    image: '/images/teenagerandchildren.jpg',
    imageAlt: 'Children and young people sharing a church celebration at Elim',
    caption: 'There is room for your story here.',
    quote: 'Come as you are. Find your family.',
    paragraphs: [
      'Knowing our story is an introduction. Sharing life with us is the next step. Whether you are exploring faith, looking for a church family, or simply hoping to find encouragement, we would love to welcome you to Elim.',
      `We gather for Sunday worship at ${church.sundayTime} at Elim Garden in Bwari, Abuja. Our gatherings bring together worship, the Word, and a chance to connect with the church family. You do not need to have everything figured out before you come.`,
      'You can also begin by exploring a message, reading a monthly bulletin, or finding a fellowship on our community page. These offer a window into the shared life of our church and ways to get connected.',
      'Every person brings a story of their own. As we continue to grow together, our invitation remains simple: come and belong, discover purpose, and walk with us in the love of Jesus.',
    ],
    notes: [
      { title: 'Sunday worship', text: `${church.sundayTime} – ${church.sundayEnd}` },
      { title: 'Find us', text: church.address },
      { title: 'Get in touch', text: church.email },
    ],
    action: { label: 'Plan your first visit', href: '#join-us' },
  },
]
