"use client"

import React, { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
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
  const carouselItems = [
    {
      image: "/images/church-main.jpg",
      title: "Welcome to Elim Christian Garden International",
      description: "A place Where God waters life for fruitfulness",
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

  // Upcoming events data
  const upcomingEvents = [
    {
      title: "Sunday Worship Service",
      date: "Every Sunday",
      time: "10:00 AM",
      location: "Main Sanctuary"
    },
    {
      title: "Bible Study",
      date: "Every Wednesday",
      time: "7:00 PM",
      location: "Fellowship Hall"
    },
    {
      title: "Youth Night",
      date: "Every Friday",
      time: "6:30 PM",
      location: "Youth Center"
    },
    {
      title: "Community Outreach",
      date: "May 15, 2025",
      time: "9:00 AM",
      location: "Community Center"
    }
  ];

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
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-700">Join Us for Worship</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              We welcome you to join our vibrant community in-person or online
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 border-t-4 border-green-500">
              <div className="bg-green-100 p-4 rounded-full inline-flex mb-6 shadow-md">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Sunday Services</h3>
              <p className="text-gray-700">
                Main Service: 10:00 AM<br />
                Children&apos;s Church: 10:00 AM<br />
                Evening Prayer: 6:00 PM
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 border-t-4 border-blue-500">
              <div className="bg-blue-100 p-4 rounded-full inline-flex mb-6 shadow-md">
                <Book className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Mid-Week Bible Study</h3>
              <p className="text-gray-700">
                Wednesday: 7:00 PM<br />
                Prayer Meeting: 6:30 PM<br />
                Fellowship Hall
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 border-t-4 border-yellow-500">
              <div className="bg-yellow-100 p-4 rounded-full inline-flex mb-6 shadow-md">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Youth & Young Adults</h3>
              <p className="text-gray-700">
                Youth Night: Friday 6:30 PM<br />
                Young Adults: Sunday 1:00 PM<br />
                Youth Center
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/services" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg hover:shadow-xl inline-flex items-center">
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
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
      <section className="py-24 bg-fixed bg-center bg-cover relative" style={{ backgroundImage: `url('/images/sermon-bg.jpg')` }}>
        <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-white">Latest Message</h2>
              <div className="w-24 h-1 bg-yellow-500 mt-4 mb-6"></div>
              <h3 className="text-2xl font-semibold mb-3 text-white">&ldquo;Growing in Faith Through Challenges&rdquo;</h3>
              <p className="text-white/90 mb-6 text-lg">
                Pastor James Wilson shares how we can find spiritual growth during life&apos;s most difficult seasons. 
                Learn practical ways to trust God and find His purpose even in challenging circumstances.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="bg-white text-blue-700 hover:bg-gray-100 font-semibold py-3 px-6 rounded-full inline-flex items-center transition-colors shadow-lg hover:shadow-xl">
                  <PlayIcon className="mr-2 h-5 w-5" />
                  Listen Now
                </a>
                <a href="#" className="border-2 border-white hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-full inline-flex items-center transition-colors">
                  All Messages
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-32 h-32 shrink-0">
                  <Image 
                    src="/images/album-cover.jpg"
                    alt="Sermon Album Cover"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Growing in Faith</h4>
                  <p className="text-white/80">Pastor James Wilson</p>
                  <p className="text-sm text-white/60 mt-1">45:30 • April 15, 2024</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative bg-white/20 rounded-full h-2">
                  <div className="absolute left-0 top-0 bg-yellow-500 h-2 w-1/3 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm">2:15</span>
                  <span className="text-sm">47:45</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button className="text-white hover:text-yellow-500 transition-colors">
                    <BackwardIcon className="h-8 w-8" />
                  </button>
                  <button className="bg-yellow-500 text-white rounded-full p-4 hover:bg-yellow-600 transition-colors">
                    <PlayIcon className="h-8 w-8" />
                  </button>
                  <button className="text-white hover:text-yellow-500 transition-colors">
                    <ForwardIcon className="h-8 w-8" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-600">Upcoming Events</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Join us for these special gatherings and opportunities to connect
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{event.title}</h3>
                  <div className="flex items-center text-gray-700 mb-2">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-2 text-yellow-600" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/events" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg hover:shadow-xl inline-flex items-center">
              View All Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ministries Overview */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-yellow-600">Our Ministries</h2>
            <div className="w-24 h-1 bg-green-500 mx-auto mt-4 mb-6"></div>
            <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
              There are many ways to get involved and grow in your faith at Elim Christian Garden
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            {ministries.map((ministry, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 z-10 group-hover:from-black/90 group-hover:to-black/30 transition-colors"></div>
                <Image
                  src={ministry.image} 
                  alt={ministry.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-80 object-cover object-center group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full inline-flex mb-4 shadow-lg">
                    {ministry.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{ministry.title}</h3>
                  <p className="text-white/90 mb-6 max-h-0 group-hover:max-h-24 opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                    {ministry.description}
                  </p>
                  <Link 
                    href={ministry.link} 
                    className="text-white font-medium bg-green-600/90 hover:bg-green-700 py-2 px-4 rounded-full inline-flex items-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                  >
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/ministries" className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg hover:shadow-xl inline-flex items-center">
              Explore All Ministries
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-700">Testimonials</h2>
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

      {/* Newsletter */}
      {/* <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100 rounded-full -mr-48 -mt-48 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full -ml-48 -mb-48 opacity-70"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-600 mb-2">Stay Connected</h2>
              <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4 mb-6"></div>
              <p className="text-gray-700 text-lg">
                Subscribe to our newsletter for updates, announcements, and spiritual encouragement
              </p>
            </div>
            
            <form className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
              >
                Subscribe
              </button>
            </form>
            
            <p className="text-sm text-gray-600 mt-4 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section> */}

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

      {/* Add styles for animations */}
      <style jsx global>{`
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"%3E%3C/path%3E%3C/svg%3E");
        }
        
        body {
          overflow-x: hidden;
        }
        
        /* Custom scrollbar to hide but maintain functionality */
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        /* Optional smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Animation for elements */
        .hover-float:hover {
          transform: translateY(-5px);
        }
        
        /* Gradient text for special headings */
        .gradient-text {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(90deg, #15803d, #1d4ed8);
        }
      `}</style>
    </main>
    </Layout>
  )
}