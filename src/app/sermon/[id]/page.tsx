// 'use client';

// import React from 'react'
// import Head from 'next/head'
// import Layout from '../../../components/Layout'
// import { useParams, useRouter } from 'next/navigation'
// import Image from 'next/image'
// import { sermons } from '../../data/sermons'
// import Link from 'next/link';
// import { Play, Download, Share2, Bookmark, Clock, Calendar, ChevronLeft, User, TrendingUp } from 'lucide-react'

// export default function SermonDetail() {
//   const router = useRouter();
//   const params = useParams();
//   const id = params.id as string; // Type assertion if using TypeScript
  
//   const sermon = sermons.find(sermon => sermon.id === id);

//   if (!sermon) {
//     return (
//       <Layout>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
//           <h1 className="text-2xl font-bold text-gray-800">Sermon not found</h1>
//           <button 
//             onClick={() => router.push('/sermons')}
//             className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Back to Sermons
//           </button>
//         </div>
//       </Layout>
//     )
//   }

//   // Format date
//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'long', day: 'numeric' }
//     return new Date(dateString).toLocaleDateString('en-US', options)
//   }

//   // Format duration
//   const formatDuration = (duration) => {
//     if (!duration) return "45 mins"
//     if (typeof duration === 'number') return `${duration} mins`
//     return duration
//   }

//   return (
//     <Layout>
//       <Head>
//         <title>{sermon.title} | Elim Christian Garden Int</title>
//         <meta name="description" content={sermon.description.substring(0, 160)} />
//       </Head>

//       {/* Hero Section */}
//       <div className="relative bg-gray-900">
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90"></div>
//         <div className="absolute inset-0 bg-[url('/images/sermon-detail-bg.jpg')] bg-center bg-cover mix-blend-overlay"></div>
        
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
//           <div className="flex flex-col lg:flex-row gap-12">
//             {/* Sermon Image */}
//             <div className="lg:w-1/3">
//               <div className="relative aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-2xl">
//                 <Image 
//                   src={sermon.imageUrl || "/images/sermon-placeholder-large.jpg"} 
//                   alt={sermon.title}
//                   className="w-full h-full object-cover"
//                   width={1200}
//                   height={800}
//                 />
//                 {sermon.popular && (
//                   <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-md">
//                     <TrendingUp className="w-4 h-4 mr-1" />
//                     Popular
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Sermon Info */}
//             <div className="lg:w-2/3 text-white">
//             <div className="mb-4">
//               <Link 
//                 href="/sermons" 
//                 className="inline-flex items-center text-blue-300 hover:text-blue-200 text-sm transition-colors"
//               >
//                 <ChevronLeft className="w-4 h-4 mr-1" />
//                 Back to Sermons
//               </Link>
//             </div>
            
//             {sermon.series && (
//               <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium mb-4">
//                 {sermon.series}
//               </span>
//             )}
              
//               <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{sermon.title}</h1>
              
//               <p className="text-lg text-blue-100 mb-6">{sermon.description}</p>
              
//               <div className="flex flex-wrap gap-6 mb-8">
//                 <div className="flex items-center">
//                   <User className="w-5 h-5 text-blue-300 mr-2" />
//                   <span className="font-medium">{sermon.preacher.name}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <Calendar className="w-5 h-5 text-blue-300 mr-2" />
//                   <span>{formatDate(sermon.date)}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <Clock className="w-5 h-5 text-blue-300 mr-2" />
//                   <span>{formatDuration(sermon.duration)}</span>
//                 </div>
//               </div>
              
