"use client"

import React, { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ClockIcon,
  CalendarIcon,
  Clock,
  Bell,
  MapPin,
  Headphones,
  Bookmark,
  Music,
  Book, 
  Heart, 
  Users, 
  ArrowRight, 
} from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import Image from 'next/image'
import { PlayIcon, ArrowRightIcon, BackwardIcon, ForwardIcon } from '@heroicons/react/24/solid';

export default function Home() {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoverCard, setHoverCard] = useState('');
  const carouselItems = [
    {
      image: "/images/church-main.jpg",
      title: "Elim Christian Garden International",
      description: "Watering Lives for Fruitfulness",
      buttonText: "Learn More",
      buttonLink: "/about"
    },
    {
      image: "/images/worship.jpg",
      title: "Join Us for Worship",
      description: "Sundays at 08:30 AM - Experience God's presence together",
      buttonText: "Service Times",
      buttonLink: "/services"
    },
    {
      image: "/images/community.jpg",
      title: "Be Part of Our Community",
      description: "Find your place in our family of believers",
      buttonText: "Get Connected",
      buttonLink: "/connect"
    }
  ];

  // Auto advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  // Handle manual navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  // Testimonials data
  const testimonials = [
    {
      quote: "Finding Elim Christian Garden was a turning point in my spiritual journey. The genuine community and biblical teaching have helped me grow in ways I never expected.",
      name: "Sarah M.",
      role: "Member since 2018"
    },
    {
      quote: "The youth ministry at Elim has been transformative for my teenagers. They've found mentors who care about them and friends who encourage their faith.",
      name: "David L.",
      role: "Parent & Member"
    },
    {
      quote: "I came to Elim feeling broken and lost, but found a loving community that pointed me to Jesus. Now I'm serving others and experiencing God's purpose for my life.",
      name: "Rachel T.",
      role: "Volunteer & Member"
    }
  ];

  // Ministries data
  const ministries = [
    {
      title: "Worship Ministry",
      icon: <Music className="h-6 w-6 text-green-600" />,
      description: "Serving through music, media, and creative arts to lead our congregation in authentic worship.",
      image: "/images/worship-ministry.jpg",
      link: "/ministries/worship"
    },
    {
      title: "Outreach & Missions",
      icon: <Heart className="h-6 w-6 text-blue-600" />,
      description: "Sharing God's love through community service, global missions, and compassionate care.",
      image: "/images/outreach-ministry.jpg",
      link: "/ministries/outreach"
    }
  ];
  console.log(ministries);

  return (
    <Layout>
      <Head>
          <title>Home | Elim Christian Garden Int</title>
          <meta name="description" content="Learn more about Elim Christian Garden International" />
      </Head>
    <main className="overflow-x-hidden overflow-y-hidden">
      {/* Hero Carousel */}
      <section className="relative min-h-screen">
        {/* Carousel Images */}
        {carouselItems.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative h-full w-full">
              <div className="absolute inset-0 bg-black/30 z-10"></div>
              <div 
                className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-10000"
                style={{ 
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  animation: index === currentSlide ? 'slowZoom 7s ease-out forwards' : 'none'
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{item.title}</h1>
                  <p className="text-xl md:text-2xl mb-8">{item.description}</p>
                  <Link href={item.buttonLink} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300">
                    {item.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 z-30 transition-colors shadow-lg backdrop-blur-sm"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 z-30 transition-colors shadow-lg backdrop-blur-sm"
          onClick={nextSlide}
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              className={`h-3 w-12 rounded-full transition-all transform ${
                index === currentSlide ? 'bg-white scale-100' : 'bg-white/40 scale-90'
              }`}
              onClick={() => setCurrentSlide(index)}
            ></button>
          ))}
        </div>
      </section>

      {/* Service Times - Brought up for immediate visibility */}
      <section className="py-24 relative overflow-hidden">
      {/* Enhanced Background with decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 opacity-90"></div>
      <div className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url('/api/placeholder/1920/800')` }}></div>
      
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-400 rounded-full filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/3"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-300 rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-300 rounded-full filter blur-3xl opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center space-x-2 bg-green-100 text-green-800 px-5 py-2 rounded-full text-sm font-medium mb-5 shadow-sm">
            <Bell className="w-4 h-4" />
            <span>Come together in faith</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Join Us for Worship
            </span>
          </h2>
          
          <div className="h-2 w-40 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mx-auto mt-5 mb-8"></div>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            We welcome you to join our vibrant community in-person or online.
            Experience the joy of fellowship and spiritual growth together.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
          {/* Enhanced Sunday Services Card */}
          <div 
            className={`bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden transition-all duration-500 ${
              hoverCard === 'sunday' ? 'transform -translate-y-3 shadow-2xl border-green-200' : 'transform hover:-translate-y-2 hover:shadow-lg'
            }`}
            onMouseEnter={() => setHoverCard('sunday')}
            onMouseLeave={() => setHoverCard("")}
          >
            {/* Card decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-t-xl"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-100 rounded-full -translate-y-1/2 translate-x-1/3 opacity-70"></div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-2xl inline-flex items-center justify-center mb-7 shadow-lg text-white">
                <Calendar className="h-8 w-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-5">Sunday Services</h3>
              
              <div className="space-y-4 mb-7">
                <div className="flex items-start space-x-4">
                  <div className="p-1.5 bg-green-100 rounded-full text-green-600 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Main Service</p>
                    <p className="text-gray-600">8:30 AM - 10:30 AM</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-1.5 bg-green-100 rounded-full text-green-600 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">Main Sanctuary</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-1.5 bg-green-100 rounded-full text-green-600 mt-0.5">
                    <Music className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Worship Style</p>
                    <p className="text-gray-600">Contemporary & Traditional</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-5 border-t border-gray-100">
                <a href="/sunday-services" className="inline-flex items-center text-green-600 font-medium hover:text-green-700 transition-colors group">
                  Learn more 
                  <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Enhanced Weekend Prayers Card */}
          <div 
            className={`bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden transition-all duration-500 ${
              hoverCard === 'weekend' ? 'transform -translate-y-3 shadow-2xl border-blue-200' : 'transform hover:-translate-y-2 hover:shadow-lg'
            }`}
            onMouseEnter={() => setHoverCard('weekend')}
            onMouseLeave={() => setHoverCard("")}
          >
            {/* Card decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-xl"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/3 opacity-70"></div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl inline-flex items-center justify-center mb-7 shadow-lg text-white">
                <Book className="h-8 w-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-5">Weekend Prayers</h3>
              
              <div className="space-y-4 mb-7">
                <div className="flex items-start space-x-4">
                  <div className="p-1.5 bg-blue-100 rounded-full text-blue-600 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Saturday Morning</p>
                    <p className="text-gray-600">7:00 AM - 8:30 AM</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-1.5 bg-blue-100 rounded-full text-blue-600 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">Prayer Chapel</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-1.5 bg-blue-100 rounded-full text-blue-600 mt-0.5">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Format</p>
                    <p className="text-gray-600">Prayer & Scripture Reading</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-5 border-t border-gray-100">
                <a href="/weekend-prayers" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors group">
                  Learn more 
                  <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Enhanced New Month Special Program Card */}
          <div 
            className={`bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden transition-all duration-500 ${
              hoverCard === 'monthly' ? 'transform -translate-y-3 shadow-2xl border-yellow-200' : 'transform hover:-translate-y-2 hover:shadow-lg'
            }`}
            onMouseEnter={() => setHoverCard('monthly')}
            onMouseLeave={() => setHoverCard("")}
          >
            {/* Card decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-t-xl"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-100 rounded-full -translate-y-1/2 translate-x-1/3 opacity-70"></div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-5 rounded-2xl inline-flex items-center justify-center mb-7 shadow-lg text-white">
                <Users className="h-8 w-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-5">New Month Special</h3>
              
              <div className="space-y-4 mb-7">
                <div className="flex items-start space-x-4">
                  <div className="p-1.5 bg-yellow-100 rounded-full text-yellow-600 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">First Friday Monthly</p>
                    <p className="text-gray-600">5:30 PM - 7:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-1.5 bg-yellow-100 rounded-full text-yellow-600 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">Main Sanctuary</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-1.5 bg-yellow-100 rounded-full text-yellow-600 mt-0.5">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Special Features</p>
                    <p className="text-gray-600">Worship Band & Testimonies</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-5 border-t border-gray-100">
                <a href="/monthly-program" className="inline-flex items-center text-yellow-600 font-medium hover:text-yellow-700 transition-colors group">
                  Learn more 
                  <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center">
            <a 
              href="/services" 
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-full blur-md opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4 px-10 rounded-full transition-colors shadow-lg hover:shadow-xl inline-flex items-center">
                View All Services
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
            
            <div className="mt-6 flex items-center space-x-1 text-gray-600 text-sm">
              <Heart className="h-4 w-4 mr-1 text-red-400" />
              <span>Join our community of faith</span>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Welcome Message */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-green-100 rounded-full -z-10"></div>
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-102 transition-all duration-500">
                <Image 
                  src="/images/church-welcome.jpg"
                  alt="Church Welcome"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-blue-100 rounded-full -z-10"></div>
            </div>
            
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-green-700 mb-2">Welcome to Elim Christian Garden</h2>
                <div className="w-24 h-1 bg-yellow-500 mt-4 mb-6"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">A Place to Belong</h3>
              <p className="text-gray-700 mb-6 text-lg">
                At Elim Christian Garden International, we believe that every person is created with purpose and designed for connection. 
                Our church family is a diverse community of believers committed to loving God, loving others, and making disciples.
              </p>
              <p className="text-gray-700 mb-8 text-lg">
                Whether you&apos;re exploring faith for the first time or looking for a church to call home, 
                we invite you to join us and experience the love, grace, and transformative power of Jesus Christ.
              </p>
              <Link href="/about" className="inline-flex items-center text-green-700 font-semibold text-lg hover:text-green-800 transition-colors group">
                Learn more about us
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Sermon with Parallax */}
      <section className="relative py-28 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url('/images/sermon-bg.jpg')` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 to-purple-900/90 backdrop-blur-sm"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 text-white/80 uppercase tracking-wide font-medium">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Latest Sermon
            </div>
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 leading-tight">
              Growing Through Life&apos;s Challenges
            </h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full"></div>
            <p className="text-xl text-white/90 leading-relaxed">
              Join Rev. Dr. Emmanuel Olowononi in exploring how adversity becomes our greatest spiritual teacher. Discover practical tools for maintaining faith and finding purpose in life&apos;s storms.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <a href="#" className="group relative bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 inline-flex items-center">
                <PlayIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Play Now
              </a>
              <a href="#" className="group border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-white/5 inline-flex items-center">
                Browse All
                <ArrowRightIcon className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Media Player */}
          <div className="animate-fade-in-up delay-100">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative w-32 h-32 shrink-0 group">
                  <Image 
                    src="/images/album-cover.jpg"
                    alt="Sermon Album Cover"
                    fill
                    className="rounded-xl object-cover transform group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl"></div>
                  <PlayIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Growing in Faith</h4>
                  <p className="text-emerald-400/90 font-medium">James Wilson</p>
                  <div className="flex items-center gap-2 mt-2 text-white/60">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-sm">45:30</span>
                    <span className="mx-1">•</span>
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm">April 15, 2024</span>
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className="space-y-6">
                <div className="relative group">
                  <div className="h-2 bg-white/10 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full w-1/3 relative">
                      <div className="absolute right-0 -top-1 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-white/60 text-sm mt-2">
                    <span>2:15</span>
                    <span>-45:30</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6">
                  <button className="text-white/80 hover:text-emerald-400 hover:scale-110 transition-all p-3">
                    <BackwardIcon className="w-7 h-7" />
                  </button>
                  <button className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white p-5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform">
                    <PlayIcon className="w-8 h-8" />
                  </button>
                  <button className="text-white/80 hover:text-emerald-400 hover:scale-110 transition-all p-3">
                    <ForwardIcon className="w-7 h-7" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
      {/* Horizontal Scrollable Ministries Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-yellow-600">Our Ministries</h2>
            <div className="w-24 h-1 bg-green-500 mx-auto mt-4 mb-6"></div>
            <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
              Discover ways to connect and grow with ministries for every season of life
            </p>
          </div>

          {/* Scrollable Cards Container */}
          <div className="relative">
            {/* Scrollable Content */}
            <div className="flex pb-8 space-x-6 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar">
              {[
                {
                  title: "Couples Fellowship",
                  description: "Strengthening marriages through biblical principles",
                  image: "/images/couplesfellowship.jpeg",
                  link: "/ministries/couples"
                },
                {
                  title: "Singles Fellowship",
                  description: "Building community for unmarried adults",
                  image: "/images/singles.jpg",
                  link: "/ministries/singles"
                },
                {
                  title: "Tehilla Ministries",
                  description: "Worship and creative arts ministry",
                  image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800",
                  link: "/ministries/tehilla"
                },
                {
                  title: "Protocol Team",
                  description: "Serving with excellence in church operations",
                  image: "/images/community.jpg",
                  link: "/ministries/protocol"
                },
                {
                  title: "Teenagers and Children",
                  description: "Engaging the next generation",
                  image: "/images/teenagerandchildren.jpg",
                  link: "/ministries/youth"
                },
                {
                  title: "Brothers Fellowship",
                  description: "Equipping men for godly leadership",
                  image: "https://media.thegospelcoalition.org/wp-content/uploads/2021/09/31131452/ministerial-fellowship.jpg",
                  link: "/ministries/men"
                },
                {
                  title: "Sisters Fellowship",
                  description: "Empowering women in faith and purpose",
                  image: "https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&w=800",
                  link: "/ministries/women"
                }
              ].map((ministry, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 w-72 snap-center relative group"
                >
                  <Link href={ministry.link}>
                    <div className="relative h-96 rounded-2xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
                      {/* Image Background with Gradient Overlay */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${ministry.image})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      
                      {/* Card Content */}
                      <div className="relative h-full flex flex-col justify-end p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">{ministry.title}</h3>
                        <p className="text-gray-200 mb-4">{ministry.description}</p>
                        <div className="flex items-center font-medium text-yellow-400">
                          Learn more
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Scroll Arrows (Optional) */}
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10 hidden md:block"
              onClick={() => {
                const container = document.querySelector('.hide-scrollbar');
                container?.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10 hidden md:block"
              onClick={() => {
                const container = document.querySelector('.hide-scrollbar');
                container?.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="text-center mt-12">
            <Link href="/ministries" className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg hover:shadow-xl inline-flex items-center">
              View All Ministries
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-700">Testimonies</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4 mb-6"></div>
            <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
              Hear from members of our church family
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-green-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <svg className="w-10 h-10 text-yellow-500 mb-6" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                </svg>
                <p className="text-gray-700 mb-8 italic text-lg">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-lg">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-green-700">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Come Worship With Us</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Whether you&apos;re new to faith or have been walking with God for years, there&apos;s a place for you at Elim Christian Garden International.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/visit" className="bg-white text-green-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300">
              Plan Your Visit
            </Link>
            <Link href="/contact" className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
    </Layout>
  )
}