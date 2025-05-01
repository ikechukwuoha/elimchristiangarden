'use client';

import React, { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import Image from 'next/image'
import { sermons } from '../data/sermons'
import { Search, Calendar, TrendingUp, BookOpen, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link';

export default function Sermons() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const sermonsPerPage = 10

  // interface Sermon {
  //   id: string;
  //   title: string;
  //   date: string;
  //   description: string;
  //   series?: string;
  //   popular: boolean;
  //   preacher: {
  //     name: string;
  //     image?: string;
  //   };
  //   duration?: string;
  //   imageUrl?: string;
  // }

  

  // Get unique series for filter dropdown
  const seriesList = useMemo(() => 
    Array.from(new Set(sermons.map(sermon => sermon.series))).filter(Boolean).sort(),
    []
  )

  // Filter sermons based on search term and filter
  const filteredSermons = useMemo(() => {
    return sermons.filter((sermon) => {
      const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sermon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sermon.preacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (filter === 'all') return matchesSearch
      if (filter === 'recent') return matchesSearch && new Date(sermon.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      if (filter === 'popular') return matchesSearch && sermon.popular
      
      // Filter by series
      return matchesSearch && sermon.series === filter
    })
  }, [searchTerm, filter])

  // Get current sermons for pagination
  const indexOfLastSermon = currentPage * sermonsPerPage
  const indexOfFirstSermon = indexOfLastSermon - sermonsPerPage
  const currentSermons = filteredSermons.slice(indexOfFirstSermon, indexOfLastSermon)
  const totalPages = Math.ceil(filteredSermons.length / sermonsPerPage)

  // Handle filter/search changes with loading state
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
      setCurrentPage(1) // Reset to first page when filters change
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, filter])

  // Function to format date nicely
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1)
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1)

  return (
    <Layout>
      <Head>
        <title>Sermons | Elim Christian Garden Int</title>
        <meta name="description" content="Browse and listen to sermons from Elim Christian Garden International" />
      </Head>

      {/* Hero Section with Background Image */}
      <div className="relative bg-blue-900 py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/images/sermons-bg.jpg')] mix-blend-overlay bg-center bg-cover"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Grow Your Faith</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Explore our collection of inspiring sermons and messages to deepen your spiritual journey and walk with Christ.
          </p>
          
          {/* Search Bar in Hero Area */}
          <div className="mt-8 max-w-3xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search sermons, topics, or preachers..."
              className="block w-full pl-12 pr-4 py-3 border-0 rounded-full text-base md:text-lg leading-6 bg-white bg-opacity-95 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Filter By:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setFilter('all')}
              >
                All Sermons
              </button>
              
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${filter === 'recent' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setFilter('recent')}
              >
                <Calendar className="w-4 h-4" />
                Recent
              </button>
              
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${filter === 'popular' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setFilter('popular')}
              >
                <TrendingUp className="w-4 h-4" />
                Popular
              </button>
              
              <div className="relative">
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${seriesList.includes(filter) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <BookOpen className="w-4 h-4" />
                  {seriesList.includes(filter) ? filter : 'Series'}
                </button>
                
                {isFilterOpen && (
                  <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {seriesList.map((series) => (
                        <button
                          key={series}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setFilter(series)
                            setIsFilterOpen(false)
                          }}
                        >
                          {series}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count and Sorting */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-600">
              Showing <span className="font-medium text-blue-600">
                {indexOfFirstSermon + 1}-{Math.min(indexOfLastSermon, filteredSermons.length)}
              </span> of <span className="font-medium">{filteredSermons.length}</span> sermons
              {searchTerm && <span> matching &quot;<span className="font-medium">{searchTerm}</span>&quot;</span>}
              {filter !== 'all' && filter !== 'recent' && filter !== 'popular' && (
                <span> in <span className="font-medium">{filter}</span> series</span>
              )}
              {filter === 'recent' && <span> from the last 30 days</span>}
              {filter === 'popular' && <span> marked as popular</span>}
            </p>
            
            <div className="flex items-center">
              <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
              <select 
                id="sort"
                className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="date-desc"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Sermon Grid with Animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeleton (optional)
              Array.from({ length: sermonsPerPage }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="flex items-center mb-4">
                      <div className="h-8 w-8 rounded-full bg-gray-200 mr-2"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                      <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : currentSermons.length > 0 ? (
                currentSermons.map((sermon, index) => (
                  <Link 
                  href={`/sermon/${sermon.id}`}
                  key={sermon.id}
                  className="block"
                >
                <div 
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Sermon Image */}
                  <div className="relative h-48 bg-blue-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-80"></div>
                    <Image 
                      src={sermon.imageUrl || "/images/sermon-placeholder.jpg"} 
                      alt={sermon.title}
                      className="w-full h-full object-cover mix-blend-overlay"
                      loading="lazy"
                      width={1200}
                      height={800}
                    />
                    {sermon.popular && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </div>
                    )}
                    {sermon.series && (
                      <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {sermon.series}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{sermon.title}</h3>
                    
                    <div className="flex items-center mb-4">
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2">
                        <Image 
                          src={sermon.preacher.image || "/images/avatar-placeholder.png"} 
                          alt={sermon.preacher.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          width={1200}
                          height={800}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sermon.preacher.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(sermon.date)}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{sermon.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{sermon.duration || "45 mins"}</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Watch
                        </button>
                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 011.414 1.414" />
                          </svg>
                          Listen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No sermons found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                  <button
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors shadow-md"
                    onClick={() => {
                      setSearchTerm('')
                      setFilter('all')
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredSermons.length > sermonsPerPage && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md flex items-center gap-1 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    // Show pages around current page
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = index + 1
                    } else if (currentPage <= 3) {
                      pageNum = index + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index
                    } else {
                      pageNum = currentPage - 2 + index
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => paginate(pageNum)}
                        className={`w-10 h-10 rounded-md flex items-center justify-center ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-2">...</span>
                  )}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => paginate(totalPages)}
                      className={`w-10 h-10 rounded-md flex items-center justify-center ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md flex items-center gap-1 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter CTA Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-10 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Never Miss a Sermon</h2>
            <p className="text-gray-600 mb-6">Subscribe to our newsletter and get the latest sermons delivered to your inbox every week.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </Layout>
  )
}