//               <div className="flex flex-wrap gap-4">
//                 <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center transition-colors shadow-lg">
//                   <Play className="w-5 h-5 mr-2" />
//                   Play Sermon
//                 </button>
//                 <button className="px-6 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg font-medium flex items-center transition-colors border border-white border-opacity-20">
//                   <Download className="w-5 h-5 mr-2" />
//                   Download
//                 </button>
//                 <button className="p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors border border-white border-opacity-20">
//                   <Share2 className="w-5 h-5" />
//                 </button>
//                 <button className="p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors border border-white border-opacity-20">
//                   <Bookmark className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="flex flex-col lg:flex-row gap-12">
//           {/* Left Column - Sermon Content */}
//           <div className="lg:w-2/3">
//             {/* Audio Player */}
//             <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//               <h2 className="text-xl font-bold mb-4">Listen to Sermon</h2>
//               <div className="bg-gray-100 rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center">
//                     <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mr-4">
//                       <Play className="w-5 h-5" />
//                     </button>
//                     <div>
//                       <p className="font-medium">Now Playing</p>
//                       <p className="text-sm text-gray-500">{sermon.title}</p>
//                     </div>
//                   </div>
//                   <span className="text-sm text-gray-500">{formatDuration(sermon.duration)}</span>
//                 </div>
//                 <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
//                   <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
//                 </div>
//                 <div className="flex justify-between text-xs text-gray-500">
//                   <span>1:24</span>
//                   <span>{formatDuration(sermon.duration)}</span>
//                 </div>
//               </div>
              
//               <div className="mt-6 flex flex-wrap gap-3">
//                 <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center">
//                   <Download className="w-4 h-4 mr-2" />
//                   Download Audio
//                 </button>
//                 <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center">
//                   <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 012 0v1.323l3.954-1.582 1.599.8a1 1 0 01-.894 1.788l-1.233-.616-1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349z" />
//                   </svg>
//                   Transcript
//                 </button>
//                 <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center">
//                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                   </svg>
//                   Video
//                 </button>
//               </div>
//             </div>

//             {/* Sermon Notes */}
//             <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//               <h2 className="text-xl font-bold mb-4">Sermon Notes</h2>
//               <div className="prose max-w-none">
//                 {sermon.notes ? (
//                   <div dangerouslySetInnerHTML={{ __html: sermon.notes }} />
//                 ) : (
//                   <p className="text-gray-500">No notes available for this sermon.</p>
//                 )}
//               </div>
//             </div>

//             {/* Bible References */}
//             {sermon.bibleReferences && sermon.bibleReferences.length > 0 && (
//               <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//                 <h2 className="text-xl font-bold mb-4">Bible References</h2>
//                 <div className="flex flex-wrap gap-2">
//                   {sermon.bibleReferences.map((reference, index) => (
//                     <a 
//                       key={index}
//                       href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NIV`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100"
//                     >
//                       {reference}
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Related Resources */}
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h2 className="text-xl font-bold mb-4">Related Resources</h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <a href="#" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
//                   <h3 className="font-medium mb-1">Study Guide</h3>
//                   <p className="text-sm text-gray-600">Download PDF with discussion questions</p>
//                 </a>
//                 <a href="#" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
//                   <h3 className="font-medium mb-1">Small Group Video</h3>
//                   <p className="text-sm text-gray-600">Additional teaching for groups</p>
//                 </a>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Sidebar */}
//           <div className="lg:w-1/3">
//             {/* Preacher Info */}
//             <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//               <div className="flex items-center mb-4">
//                 <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mr-4">
//                   <Image 
//                     src={sermon.preacher.image || "/images/avatar-placeholder.png"} 
//                     alt={sermon.preacher.name}
//                     className="w-full h-full object-cover"
//                     width={1200}
//                     height={800}
//                   />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-lg">{sermon.preacher.name}</h3>
//                   <p className="text-gray-600 text-sm">{sermon.preacher.role}</p>
//                 </div>
//               </div>
//               <p className="text-gray-700 mb-4">{sermon.preacher.bio || 'No biography available.'}</p>
//               <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
//                 View All Sermons by {sermon.preacher.name.split(' ')[0]}
//               </button>
//             </div>

