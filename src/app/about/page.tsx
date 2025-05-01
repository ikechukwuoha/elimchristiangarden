// pages/about.tsx
import React from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Layout from '../../components/Layout'
import Link from 'next/link';

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About Us | Elim Christian Garden Int</title>
        <meta name="description" content="Learn more about Elim Christian Garden International" />
      </Head>

      <div className="bg-blue-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">About Our Church</h1>
          <p className="text-lg text-white max-w-3xl mx-auto">
            Elim Christian Garden International is a place of worship, growth, and fellowship for people from all walks of life.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gold-600 mb-6">Our Story</h2>
              <p className="text-gray-700 mb-4">
                Elim Christian Garden International was founded in 2005 with a vision to create a church that would be a place of spiritual refreshment and growth for all people.
              </p>
              <p className="text-gray-700 mb-4">
                The name &ldquo;Elim&rdquo; comes from Exodus 15:27, which describes an oasis where the Israelites found &ldquo;twelve springs of water and seventy palm trees.&rdquo; Just as Elim was a place of refreshment for the Israelites, our church aims to be a place where people can find spiritual refreshment and renewal.
              </p>
              <p className="text-gray-700">
                Over the years, we have grown from a small gathering to a vibrant community of believers dedicated to serving God and our community. Throughout our journey, we have remained committed to our core values of faith, community, and service.
              </p>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
              <Image 
                src="/images/church-history.jpg" 
                alt="Church History" 
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-600 mb-2">Our Core Values</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-700">The principles that guide everything we do</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full inline-flex mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-600 mb-4">Biblical Truth</h3>
              <p className="text-gray-700">
                We are committed to teaching and living according to the timeless truths of God&apos;s Word, the Bible, which guides all our beliefs and practices.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-700 mb-4">Authentic Community</h3>
              <p className="text-gray-700">
                We believe in creating a welcoming, inclusive environment where people can form genuine relationships, share life&apos;s joys and challenges, and grow together.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gold-100 p-4 rounded-full inline-flex mb-6">
                <svg className="w-8 h-8 text-gold-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gold-600 mb-4">Compassionate Service</h3>
              <p className="text-gray-700">
                We are dedicated to serving our community and world with the love of Christ, meeting practical needs and sharing hope with those around us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Our Leadership</h2>
          <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Meet the team that guides our church</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: 'Pastor Emmanuel Olorunmola',
              role: 'Assistant Pastor',
              image: '/images/leader1.jpg',
              bio: 'Pastor Emmanuel has been Holding the hands of Moses(Rev. Doctor Emmanuel Olowononi)in Elim Christian Garden International. He is the Assistant Pastor.'
            },
            {
              name: 'Rev. Emmanuel Olowononi',
              role: 'Senior Pastor',
              image: '/images/leader2.jpg',
              bio: 'Dr. Rev. Emmanuel Olowononi stands as a remarkable figure who seamlessly blends spiritual leadership with academic excellence. As the founder and senior pastor of Elim Christian Garden International, he leads the ministry with genuine passion and a heart for authentic connection to the divine. His unique background as a Doctor in Sport Law brings an intellectual depth to his ministry that sets him apart. This specialized expertise informs his approach to leadership and community building, offering thoughtful perspectives grounded in both faith and legal principles. As a public speaker, Dr. Rev. Olowononi captivates audiences with his compelling presence and insightful messages. His ability to weave together spiritual wisdom with practical application makes his teaching accessible and transformative. The impact of his ministry extends beyond the walls of his church, as his leadership inspires others to pursue excellence in both spiritual practice and professional endeavors.'
            },
            {
              name: 'Dr. Pastor Mrs Damilola Olowononi',
              role: 'Mother in Israel',
              image: '/images/leader3.jpg',
              bio: 'Dr. Pastor Mrs Damilola is the wife of Dr. rev. Emmanuel Olowononi, She is a Medical Doctor and she is dedicated to helping people discover their purpose and grow in faith.'
            }
          ].map((leader, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-64 relative">
                <Image 
                  src={leader.image} 
                  alt={leader.name} 
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-600 mb-1">{leader.name}</h3>
                <p className="text-gold-600 font-medium mb-4">{leader.role}</p>
                <p className="text-gray-700">
                  {leader.bio.length > 250 
                    ? `${leader.bio.substring(0, 250)}...` 
                    : leader.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link 
            href="/about/team" 
            className="inline-block px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-md transition-colors shadow-md"
          >
            See All Our Teams
          </Link>
        </div>
      </div>
    </section>
      {/* Join Us CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Us This Sunday</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            We&apos;d love to welcome you to our church family. Join us for worship every Sunday at 10:00 AM.
          </p>
          <div className="space-x-4">
            <a href="#" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-md inline-flex items-center transition-colors">
              Get Directions
            </a>
            <a href="#" className="bg-gold-500 hover:bg-gold-600 text-white font-semibold py-3 px-6 rounded-md inline-flex items-center transition-colors">
              Service Times
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}