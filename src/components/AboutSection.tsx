// components/AboutSection.tsx
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-green-700 mb-2">About Us</h2>
          <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Get to know Elim Christian Garden International</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative h-80 md:h-full rounded-lg overflow-hidden shadow-lg">
            <Image 
              src="/images/church-building.jpg" 
              alt="Elim Christian Garden International" 
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gold-600 mb-4">Our Vision</h3>
            <p className="text-gray-700 mb-6">
              At Elim Christian Garden International, we are dedicated to creating a community of believers who are growing in their faith, serving others, and spreading the love of Christ throughout the world.
            </p>
            
            <h3 className="text-2xl font-bold text-gold-600 mb-4">Our Mission</h3>
            <p className="text-gray-700 mb-6">
              Our mission is to provide a place of spiritual nourishment, fellowship, and support where everyone can experience God's love and grace. We strive to equip believers with the tools they need to live out their faith every day.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="flex items-center bg-green-50 p-4 rounded-lg flex-1 min-w-[180px]">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-green-700">Community</h4>
                  <p className="text-sm text-gray-600">Fostering meaningful relationships</p>
                </div>
              </div>
              
              <div className="flex items-center bg-blue-50 p-4 rounded-lg flex-1 min-w-[180px]">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700">Faith</h4>
                  <p className="text-sm text-gray-600">Growing in spiritual maturity</p>
                </div>
              </div>
              
              <div className="flex items-center bg-gold-50 p-4 rounded-lg flex-1 min-w-[180px]">
                <div className="bg-gold-100 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-gold-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gold-600">Service</h4>
                  <p className="text-sm text-gray-600">Reaching out to those in need</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <Link href="/about" className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-md inline-flex items-center transition-colors">
                Learn More About Us
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}