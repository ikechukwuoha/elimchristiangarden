// components/AnnouncementSection.tsx
import React from 'react'
import { Announcement } from '../types'

type AnnouncementSectionProps = {
  announcements: Announcement[]
}

export default function AnnouncementSection({ announcements }: AnnouncementSectionProps) {
  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">Announcements</h2>
          <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Stay updated with our latest events and activities</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-green-600 hover:shadow-lg transition-shadow"
            >
              {announcement.image && (
                <div className="relative h-48 w-full">
                  <img 
                    src={announcement.image} 
                    alt={announcement.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gold-100 text-gold-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {announcement.date}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-2">{announcement.title}</h3>
                <p className="text-gray-600 mb-4">{announcement.description}</p>
                {announcement.link && (
                  <a 
                    href={announcement.link} 
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                  >
                    Learn More
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}