//             {/* Series Info */}
//             {sermon.series && (
//               <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//                 <h3 className="font-bold text-lg mb-3">Series: {sermon.series}</h3>
//                 <div className="aspect-w-16 aspect-h-9 mb-4 rounded-lg overflow-hidden">
//                   <Image 
//                     src={sermon.imageUrl || "/images/series-placeholder.jpg"} 
//                     alt={sermon.series}
//                     className="w-full h-full object-cover"
//                     width={1200}
//                     height={800}
//                   />
//                 </div>
//                 <p className="text-gray-700 mb-4">{sermon.seriesDescription || 'No series description available.'}</p>
//                 <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
//                   View All Sermons in This Series
//                 </button>
//               </div>
//             )}

//             {/* Recent Sermons */}
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h3 className="font-bold text-lg mb-4">Recent Sermons</h3>
//               <div className="space-y-4">
//                 {sermons.slice(0, 3).map((recentSermon) => (
//                   <Link 
//                     key={recentSermon.id} 
//                     href={`/sermon/${recentSermon.id}`}
//                     className="flex group"
//                   >
//                     <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden mr-4 flex-shrink-0">
//                       <Image 
//                         src={recentSermon.imageUrl || "/images/sermon-placeholder.jpg"} 
//                         alt={recentSermon.title}
//                         className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
//                         width={200}
//                         height={200}
//                       />
//                     </div>
//                     <div>
//                       <h4 className="font-medium group-hover:text-blue-600 transition-colors line-clamp-2">
//                         {recentSermon.title}
//                       </h4>
//                       <p className="text-xs text-gray-500">{formatDate(recentSermon.date)}</p>
//                     </div>
//                   </Link>
//                 ))}
//               </div>
//               <Link 
//                   href="/sermons" 
//                   className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
//                   >
//                   View All Sermons →
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   )
// }


'use client';

import React from 'react'
import Head from 'next/head'
import Layout from '../../../components/Layout'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { sermons } from '../../data/sermons'
import Link from 'next/link';
import { Play, Download, Share2, Bookmark, Clock, Calendar, ChevronLeft, User, TrendingUp } from 'lucide-react'

