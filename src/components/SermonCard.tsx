import React, { useState } from 'react'
import { Sermon } from '../types'

type SermonCardProps = {
  sermon: Sermon
}

export default function SermonCard({ sermon }: SermonCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48">
        <img 
          src={sermon.thumbnail} 
          alt={sermon.title} 
          className="w-full h-full object-cover"
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="flex space-x-4">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
                aria-label="Play sermon"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <a 
                href={sermon.audioUrl} 
                download
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
                aria-label="Download sermon"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          {sermon.date}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">{sermon.title}</h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">{sermon.description}</p>
        
        <div className="flex items-center text-sm">
          <img 
            src={sermon.preacher.image} 
            alt={sermon.preacher.name} 
            className="w-8 h-8 rounded-full mr-2 object-cover"
          />
          <span className="text-gray-700">{sermon.preacher.name}</span>
        </div>
      </div>
    </div>
  )
}