export default function SermonDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Type assertion if using TypeScript
  
  const sermon = sermons.find(sermon => sermon.id === id);

  if (!sermon) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Sermon not found</h1>
          <button 
            onClick={() => router.push('/sermons')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sermons
          </button>
        </div>
      </Layout>
    )
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  // Format duration
  const formatDuration = (duration) => {
    if (!duration) return "45 mins"
    if (typeof duration === 'number') return `${duration} mins`
    return duration
  }

  return (
    <Layout>
      <Head>
        <title>{sermon.title} | Elim Christian Garden Int</title>
        <meta name="description" content={sermon.description.substring(0, 160)} />
      </Head>

      {/* Hero Section - with increased top padding */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/images/sermon-detail-bg.jpg')] bg-center bg-cover mix-blend-overlay"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sermon Image */}
            <div className="lg:w-1/3">
              <div className="relative aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-2xl">
                <Image 
                  src={sermon.imageUrl || "/images/sermon-placeholder-large.jpg"} 
                  alt={sermon.title}
                  className="w-full h-full object-cover"
                  width={1200}
                  height={800}
                />
                {sermon.popular && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-md">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Popular
                  </div>
                )}
              </div>
            </div>

            {/* Sermon Info */}
            <div className="lg:w-2/3 text-white">
            <div className="mb-4">
              <Link 
                href="/sermons" 
                className="inline-flex items-center text-blue-300 hover:text-blue-200 text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Sermons
              </Link>
            </div>
            
            {sermon.series && (
              <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium mb-4">
                {sermon.series}
              </span>
            )}
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{sermon.title}</h1>
              
              <p className="text-lg text-blue-100 mb-6">{sermon.description}</p>
              
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-blue-300 mr-2" />
                  <span className="font-medium">{sermon.preacher.name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-300 mr-2" />
                  <span>{formatDate(sermon.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-300 mr-2" />
                  <span>{formatDuration(sermon.duration)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center transition-colors shadow-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Play Sermon
                </button>
                <button className="px-6 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg font-medium flex items-center transition-colors border border-white border-opacity-20">
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </button>
                <button className="p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors border border-white border-opacity-20">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors border border-white border-opacity-20">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Sermon Content */}
          <div className="lg:w-2/3">
            {/* Audio Player */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Listen to Sermon</h2>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mr-4">
                      <Play className="w-5 h-5" />
                    </button>
                    <div>
                      <p className="font-medium">Now Playing</p>
                      <p className="text-sm text-gray-500">{sermon.title}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{formatDuration(sermon.duration)}</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1:24</span>
                  <span>{formatDuration(sermon.duration)}</span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download Audio
                </button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 012 0v1.323l3.954-1.582 1.599.8a1 1 0 01-.894 1.788l-1.233-.616-1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349z" />
                  </svg>
                  Transcript
                </button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Video
                </button>
              </div>
            </div>

            {/* Sermon Notes */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Sermon Notes</h2>
              <div className="prose max-w-none">
                {sermon.notes ? (
                  <div dangerouslySetInnerHTML={{ __html: sermon.notes }} />
                ) : (
                  <p className="text-gray-500">No notes available for this sermon.</p>
                )}
              </div>
            </div>

            {/* Bible References */}
            {sermon.bibleReferences && sermon.bibleReferences.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Bible References</h2>
                <div className="flex flex-wrap gap-2">
                  {sermon.bibleReferences.map((reference, index) => (
                    <a 
                      key={index}
                      href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NIV`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100"
                    >
                      {reference}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Resources */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Related Resources</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="#" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                  <h3 className="font-medium mb-1">Study Guide</h3>
                  <p className="text-sm text-gray-600">Download PDF with discussion questions</p>
                </a>
                <a href="#" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                  <h3 className="font-medium mb-1">Small Group Video</h3>
                  <p className="text-sm text-gray-600">Additional teaching for groups</p>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-1/3">
            {/* Preacher Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mr-4">
                  <Image 
                    src={sermon.preacher.image || "/images/avatar-placeholder.png"} 
                    alt={sermon.preacher.name}
                    className="w-full h-full object-cover"
                    width={200}
                    height={200}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{sermon.preacher.name}</h3>
                  <p className="text-gray-600 text-sm">{sermon.preacher.role}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{sermon.preacher.bio || 'No biography available.'}</p>
              <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
                View All Sermons by {sermon.preacher.name.split(' ')[0]}
              </button>
            </div>

            {/* Series Info */}
            {sermon.series && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="font-bold text-lg mb-3">Series: {sermon.series}</h3>
                <div className="aspect-w-16 aspect-h-9 mb-4 rounded-lg overflow-hidden">
                  <Image 
                    src={sermon.seriesImage || "/images/series-placeholder.jpg"} 
                    alt={sermon.series}
                    className="w-full h-full object-cover"
                    width={200}
                    height={200}
                  />
                </div>
                <p className="text-gray-700 mb-4">{sermon.seriesDescription || 'No series description available.'}</p>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                  View All Sermons in This Series
                </button>
              </div>
            )}

            {/* Recent Sermons */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Recent Sermons</h3>
              <div className="space-y-4">
                {sermons.slice(0, 3).map((recentSermon) => (
                  <Link 
                    key={recentSermon.id} 
                    href={`/sermon/${recentSermon.id}`}
                    className="flex group"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden mr-4 flex-shrink-0">
                      <Image 
                        src={recentSermon.imageUrl || "/images/sermon-placeholder.jpg"} 
                        alt={recentSermon.title}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        width={200}
                        height={200}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium group-hover:text-blue-600 transition-colors line-clamp-2">
                        {recentSermon.title}
                      </h4>
                      <p className="text-xs text-gray-500">{formatDate(recentSermon.date)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link 
                  href="/sermons" 
                  className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                  View All Sermons →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}